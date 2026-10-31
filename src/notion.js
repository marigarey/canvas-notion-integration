const {
  APIErrorCode,
  Client,
  isFullDatabase,
  isFullDataSource,
} = require("@notionhq/client");

const NOTION_VERSION = "2026-03-11";
const ITEM_TYPES = [
  { name: "Assignment", color: "blue" },
  { name: "Discussion", color: "green" },
  { name: "Quiz", color: "purple" },
];

class NotionSyncError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "NotionSyncError";
  }
}

function propertyDefinition(type) {
  switch (type) {
    case "date": return { date: {} };
    case "select": return { select: { options: [] } };
    case "checkbox": return { checkbox: {} };
    case "url": return { url: {} };
    case "number": return { number: { format: "number" } };
    case "rich_text": return { rich_text: {} };
    default: throw new NotionSyncError(`Unsupported Notion property type: ${type}`);
  }
}

function inspectSchema(dataSource) {
  if (!isFullDataSource(dataSource)) {
    throw new NotionSyncError("Notion returned an incomplete data source.");
  }

  const titleEntry = Object.entries(dataSource.properties)
    .find(([, property]) => property.type === "title");
  if (!titleEntry) {
    throw new NotionSyncError("The Notion data source has no title property.");
  }

  const required = {
    "Due Date": "date",
    Course: "select",
    Completion: "checkbox",
    URL: "url",
    ID: "number",
    "Canvas Key": "rich_text",
    Type: "select",
  };
  const updates = {};

  for (const [name, type] of Object.entries(required)) {
    const current = dataSource.properties[name];
    if (current && current.type !== type) {
      throw new NotionSyncError(`Notion property "${name}" must use the ${type} type.`);
    }
    if (!current) {
      updates[name] = name === "Type"
        ? { select: { options: ITEM_TYPES } }
        : propertyDefinition(type);
    }
  }

  return {
    titleProperty: titleEntry[0],
    hasCanvasKey: Boolean(dataSource.properties["Canvas Key"]),
    canFindLegacyItems: Boolean(dataSource.properties.ID && dataSource.properties.Course),
    updates,
  };
}

function propertiesForItem(item, titleProperty) {
  const properties = {
    [titleProperty]: {
      title: [{ type: "text", text: { content: item.name.slice(0, 2000) } }],
    },
    "Due Date": { date: item.dueAt ? { start: item.dueAt } : null },
    Course: { select: { name: item.courseName.slice(0, 100) } },
    Type: { select: { name: item.type } },
    URL: { url: item.url },
    "Canvas Key": {
      rich_text: [{ type: "text", text: { content: item.externalId } }],
    },
  };

  const numericId = Number(item.canvasId);
  if (Number.isSafeInteger(numericId)) {
    properties.ID = { number: numericId };
  }
  return properties;
}

class NotionSyncClient {
  constructor(accessToken, options = {}) {
    this.notion = options.client || new Client({
      auth: accessToken,
      notionVersion: NOTION_VERSION,
      timeoutMs: options.timeoutMs || 15_000,
      maxRetries: options.maxRetries ?? 2,
    });
  }

  async resolveExistingDestination(databaseId, dataSourceId) {
    try {
      if (dataSourceId) {
        const dataSource = await this.notion.dataSources.retrieve({
          data_source_id: dataSourceId,
        });
        return { databaseId, dataSourceId, dataSource };
      }

      const database = await this.notion.databases.retrieve({ database_id: databaseId });
      if (!isFullDatabase(database) || !database.data_sources[0]) {
        throw new NotionSyncError("The configured Notion database has no usable data source.");
      }
      const resolvedDataSourceId = database.data_sources[0].id;
      const dataSource = await this.notion.dataSources.retrieve({
        data_source_id: resolvedDataSourceId,
      });
      return { databaseId, dataSourceId: resolvedDataSourceId, dataSource };
    } catch (error) {
      if (error instanceof NotionSyncError) throw error;
      if (error?.code === APIErrorCode.ObjectNotFound) {
        throw new NotionSyncError(
          "Notion could not access the configured database. Share it with the integration or clear the saved database IDs.",
          error,
        );
      }
      if (error?.code === APIErrorCode.Unauthorized) {
        throw new NotionSyncError("Notion rejected the integration token.", error);
      }
      throw new NotionSyncError("Notion could not retrieve the configured database.", error);
    }
  }

  async createDestination(parentPageId) {
    let database;
    try {
      database = await this.notion.databases.create({
        parent: { type: "page_id", page_id: parentPageId },
        title: [{ type: "text", text: { content: "Canvas Assignments" } }],
        is_inline: true,
        initial_data_source: {
          properties: {
            "Assignment Name": { title: {} },
            "Due Date": { date: {} },
            Course: { select: { options: [] } },
            Type: { select: { options: ITEM_TYPES } },
            Completion: { checkbox: {} },
            URL: { url: {} },
            ID: { number: { format: "number" } },
            "Canvas Key": { rich_text: {} },
          },
        },
      });
    } catch (error) {
      if (error?.code === APIErrorCode.ObjectNotFound) {
        throw new NotionSyncError(
          "Notion could not access the parent page. Share the page with the integration and verify NOTION_PAGE.",
          error,
        );
      }
      if (error?.code === APIErrorCode.Unauthorized) {
        throw new NotionSyncError("Notion rejected the integration token.", error);
      }
      throw new NotionSyncError("Notion could not create the assignments database.", error);
    }

    if (!isFullDatabase(database) || !database.data_sources[0]) {
      throw new NotionSyncError("Notion created a database without a usable data source.");
    }
    const dataSourceId = database.data_sources[0].id;
    const dataSource = await this.notion.dataSources.retrieve({ data_source_id: dataSourceId });
    return { databaseId: database.id, dataSourceId, dataSource };
  }

  async ensureDestination({ parentPageId, databaseId, dataSourceId, dryRun = false }) {
    if (!databaseId) {
      if (dryRun) {
        return {
          databaseId: null,
          dataSourceId: null,
          titleProperty: "Assignment Name",
          hasCanvasKey: true,
          canFindLegacyItems: false,
          wouldCreateDatabase: true,
        };
      }
      const created = await this.createDestination(parentPageId);
      const schema = inspectSchema(created.dataSource);
      return { ...created, ...schema, wouldCreateDatabase: false };
    }

    const existing = await this.resolveExistingDestination(databaseId, dataSourceId);
    let schema = inspectSchema(existing.dataSource);
    if (!dryRun && Object.keys(schema.updates).length > 0) {
      await this.notion.dataSources.update({
        data_source_id: existing.dataSourceId,
        properties: schema.updates,
      });
      const updated = await this.notion.dataSources.retrieve({
        data_source_id: existing.dataSourceId,
      });
      schema = inspectSchema(updated);
    }
    return { ...existing, ...schema, wouldCreateDatabase: false };
  }

  async queryForItem(destination, item) {
    if (destination.hasCanvasKey) {
      const response = await this.notion.dataSources.query({
        data_source_id: destination.dataSourceId,
        filter: {
          property: "Canvas Key",
          rich_text: { equals: item.externalId },
        },
        page_size: 2,
      });
      if (response.results.length > 1) {
        throw new NotionSyncError("Notion contains duplicate entries for one Canvas item.");
      }
      if (response.results[0]?.object === "page") return response.results[0];
    }

    const numericId = Number(item.canvasId);
    if (destination.canFindLegacyItems && Number.isSafeInteger(numericId)) {
      const legacy = await this.notion.dataSources.query({
        data_source_id: destination.dataSourceId,
        filter: {
          and: [
            { property: "ID", number: { equals: numericId } },
            { property: "Course", select: { equals: item.courseName.slice(0, 100) } },
          ],
        },
        page_size: 2,
      });
      if (legacy.results.length > 1) {
        throw new NotionSyncError("Notion contains duplicate legacy entries for one Canvas item.");
      }
      if (legacy.results[0]?.object === "page") return legacy.results[0];
    }
    return null;
  }

  async sync(destination, items, { dryRun = false, onItemError = () => {} } = {}) {
    const result = { created: 0, updated: 0, failed: 0 };

    if (destination.wouldCreateDatabase) {
      result.created = items.length;
      return result;
    }

    for (const item of items) {
      try {
        const existing = await this.queryForItem(destination, item);
        if (existing) {
          if (!dryRun) {
            await this.notion.pages.update({
              page_id: existing.id,
              properties: propertiesForItem(item, destination.titleProperty),
            });
          }
          result.updated += 1;
        } else {
          if (!dryRun) {
            await this.notion.pages.create({
              parent: { type: "data_source_id", data_source_id: destination.dataSourceId },
              properties: propertiesForItem(item, destination.titleProperty),
            });
          }
          result.created += 1;
        }
      } catch (error) {
        result.failed += 1;
        onItemError(error);
      }
    }
    return result;
  }
}

module.exports = {
  NotionSyncClient,
  NotionSyncError,
  inspectSchema,
  propertiesForItem,
};

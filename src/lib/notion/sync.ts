import "server-only";

import { Client, isFullDatabase } from "@notionhq/client";
import type { SyncItem } from "@/lib/canvas/types";

type NotionDestination = {
  databaseId: string;
  dataSourceId: string;
};

export type SyncResult = {
  created: number;
  updated: number;
  failed: number;
};

function propertiesForItem(item: SyncItem) {
  return {
    Name: {
      title: [{ type: "text" as const, text: { content: item.name.slice(0, 2000) } }],
    },
    "Due Date": {
      date: item.dueAt ? { start: item.dueAt } : null,
    },
    Course: {
      select: { name: item.courseName.slice(0, 100) },
    },
    Type: {
      select: { name: item.type },
    },
    URL: {
      url: item.url,
    },
    "Canvas ID": {
      rich_text: [{ type: "text" as const, text: { content: item.externalId } }],
    },
  };
}

export class NotionSyncClient {
  private readonly notion: Client;

  constructor(accessToken: string) {
    this.notion = new Client({ auth: accessToken, notionVersion: "2026-03-11" });
  }

  async ensureDestination(
    parentPageId: string,
    existingDatabaseId: string | null,
    existingDataSourceId: string | null,
  ): Promise<NotionDestination> {
    if (existingDatabaseId && existingDataSourceId) {
      await this.notion.dataSources.retrieve({ data_source_id: existingDataSourceId });
      return { databaseId: existingDatabaseId, dataSourceId: existingDataSourceId };
    }

    const database = await this.notion.databases.create({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "Sprigate Assignments" } }],
      is_inline: true,
      initial_data_source: {
        properties: {
          Name: { title: {} },
          "Due Date": { date: {} },
          Course: { select: { options: [] } },
          Type: {
            select: {
              options: [
                { name: "Assignment", color: "blue" },
                { name: "Discussion", color: "green" },
                { name: "Quiz", color: "purple" },
              ],
            },
          },
          Completed: { checkbox: {} },
          URL: { url: {} },
          "Canvas ID": { rich_text: {} },
        },
      },
    });

    if (!isFullDatabase(database) || !database.data_sources[0]) {
      throw new Error("Notion created a database without a usable data source.");
    }

    return { databaseId: database.id, dataSourceId: database.data_sources[0].id };
  }

  async sync(dataSourceId: string, items: SyncItem[]): Promise<SyncResult> {
    const result: SyncResult = { created: 0, updated: 0, failed: 0 };

    for (const item of items) {
      try {
        const existing = await this.notion.dataSources.query({
          data_source_id: dataSourceId,
          filter: {
            property: "Canvas ID",
            rich_text: { equals: item.externalId },
          },
          page_size: 1,
        });

        const page = existing.results[0];
        if (page?.object === "page") {
          await this.notion.pages.update({
            page_id: page.id,
            properties: propertiesForItem(item),
          });
          result.updated += 1;
        } else {
          await this.notion.pages.create({
            parent: { type: "data_source_id", data_source_id: dataSourceId },
            properties: propertiesForItem(item),
          });
          result.created += 1;
        }
      } catch (error) {
        result.failed += 1;
        console.error("Failed to sync Canvas item", item.externalId, error);
      }
    }

    return result;
  }
}

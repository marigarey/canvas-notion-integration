const test = require("node:test");
const assert = require("node:assert/strict");
const { NotionSyncClient, inspectSchema } = require("../src/notion");

function completeDataSource(properties = {}) {
  return {
    object: "data_source",
    id: "source-id",
    title: [],
    properties: {
      Name: { id: "title", name: "Name", type: "title", title: {} },
      "Due Date": { id: "date", name: "Due Date", type: "date", date: {} },
      Course: { id: "course", name: "Course", type: "select", select: { options: [] } },
      Completion: { id: "done", name: "Completion", type: "checkbox", checkbox: {} },
      URL: { id: "url", name: "URL", type: "url", url: {} },
      ID: { id: "id", name: "ID", type: "number", number: { format: "number" } },
      "Canvas Key": { id: "key", name: "Canvas Key", type: "rich_text", rich_text: {} },
      Type: { id: "type", name: "Type", type: "select", select: { options: [] } },
      ...properties,
    },
  };
}

const item = {
  externalId: "7:assignment:42",
  canvasId: "42",
  type: "Assignment",
  name: "Read chapter one",
  courseName: "Biology",
  dueAt: null,
  url: "https://school.example/assignment/42",
};

test("schema inspection preserves any existing title property", () => {
  const schema = inspectSchema(completeDataSource());
  assert.equal(schema.titleProperty, "Name");
  assert.deepEqual(schema.updates, {});
});

test("an inaccessible configured database is not silently recreated", async () => {
  let createCalls = 0;
  const fakeClient = {
    databases: {
      retrieve: async () => {
        const error = new Error("missing");
        error.code = "object_not_found";
        throw error;
      },
      create: async () => { createCalls += 1; },
    },
    dataSources: {},
  };
  const notion = new NotionSyncClient("secret", { client: fakeClient });

  await assert.rejects(
    () => notion.ensureDestination({ parentPageId: "page", databaseId: "database" }),
    /could not access the configured database/,
  );
  assert.equal(createCalls, 0);
});

test("an existing Canvas key updates a page instead of creating a duplicate", async () => {
  let updates = 0;
  let creates = 0;
  let updateRequest;
  const fakeClient = {
    dataSources: {
      query: async () => ({ results: [{ object: "page", id: "page-id" }] }),
    },
    pages: {
      update: async (request) => {
        updates += 1;
        updateRequest = request;
      },
      create: async () => { creates += 1; },
    },
  };
  const notion = new NotionSyncClient("secret", { client: fakeClient });
  const result = await notion.sync({
    dataSourceId: "source-id",
    titleProperty: "Name",
    hasCanvasKey: true,
    canFindLegacyItems: true,
  }, [item]);

  assert.deepEqual(result, { created: 0, updated: 1, failed: 0 });
  assert.equal(updates, 1);
  assert.equal(creates, 0);
  assert.equal(
    updateRequest.properties["Canvas Key"].rich_text[0].text.content,
    "7:assignment:42",
  );
  assert.equal("Completion" in updateRequest.properties, false);
});

test("dry-run mode performs no Notion writes", async () => {
  let writes = 0;
  const fakeClient = {
    dataSources: { query: async () => ({ results: [] }) },
    pages: {
      update: async () => { writes += 1; },
      create: async () => { writes += 1; },
    },
  };
  const notion = new NotionSyncClient("secret", { client: fakeClient });
  const result = await notion.sync({
    dataSourceId: "source-id",
    titleProperty: "Name",
    hasCanvasKey: true,
    canFindLegacyItems: false,
  }, [item], { dryRun: true });

  assert.deepEqual(result, { created: 1, updated: 0, failed: 0 });
  assert.equal(writes, 0);
});

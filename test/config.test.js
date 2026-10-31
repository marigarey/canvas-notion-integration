const test = require("node:test");
const assert = require("node:assert/strict");
const { getConfig, normalizeCanvasUrl } = require("../src/config");

const validEnvironment = {
  CANVAS_API_URL: "https://school.instructure.com/",
  CANVAS_API: "canvas-secret",
  NOTION_API: "notion-secret",
  NOTION_PAGE: "page-id",
};

test("configuration accepts a secure Canvas URL and required credentials", () => {
  const config = getConfig(validEnvironment);
  assert.equal(config.canvasUrl, "https://school.instructure.com");
  assert.equal(config.databaseId, null);
  assert.equal(config.dataSourceId, null);
});

test("configuration rejects missing credentials", () => {
  assert.throws(
    () => getConfig({ ...validEnvironment, CANVAS_API: "" }),
    /CANVAS_API is required/,
  );
});

test("configuration requires HTTPS and rejects URL credentials", () => {
  assert.throws(() => normalizeCanvasUrl("http://school.example"), /must use HTTPS/);
  assert.throws(
    () => normalizeCanvasUrl("https://user:password@school.example"),
    /must not contain credentials/,
  );
});

test("a Notion data source cannot be configured without its database", () => {
  assert.throws(
    () => getConfig({ ...validEnvironment, NOTION_DATA_SOURCE: "source-id" }),
    /NOTION_DATABASE is required/,
  );
});

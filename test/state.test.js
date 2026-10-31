const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadState, saveState } = require("../src/state");

test("state is stored with owner-only permissions", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-notion-state-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "state.json");
  const state = { databaseId: "database", dataSourceId: "source" };

  saveState(file, state);
  assert.deepEqual(loadState(file), state);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});

test("missing state starts empty", () => {
  assert.deepEqual(loadState(path.join(os.tmpdir(), "missing-canvas-notion-state.json")), {
    databaseId: null,
    dataSourceId: null,
  });
});

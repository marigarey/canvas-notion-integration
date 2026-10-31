const test = require("node:test");
const assert = require("node:assert/strict");
const { parseArguments, resolveDestinationIds } = require("../src/main");

test("CLI supports only the documented dry-run option", () => {
  assert.deepEqual(parseArguments([]), { dryRun: false });
  assert.deepEqual(parseArguments(["--dry-run"]), { dryRun: true });
  assert.throws(() => parseArguments(["--unknown"]), /Unknown option/);
});

test("a database override never reuses a data source from different saved state", () => {
  assert.deepEqual(resolveDestinationIds(
    { databaseId: "configured-database", dataSourceId: null },
    { databaseId: "saved-database", dataSourceId: "saved-source" },
  ), {
    databaseId: "configured-database",
    dataSourceId: null,
  });
});

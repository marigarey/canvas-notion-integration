const fs = require("node:fs");
const path = require("node:path");

function loadState(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return {
      databaseId: typeof parsed.databaseId === "string" ? parsed.databaseId : null,
      dataSourceId: typeof parsed.dataSourceId === "string" ? parsed.dataSourceId : null,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { databaseId: null, dataSourceId: null };
    }
    throw new Error(`Unable to read local state: ${error.message}`);
  }
}

function saveState(filePath, state) {
  const directory = path.dirname(filePath);
  const temporaryFile = `${filePath}.tmp`;
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporaryFile, filePath);
  fs.chmodSync(filePath, 0o600);
}

module.exports = { loadState, saveState };

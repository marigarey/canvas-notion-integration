const path = require("node:path");

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function loadEnvironmentFile(filePath = path.resolve(process.cwd(), ".env")) {
  try {
    process.loadEnvFile(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw new ConfigurationError(`Unable to load the environment file: ${error.message}`);
  }
  return true;
}

function requiredValue(environment, name) {
  const value = environment[name]?.trim();
  if (!value) {
    throw new ConfigurationError(`${name} is required.`);
  }
  return value;
}

function optionalIdentifier(environment, name) {
  const value = environment[name]?.trim();
  if (!value || value.toLowerCase() === "invalid") {
    return null;
  }
  return value.replace(/^['"]|['"]$/g, "");
}

function normalizeCanvasUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigurationError("CANVAS_API_URL must be a valid URL.");
  }

  if (url.protocol !== "https:") {
    throw new ConfigurationError("CANVAS_API_URL must use HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new ConfigurationError("CANVAS_API_URL must not contain credentials, a query, or a fragment.");
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

function getConfig(environment = process.env) {
  const databaseId = optionalIdentifier(environment, "NOTION_DATABASE");
  const dataSourceId = optionalIdentifier(environment, "NOTION_DATA_SOURCE");

  if (dataSourceId && !databaseId) {
    throw new ConfigurationError("NOTION_DATABASE is required when NOTION_DATA_SOURCE is set.");
  }

  return Object.freeze({
    canvasUrl: normalizeCanvasUrl(requiredValue(environment, "CANVAS_API_URL")),
    canvasToken: requiredValue(environment, "CANVAS_API"),
    notionToken: requiredValue(environment, "NOTION_API"),
    notionPageId: requiredValue(environment, "NOTION_PAGE"),
    databaseId,
    dataSourceId,
    stateFile: environment.CANVAS_NOTION_STATE_FILE?.trim() || path.resolve(process.cwd(), ".canvas-notion-state.json"),
  });
}

module.exports = {
  ConfigurationError,
  getConfig,
  loadEnvironmentFile,
  normalizeCanvasUrl,
};

const { CanvasClient } = require("./canvas");
const { getConfig, loadEnvironmentFile } = require("./config");
const { safeErrorMessage } = require("./errors");
const { NotionSyncClient } = require("./notion");
const { loadState, saveState } = require("./state");

function parseArguments(argumentsList) {
  const allowed = new Set(["--dry-run"]);
  const unknown = argumentsList.filter((argument) => !allowed.has(argument));
  if (unknown.length > 0) {
    throw new Error(`Unknown option: ${unknown[0]}`);
  }
  return { dryRun: argumentsList.includes("--dry-run") };
}

function resolveDestinationIds(config, state) {
  const databaseId = config.databaseId || state.databaseId;
  const dataSourceId = config.dataSourceId || (
    databaseId && databaseId === state.databaseId ? state.dataSourceId : null
  );
  return { databaseId, dataSourceId };
}

async function run(options = {}) {
  const config = options.config || getConfig();
  const dryRun = Boolean(options.dryRun);
  const state = options.state || loadState(config.stateFile);
  const canvas = options.canvas || new CanvasClient(config.canvasUrl, config.canvasToken);
  const notion = options.notion || new NotionSyncClient(config.notionToken);
  const { databaseId, dataSourceId } = resolveDestinationIds(config, state);

  console.log(dryRun ? "Starting read-only sync preview..." : "Starting Canvas to Notion sync...");
  const courses = await canvas.getCourses();
  console.log(`Canvas returned ${courses.length} active course(s).`);

  const destination = await notion.ensureDestination({
    parentPageId: config.notionPageId,
    databaseId,
    dataSourceId,
    dryRun,
  });

  if (!dryRun && (
    destination.databaseId !== state.databaseId ||
    destination.dataSourceId !== state.dataSourceId
  )) {
    saveState(config.stateFile, {
      databaseId: destination.databaseId,
      dataSourceId: destination.dataSourceId,
    });
  }

  const items = [];
  for (const course of courses) {
    items.push(...await canvas.getSyncItems(course));
  }
  console.log(`Canvas returned ${items.length} assignment and discussion item(s).`);

  let loggedItemError = false;
  const result = await notion.sync(destination, items, {
    dryRun,
    onItemError(error) {
      if (!loggedItemError) {
        console.error(`One or more Notion items failed: ${safeErrorMessage(error, [config.notionToken])}`);
        loggedItemError = true;
      }
    },
  });

  const action = dryRun ? "would create" : "created";
  const updateAction = dryRun ? "would update" : "updated";
  console.log(`Sync summary: ${action} ${result.created}, ${updateAction} ${result.updated}, failed ${result.failed}.`);

  if (result.failed > 0) {
    throw new Error(`Sync failed for ${result.failed} item(s).`);
  }
  return result;
}

async function main(argumentsList = process.argv.slice(2)) {
  let config;
  try {
    loadEnvironmentFile();
    config = getConfig();
    const { dryRun } = parseArguments(argumentsList);
    await run({ config, dryRun });
  } catch (error) {
    const secrets = [
      config?.canvasToken || process.env.CANVAS_API,
      config?.notionToken || process.env.NOTION_API,
    ];
    console.error(`ERROR: ${safeErrorMessage(error, secrets)}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArguments, resolveDestinationIds, run };

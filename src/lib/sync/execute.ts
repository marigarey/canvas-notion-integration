import "server-only";

import { CanvasClient } from "@/lib/canvas/client";
import type { UserIntegration } from "@/lib/integrations/types";
import { NotionSyncClient } from "@/lib/notion/sync";
import { decryptCredential } from "@/lib/security/credentials";

export async function executeSync(integration: UserIntegration) {
  if (
    !integration.canvas_base_url ||
    !integration.canvas_token_ciphertext ||
    !integration.notion_access_token_ciphertext ||
    !integration.notion_page_id
  ) {
    throw new Error("Integration setup is incomplete.");
  }

  const canvas = new CanvasClient(
    integration.canvas_base_url,
    decryptCredential(integration.canvas_token_ciphertext),
  );
  const notion = new NotionSyncClient(
    decryptCredential(integration.notion_access_token_ciphertext),
  );
  const courses = (await canvas.getCourses()).filter((course) =>
    integration.selected_course_ids.includes(course.id),
  );
  const itemGroups = await Promise.all(courses.map((course) => canvas.getSyncItems(course)));
  const items = itemGroups.flat();
  const destination = await notion.ensureDestination(
    integration.notion_page_id,
    integration.notion_database_id,
    integration.notion_data_source_id,
  );
  const result = await notion.sync(destination.dataSourceId, items);

  return { destination, result, itemCount: items.length };
}

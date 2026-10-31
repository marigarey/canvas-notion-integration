import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  getDueIntegrations,
  updateAdminSyncState,
} from "@/lib/integrations/admin-repository";
import { getNextSyncAt } from "@/lib/integrations/schedule";
import { executeSync } from "@/lib/sync/execute";

export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueIntegrations = await getDueIntegrations();
  const summary = { processed: 0, succeeded: 0, failed: 0 };

  for (const integration of dueIntegrations) {
    summary.processed += 1;
    const nextSyncAt = getNextSyncAt(integration.sync_frequency);

    try {
      const { destination, result } = await executeSync(integration);
      const failed = result.failed > 0;
      await updateAdminSyncState(
        integration.user_id,
        failed ? "failed" : "succeeded",
        `Created ${result.created}, updated ${result.updated}, failed ${result.failed}.`,
        {
          notion_database_id: destination.databaseId,
          notion_data_source_id: destination.dataSourceId,
          last_synced_at: new Date().toISOString(),
          next_sync_at: nextSyncAt,
        },
      );
      if (failed) summary.failed += 1;
      else summary.succeeded += 1;
    } catch (error) {
      console.error("Scheduled sync failed", integration.user_id, error);
      await updateAdminSyncState(
        integration.user_id,
        "failed",
        "Scheduled synchronization failed. Check the saved connections.",
        { next_sync_at: nextSyncAt },
      );
      summary.failed += 1;
    }
  }

  return NextResponse.json(summary);
}

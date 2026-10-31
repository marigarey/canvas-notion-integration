'use server'

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { CanvasApiError, CanvasClient } from "@/lib/canvas/client";
import { decryptCredential, encryptCredential } from "@/lib/security/credentials";
import { deleteIntegration, getIntegration, updateSyncState, upsertIntegration } from "@/lib/integrations/repository";
import { getNextSyncAt } from "@/lib/integrations/schedule";
import type { SyncFrequency } from "@/lib/integrations/types";
import { parseNotionPageId } from "@/lib/notion/page-id";
import { executeSync } from "@/lib/sync/execute";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const connectionSchema = z.object({
  canvasUrl: z.string().trim().min(1),
  canvasToken: z.string().trim().optional(),
  notionPage: z.string().trim().min(1),
});

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveConnections(formData: FormData) {
  const user = await requireUser();
  const existing = await getIntegration(user.id);
  const parsed = connectionSchema.safeParse({
    canvasUrl: formData.get("canvasUrl"),
    canvasToken: formData.get("canvasToken"),
    notionPage: formData.get("notionPage"),
  });

  if (!parsed.success) {
    errorRedirect("/dashboard/setup", "Complete all connection fields.");
  }

  const token = parsed.data.canvasToken || (
    existing?.canvas_token_ciphertext
      ? decryptCredential(existing.canvas_token_ciphertext)
      : ""
  );
  if (!token) {
    errorRedirect("/dashboard/setup", "Enter a Canvas access token.");
  }

  try {
    const client = new CanvasClient(parsed.data.canvasUrl, token);
    await client.getProfile();
    const courses = await client.getCourses();
    const pageId = parseNotionPageId(parsed.data.notionPage);

    await upsertIntegration(user.id, {
      canvas_base_url: client.baseUrl,
      canvas_token_ciphertext: encryptCredential(token),
      notion_page_id: pageId,
      selected_course_ids: existing
        ? existing.selected_course_ids
        : courses.map((course) => course.id),
    });
  } catch (error) {
    const message = error instanceof CanvasApiError || error instanceof Error
      ? error.message
      : "Unable to verify the Canvas connection.";
    errorRedirect("/dashboard/setup", message);
  }

  redirect("/dashboard/setup?saved=connections");
}

export async function saveCourseSelection(formData: FormData) {
  const user = await requireUser();
  const integration = await getIntegration(user.id);
  if (!integration?.canvas_base_url || !integration.canvas_token_ciphertext) {
    errorRedirect("/dashboard/setup", "Connect Canvas before selecting courses.");
  }

  const canvas = new CanvasClient(
    integration.canvas_base_url,
    decryptCredential(integration.canvas_token_ciphertext),
  );
  const validCourseIds = new Set((await canvas.getCourses()).map((course) => course.id));
  const selectedCourseIds = formData
    .getAll("courseId")
    .map(String)
    .filter((courseId) => validCourseIds.has(courseId));

  await upsertIntegration(user.id, { selected_course_ids: selectedCourseIds });
  redirect("/dashboard/setup?saved=courses");
}

export async function saveSchedule(formData: FormData) {
  const user = await requireUser();
  const parsed = z.enum(["manual", "daily", "weekly", "monthly"]).safeParse(
    formData.get("frequency"),
  );
  if (!parsed.success) {
    errorRedirect("/dashboard/setup", "Choose a valid synchronization schedule.");
  }

  const frequency = parsed.data as SyncFrequency;
  if (frequency !== "manual") {
    const integration = await getIntegration(user.id);
    if (
      !integration?.canvas_token_ciphertext ||
      !integration.notion_access_token_ciphertext ||
      !integration.notion_page_id ||
      !integration.selected_course_ids.length
    ) {
      errorRedirect("/dashboard/setup", "Complete both connections and select a course before enabling automatic sync.");
    }
  }

  await upsertIntegration(user.id, {
    sync_frequency: frequency,
    next_sync_at: getNextSyncAt(frequency),
  });
  redirect("/dashboard/setup?saved=schedule");
}

export async function runManualSync() {
  const user = await requireUser();
  const integration = await getIntegration(user.id);

  if (
    !integration?.canvas_base_url ||
    !integration.canvas_token_ciphertext ||
    !integration.notion_access_token_ciphertext ||
    !integration.notion_page_id
  ) {
    errorRedirect("/dashboard", "Complete the Canvas and Notion setup before syncing.");
  }

  const syncStartedAt = new Date(integration.updated_at).getTime();
  const runningRecently = integration.last_sync_status === "running" &&
    Date.now() - syncStartedAt < 15 * 60 * 1000;
  if (runningRecently) {
    errorRedirect("/dashboard", "A synchronization is already running.");
  }

  await updateSyncState(user.id, "running", "Synchronization is running.");

  try {
    const { destination, result } = await executeSync(integration);

    await upsertIntegration(user.id, {
      notion_database_id: destination.databaseId,
      notion_data_source_id: destination.dataSourceId,
      next_sync_at: getNextSyncAt(integration.sync_frequency),
    });

    const message = `Created ${result.created}, updated ${result.updated}, failed ${result.failed}.`;
    await updateSyncState(user.id, result.failed ? "failed" : "succeeded", message, new Date().toISOString());
  } catch (error) {
    console.error("Manual sync failed", error);
    await updateSyncState(user.id, "failed", "Synchronization failed. Check your connections and try again.");
    errorRedirect("/dashboard", "Synchronization failed.");
  }

  redirect("/dashboard?synced=true");
}

export async function disconnectIntegrations(formData: FormData) {
  const user = await requireUser();
  if (formData.get("confirmation") !== "DISCONNECT") {
    errorRedirect("/dashboard/account", "Type DISCONNECT to remove the saved connections.");
  }

  await deleteIntegration(user.id);
  redirect("/dashboard/account?disconnected=true");
}

export async function deleteAccount(formData: FormData) {
  const user = await requireUser();
  if (formData.get("confirmation") !== "DELETE") {
    errorRedirect("/dashboard/account", "Type DELETE to permanently remove the account.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    errorRedirect("/dashboard/account", "The account could not be deleted.");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?accountDeleted=true");
}

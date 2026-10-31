import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SyncStatus, UserIntegration } from "./types";

export async function getDueIntegrations(limit = 10) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_due_integrations", { batch_size: limit });

  if (error) {
    throw new Error(`Unable to load due integrations: ${error.message}`);
  }

  return (data ?? []) as UserIntegration[];
}

export async function updateIntegrationAsAdmin(
  userId: string,
  values: Partial<Omit<UserIntegration, "user_id" | "created_at" | "updated_at">>,
) {
  const admin = createAdminClient();
  const { error } = await admin.from("user_integrations").update(values).eq("user_id", userId);
  if (error) throw new Error(`Unable to update scheduled integration: ${error.message}`);
}

export async function updateAdminSyncState(
  userId: string,
  status: SyncStatus,
  message: string,
  values: Partial<UserIntegration> = {},
) {
  return updateIntegrationAsAdmin(userId, {
    ...values,
    last_sync_status: status,
    last_sync_message: message,
  });
}

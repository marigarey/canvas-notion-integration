import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { SyncStatus, UserIntegration } from "./types";

export async function getIntegration(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load integration settings: ${error.message}`);
  }

  return data as UserIntegration | null;
}

export async function upsertIntegration(
  userId: string,
  values: Partial<Omit<UserIntegration, "user_id" | "created_at" | "updated_at">>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_integrations")
    .upsert({ user_id: userId, ...values }, { onConflict: "user_id" });

  if (error) {
    throw new Error(`Unable to save integration settings: ${error.message}`);
  }
}

export async function updateSyncState(
  userId: string,
  status: SyncStatus,
  message: string,
  completedAt?: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_integrations")
    .update({
      last_sync_status: status,
      last_sync_message: message,
      ...(completedAt ? { last_synced_at: completedAt } : {}),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to update sync status: ${error.message}`);
  }
}

export async function deleteIntegration(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_integrations").delete().eq("user_id", userId);
  if (error) throw new Error(`Unable to disconnect integrations: ${error.message}`);
}

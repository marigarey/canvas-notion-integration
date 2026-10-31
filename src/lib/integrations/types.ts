export type SyncFrequency = "manual" | "daily" | "weekly" | "monthly";
export type SyncStatus = "running" | "succeeded" | "failed";

export type UserIntegration = {
  user_id: string;
  canvas_base_url: string | null;
  canvas_token_ciphertext: string | null;
  notion_access_token_ciphertext: string | null;
  notion_page_id: string | null;
  notion_database_id: string | null;
  notion_data_source_id: string | null;
  selected_course_ids: string[];
  sync_frequency: SyncFrequency;
  next_sync_at: string | null;
  last_synced_at: string | null;
  last_sync_status: SyncStatus | null;
  last_sync_message: string | null;
  created_at: string;
  updated_at: string;
};

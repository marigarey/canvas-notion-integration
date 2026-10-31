import type { SyncFrequency } from "./types";

export function getNextSyncAt(frequency: SyncFrequency, from = new Date()) {
  if (frequency === "manual") return null;

  const next = new Date(from);
  if (frequency === "daily") next.setUTCDate(next.getUTCDate() + 1);
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === "monthly") {
    const day = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const lastDayOfTargetMonth = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
    next.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  }
  return next.toISOString();
}

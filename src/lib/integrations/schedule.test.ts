import { describe, expect, it } from "vitest";
import { getNextSyncAt } from "./schedule";

describe("getNextSyncAt", () => {
  const start = new Date("2026-01-31T12:30:00.000Z");

  it("does not schedule manual integrations", () => {
    expect(getNextSyncAt("manual", start)).toBeNull();
  });

  it("advances daily and weekly schedules", () => {
    expect(getNextSyncAt("daily", start)).toBe("2026-02-01T12:30:00.000Z");
    expect(getNextSyncAt("weekly", start)).toBe("2026-02-07T12:30:00.000Z");
  });

  it("clamps monthly schedules to the last day of shorter months", () => {
    expect(getNextSyncAt("monthly", start)).toBe("2026-02-28T12:30:00.000Z");
  });
});

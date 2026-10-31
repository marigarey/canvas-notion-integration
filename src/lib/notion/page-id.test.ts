import { describe, expect, it } from "vitest";
import { parseNotionPageId } from "./page-id";

describe("parseNotionPageId", () => {
  const compactId = "0123456789abcdef0123456789abcdef";

  it("accepts a raw UUID", () => {
    expect(parseNotionPageId("01234567-89ab-cdef-0123-456789abcdef")).toBe(compactId);
  });

  it("extracts an ID from a Notion URL", () => {
    expect(parseNotionPageId(`https://www.notion.so/Assignments-${compactId}?v=123`)).toBe(compactId);
  });

  it("rejects unrelated URLs", () => {
    expect(() => parseNotionPageId("https://www.notion.so/no-page-id")).toThrow("valid Notion page");
  });
});

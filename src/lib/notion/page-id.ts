export function parseNotionPageId(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/([a-f\d]{32}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})(?:\?|$)/i);

  if (!match) {
    throw new Error("Enter a valid Notion page URL or page ID.");
  }

  return match[1].replaceAll("-", "");
}

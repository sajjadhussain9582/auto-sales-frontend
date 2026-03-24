import type { ContactImportPreview, ContactImportRowRaw } from "@/types/contact-import";

export function parseJsonText(text: string, maxRows = 2000): ContactImportPreview {
  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of objects");
  }
  const rows: ContactImportRowRaw[] = [];
  const headersSet = new Set<string>();

  for (const item of parsed.slice(0, maxRows)) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;
    const row: ContactImportRowRaw = {};
    for (const [k, v] of Object.entries(o)) {
      headersSet.add(k);
      row[k] = v == null ? "" : String(v);
    }
    rows.push(row);
  }

  const headers = [...headersSet].sort();
  return { source: "json", headers, rows };
}


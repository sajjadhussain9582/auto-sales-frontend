import type {
  ContactImportField,
  ContactImportMapping,
  ContactImportRowNormalized,
  ContactImportRowRaw,
} from "@/types/contact-import";

const FIELD_HINTS: Record<ContactImportField, string[]> = {
  name: ["name", "full_name", "fullname", "first_name", "first", "contact_name"],
  email: ["email", "email_address", "mail"],
  phone: ["phone", "phone_number", "mobile", "cell"],
  company: ["company", "business", "organization", "org"],
  tags: ["tags", "tag", "labels"],
  stage: ["stage", "pipeline_stage", "status"],
  notes: ["notes", "note", "comment", "comments"],
  ghl_contact_id: ["ghl_contact_id", "ghl_id", "ghlContactId"],
};

function normKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, "_");
}

export function suggestMapping(headers: string[]): ContactImportMapping {
  const byNorm = new Map<string, string>();
  headers.forEach((h) => byNorm.set(normKey(h), h));
  const mapping: ContactImportMapping = {};
  (Object.keys(FIELD_HINTS) as ContactImportField[]).forEach((field) => {
    const hints = FIELD_HINTS[field];
    for (const hint of hints) {
      const found = byNorm.get(normKey(hint));
      if (found) {
        mapping[field] = found;
        break;
      }
    }
  });
  return mapping;
}

function splitTags(v: string): string[] | undefined {
  const raw = v
    .split(/[;,|]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return raw.length ? raw : undefined;
}

export function normalizeImportRows(args: {
  rows: ContactImportRowRaw[];
  mapping: ContactImportMapping;
  defaultStage?: string;
  tagsToApply?: string[];
  upsertKey: "email" | "email_or_phone";
}): ContactImportRowNormalized[] {
  const { rows, mapping, defaultStage, tagsToApply, upsertKey } = args;

  return rows.map((raw, idx) => {
    const errors: string[] = [];
    const get = (field: ContactImportField): string =>
      mapping[field] ? (raw[mapping[field]!] ?? "").trim() : "";

    const name = get("name");
    const email = get("email");
    const phone = get("phone");
    const company = get("company");
    const stage = get("stage") || defaultStage || "";
    const notes = get("notes");
    const tags = [...(splitTags(get("tags")) ?? []), ...(tagsToApply ?? [])];
    const ghl = get("ghl_contact_id");

    if (!name && !email) errors.push("Missing name (or email as fallback)");
    if (upsertKey === "email" && !email) errors.push("Missing email (upsert key)");
    if (upsertKey === "email_or_phone" && !email && !phone)
      errors.push("Missing email or phone (upsert key)");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("Invalid email format");

    return {
      rowNumber: idx + 1,
      raw,
      errors,
      contact: {
        id: email || phone || `row-${idx + 1}`,
        name: name || email || "Unknown",
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        stage: stage || undefined,
        tags: tags.length ? Array.from(new Set(tags)) : undefined,
        notes: notes || undefined,
        externalIds: ghl ? { ghl_contact_id: ghl } : undefined,
      },
    };
  });
}


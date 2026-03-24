import type { Contact } from "@/types/contact";

export type ImportSource = "csv" | "json";

export type ContactImportField =
  | "name"
  | "email"
  | "phone"
  | "company"
  | "tags"
  | "stage"
  | "notes"
  | "ghl_contact_id";

export type ContactImportMapping = Partial<Record<ContactImportField, string>>;

export type ContactImportRowRaw = Record<string, string>;

export type ContactImportRowNormalized = {
  /** 1-based row number in source file (header excluded for CSV) */
  rowNumber: number;
  /** Derived contact payload */
  contact: Contact & { externalIds?: { ghl_contact_id?: string } };
  /** Raw row for debugging / UI */
  raw: ContactImportRowRaw;
  /** Validation issues for this row */
  errors: string[];
};

export type ContactImportPreview = {
  source: ImportSource;
  headers: string[];
  rows: ContactImportRowRaw[];
};


import { apiRequest, ApiError } from "@/lib/api-client";
import { isMockDataEnabled } from "@/lib/feature-flags";
import type { Contact } from "@/types/contact";
import { MOCK_CONTACTS } from "@/utils/mock-dashboard-data";

export type ContactImportPayload = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  stage?: string;
  tags?: string[];
  notes?: string;
  external_ids?: { ghl_contact_id?: string };
};

export type ContactImportResult = {
  created_count?: number;
  updated_count?: number;
  errors?: Array<{ row?: number; message: string }>;
};

function normalizeContact(raw: Record<string, unknown>): Contact {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.email ?? "Unknown"),
    email: raw.email !== undefined ? String(raw.email) : undefined,
    phone: raw.phone !== undefined ? String(raw.phone) : undefined,
    company: raw.company !== undefined ? String(raw.company) : undefined,
    channel: raw.channel !== undefined ? String(raw.channel) : undefined,
    stage: raw.stage !== undefined ? String(raw.stage) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : undefined,
    notes: raw.notes !== undefined ? String(raw.notes) : undefined,
    ghlContactId:
      raw.ghl_contact_id !== undefined
        ? String(raw.ghl_contact_id)
        : raw.ghlContactId !== undefined
          ? String(raw.ghlContactId)
          : undefined,
    conversationIds: Array.isArray(raw.conversation_ids)
      ? raw.conversation_ids.map(String)
      : Array.isArray(raw.conversationIds)
        ? raw.conversationIds.map(String)
        : undefined,
  };
}

export async function listContacts(search?: string): Promise<Contact[]> {
  if (isMockDataEnabled()) {
    const q = search?.toLowerCase().trim();
    if (!q) return [...MOCK_CONTACTS];
    return MOCK_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
    );
  }

  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  try {
    const data = await apiRequest<unknown>(`/contacts${q}`);
    if (!Array.isArray(data)) return [];
    return data.map((x) => normalizeContact(x as Record<string, unknown>));
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return [];
    throw e;
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  if (isMockDataEnabled()) {
    return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
  }
  try {
    const raw = await apiRequest<Record<string, unknown>>(`/contacts/${encodeURIComponent(id)}`);
    return normalizeContact(raw);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const contactsService = {
  list: listContacts,
  get: getContact,

  /** Phase 2+ (backend dependency): bulk upsert contacts from import. */
  async importContacts(
    rows: ContactImportPayload[],
    opts: { upsertKey: "email" | "email_or_phone" }
  ): Promise<ContactImportResult> {
    if (isMockDataEnabled()) {
      return { created_count: rows.length, updated_count: 0, errors: [] };
    }
    try {
      return await apiRequest<ContactImportResult>("/contacts/import", {
        method: "POST",
        body: JSON.stringify({
          rows,
          upsert_key: opts.upsertKey,
        }),
      });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        throw new Error(
          "Contacts import API is not available yet. Backend needs POST /contacts/import (bulk upsert) or POST /contacts."
        );
      }
      throw e;
    }
  },
};

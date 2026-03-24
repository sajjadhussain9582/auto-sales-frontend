import { apiRequest, ApiError } from "@/lib/api-client";
import { isMockDataEnabled } from "@/lib/feature-flags";
import type { InboxThreadRow } from "@/types/inbox";
import { MOCK_INBOX_ROWS } from "@/utils/mock-dashboard-data";
import { getRecentConversations } from "@/utils/recent-conversations";

function parseContactPreview(cp: unknown): {
  name: string;
  subtitle?: string;
  preview?: import("@/types/inbox").InboxContactPreview;
} {
  if (typeof cp === "object" && cp !== null) {
    const o = cp as Record<string, unknown>;
    const username = o.username != null ? String(o.username) : "";
    const email = o.email != null ? String(o.email) : "";
    const company = o.company != null ? String(o.company) : "";
    const name = username || email || "Contact";
    const subtitle =
      company || (username && email ? email : username ? email || undefined : undefined);
    return {
      name,
      subtitle: subtitle || undefined,
      preview: {
        uuid: o.uuid != null ? String(o.uuid) : undefined,
        email: email || undefined,
        username: username || undefined,
        company: company || undefined,
      },
    };
  }
  if (typeof cp === "string" && cp.trim()) {
    return { name: cp.trim() };
  }
  return { name: "Contact" };
}

function recentToRows(): InboxThreadRow[] {
  return getRecentConversations().map((r) => ({
    uuid: r.id,
    contactName: "Open thread",
    contactSubtitle: r.channel ? `Channel: ${r.channel}` : undefined,
    lastMessagePreview: "From intake",
    updatedAt: r.savedAt,
    channel: r.channel,
  }));
}

function normalizeList(raw: unknown): InboxThreadRow[] {
  if (!Array.isArray(raw)) return [];
  const out: InboxThreadRow[] = [];
  for (const item of raw as Record<string, unknown>[]) {
    const uuid =
      item.uuid != null && String(item.uuid).trim()
        ? String(item.uuid).trim()
        : item.id != null
          ? String(item.id)
          : "";
    if (!uuid) continue;
    const cp = parseContactPreview(item.contact_preview);
    out.push({
      uuid,
      legacyId: item.id != null && String(item.id) !== uuid ? String(item.id) : undefined,
      contactPreview: cp.preview,
      contactName: cp.name,
      contactSubtitle: cp.subtitle,
      lastMessagePreview:
        item.last_message_preview != null
          ? String(item.last_message_preview)
          : item.last_message != null
            ? String(item.last_message)
            : undefined,
      status: item.status !== undefined ? String(item.status) : undefined,
      channel: item.channel !== undefined ? String(item.channel) : undefined,
      isEscalated: Boolean(item.is_escalated),
      updatedAt:
        item.updated_at != null
          ? String(item.updated_at)
          : item.last_activity_at != null
            ? String(item.last_activity_at)
            : undefined,
    });
  }
  return out;
}

function mergeByUuid(a: InboxThreadRow[], b: InboxThreadRow[]): InboxThreadRow[] {
  const seen = new Set<string>();
  const out: InboxThreadRow[] = [];
  for (const row of [...a, ...b]) {
    if (!row.uuid || seen.has(row.uuid)) continue;
    seen.add(row.uuid);
    out.push(row);
  }
  return out;
}

/**
 * Inbox list. Uses GET /conversations when available; otherwise recent + optional mocks.
 */
export async function listInboxThreads(): Promise<InboxThreadRow[]> {
  const recent = typeof window !== "undefined" ? recentToRows() : [];

  if (isMockDataEnabled()) {
    return mergeByUuid(MOCK_INBOX_ROWS, recent);
  }

  try {
    const data = await apiRequest<unknown>("/conversations");
    const fromApi = normalizeList(data);
    if (fromApi.length > 0) return mergeByUuid(fromApi, recent);
  } catch (e) {
    if (e instanceof ApiError && e.status !== 404 && e.status !== 405) {
      throw e;
    }
  }

  return recent.length > 0 ? recent : [];
}

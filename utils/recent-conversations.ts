import { STORAGE_KEYS } from "@/utils/storage-keys";

export type RecentConversationEntry = {
  id: string;
  channel?: string;
  savedAt?: string;
};

function parseList(raw: string | null): RecentConversationEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is RecentConversationEntry =>
        typeof x === "object" &&
        x !== null &&
        "id" in x &&
        typeof (x as RecentConversationEntry).id === "string"
    );
  } catch {
    return [];
  }
}

export function getRecentConversations(): RecentConversationEntry[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(STORAGE_KEYS.recentConversationIds));
}

export function pushRecentConversation(entry: RecentConversationEntry): void {
  if (typeof window === "undefined") return;
  const list = getRecentConversations().filter((e) => e.id !== entry.id);
  list.unshift({ ...entry, savedAt: entry.savedAt || new Date().toISOString() });
  const trimmed = list.slice(0, 25);
  localStorage.setItem(STORAGE_KEYS.recentConversationIds, JSON.stringify(trimmed));
}

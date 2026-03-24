"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Filter,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Search,
  SendHorizonal,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { conversationsService } from "@/services/conversations.service";
import { listInboxThreads } from "@/services/messages.service";
import type { InboxThreadRow } from "@/types/inbox";
import type { ConversationDetail, ConversationMessage } from "@/types/conversation";
import { cn } from "@/lib/utils";
import {
  formatMessageDateLabel,
  formatMessageTime,
  initialsFromName,
  isConversationUuid,
} from "@/utils/messages-format";

export function MessagesInboxSplit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramC = searchParams.get("c")?.trim() ?? "";

  const [rows, setRows] = useState<InboxThreadRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [readUuids, setReadUuids] = useState<Set<string>>(() => new Set());

  const selectedRef = paramC || null;

  const loadList = useCallback(() => {
    setLoadingList(true);
    setListError(null);
    listInboxThreads()
      .then(setRows)
      .catch((e: Error) => setListError(e.message))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (paramC) {
      setReadUuids((prev) => new Set(prev).add(paramC));
    }
  }, [paramC]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (channelFilter && r.channel !== channelFilter) return false;
      if (!q) return true;
      return (
        r.contactName.toLowerCase().includes(q) ||
        r.contactSubtitle?.toLowerCase().includes(q) ||
        r.lastMessagePreview?.toLowerCase().includes(q) ||
        r.uuid.toLowerCase().includes(q)
      );
    });
  }, [rows, search, channelFilter]);

  const channels = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => {
      if (r.channel) s.add(r.channel);
    });
    return [...s].sort();
  }, [rows]);

  const selectConversation = (uuid: string) => {
    setReadUuids((prev) => new Set(prev).add(uuid));
    router.push(`/dashboard/messages?c=${encodeURIComponent(uuid)}`, { scroll: false });
  };

  const selectedRow = useMemo(
    () => (selectedRef ? rows.find((r) => r.uuid === selectedRef) : undefined),
    [rows, selectedRef]
  );

  return (
    <div
      className="border-border bg-background flex min-h-[calc(100dvh-7.5rem)] w-full overflow-hidden rounded-xl border md:min-h-[calc(100dvh-8rem)]"
      style={{ maxHeight: "calc(100dvh - 7.5rem)" }}
    >
      {/* Sidebar — list */}
      <aside className="border-border flex w-full min-w-0 flex-col border-r md:w-[min(100%,380px)] md:max-w-[380px] md:shrink-0">
        <header className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Messages</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </header>

        <div className="border-border flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-9 pl-8"
              aria-label="Search conversations"
            />
          </div>
          <div className="relative shrink-0">
            <Button
              type="button"
              variant={channelFilter ? "secondary" : "outline"}
              size="icon"
              className="size-9"
              aria-expanded={showFilterMenu}
              aria-label="Filter by channel"
              onClick={() => setShowFilterMenu((v) => !v)}
            >
              <Filter className="size-4" />
            </Button>
            {showFilterMenu ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close filter menu"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-20 mt-1 min-w-[140px] rounded-lg border py-1 shadow-md">
                  <button
                    type="button"
                    className={cn(
                      "hover:bg-muted block w-full px-3 py-2 text-left text-sm",
                      !channelFilter && "bg-muted/50 font-medium"
                    )}
                    onClick={() => {
                      setChannelFilter(null);
                      setShowFilterMenu(false);
                    }}
                  >
                    All channels
                  </button>
                  {channels.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      className={cn(
                        "hover:bg-muted block w-full px-3 py-2 text-left text-sm capitalize",
                        channelFilter === ch && "bg-muted/50 font-medium"
                      )}
                      onClick={() => {
                        setChannelFilter(ch);
                        setShowFilterMenu(false);
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {listError ? (
            <p className="text-destructive px-4 py-6 text-center text-sm">{listError}</p>
          ) : loadingList ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-muted-foreground px-4 py-10 text-center text-sm">
              <MessageSquare className="mx-auto mb-3 size-10 opacity-30" aria-hidden />
              <p>No conversations match.</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                <Link href="/dashboard/intake">New lead</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {filteredRows.map((row) => {
                const active = selectedRef === row.uuid;
                const unread = !readUuids.has(row.uuid) && !active;
                return (
                  <li key={row.uuid}>
                    <button
                      type="button"
                      onClick={() => selectConversation(row.uuid)}
                      className={cn(
                        "hover:bg-muted/60 flex w-full gap-3 px-3 py-3 text-left transition-colors",
                        active && "bg-sidebar-accent/80 border-primary/30 border-l-2"
                      )}
                    >
                      <div className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        {initialsFromName(row.contactName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-foreground truncate text-sm font-semibold">
                            {row.contactName}
                          </span>
                          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                            {formatMessageTime(row.updatedAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug">
                          {row.lastMessagePreview ?? "—"}
                        </p>
                      </div>
                      {unread ? (
                        <span
                          className="bg-primary mt-2 size-2 shrink-0 rounded-full"
                          aria-label="Unread"
                        />
                      ) : (
                        <span className="size-2 shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Main thread */}
      <section className="bg-background flex min-w-0 flex-1 flex-col">
        {!selectedRef ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <MessageSquare className="size-14 opacity-20" aria-hidden />
            <p className="text-foreground max-w-sm text-sm font-medium">
              Select a conversation
            </p>
            <p className="max-w-sm text-xs leading-relaxed">
              Choose a thread from the list. URLs use conversation UUIDs per{" "}
              <code className="bg-muted rounded px-1">?c=</code> (see docs/phase2.md).
            </p>
          </div>
        ) : (
          <ThreadPanel
            conversationRef={selectedRef}
            listRow={selectedRow}
            onSent={() => {
              loadList();
              setReadUuids((prev) => new Set(prev).add(selectedRef));
            }}
          />
        )}
      </section>
    </div>
  );
}

function ThreadPanel({
  conversationRef,
  listRow,
  onSent,
}: {
  conversationRef: string;
  listRow?: InboxThreadRow;
  onSent: () => void;
}) {
  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadThread = useCallback(() => {
    setLoading(true);
    setError(null);
    conversationsService
      .getById(conversationRef)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [conversationRef]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const displayName = listRow?.contactName ?? "Contact";
  const displaySubtitle =
    listRow?.contactSubtitle ??
    (data?.channel ? `Channel: ${data.channel}` : undefined) ??
    (data?.contact_uuid ? `Contact ${data.contact_uuid.slice(0, 8)}…` : undefined);

  const canSend =
    isConversationUuid(data?.uuid ?? conversationRef) ||
    isConversationUuid(conversationRef);

  const sendUuid = isConversationUuid(conversationRef)
    ? conversationRef
    : data?.uuid && isConversationUuid(data.uuid)
      ? data.uuid
      : null;

  const handleSend = async () => {
    if (!sendUuid || !draft.trim() || sending || !canSend) return;
    setSending(true);
    try {
      await conversationsService.postStaffMessage(
        sendUuid,
        draft.trim(),
        data?.channel
      );
      setDraft("");
      await loadThread();
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 text-sm">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        Loading thread…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={loadThread}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <header className="border-border flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {initialsFromName(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm font-semibold">{displayName}</h3>
          <p className="text-muted-foreground truncate text-xs">{displaySubtitle ?? "—"}</p>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-xs">
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Star className="text-primary size-3.5 fill-primary/30" aria-hidden />
            <span className="text-foreground font-medium">5/5</span>
          </span>
          <span className="hidden sm:inline">
            {data.messages.length} message{data.messages.length !== 1 ? "s" : ""}
          </span>
          <Button type="button" variant="ghost" size="icon-xs" aria-label="Thread menu">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </header>

      {error ? (
        <div className="bg-destructive/10 text-destructive shrink-0 px-4 py-2 text-center text-xs">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <ThreadMessageStream messages={data.messages} />
      </div>

      <footer className="border-border bg-card/50 shrink-0 border-t p-3">
        {!canSend ? (
          <p className="text-muted-foreground mb-2 text-center text-xs">
            Staff replies require a conversation UUID (Phase 2). Open a thread from the API inbox
            or submit a new lead that returns <code className="bg-muted rounded px-1">conversation_uuid</code>.
          </p>
        ) : null}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={canSend ? "Type a message…" : "Reply unavailable for this thread ref"}
            rows={2}
            disabled={!canSend || sending}
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSend && draft.trim()) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            type="button"
            size="icon-lg"
            className="shrink-0 self-end"
            disabled={!canSend || !draft.trim() || sending}
            onClick={() => void handleSend()}
            aria-label="Send message"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
          </Button>
        </div>
      </footer>
    </>
  );
}

function ThreadMessageStream({ messages }: { messages: ConversationMessage[] }) {
  if (!messages.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">No messages in this thread.</p>
    );
  }

  let lastDate = "";
  const nodes: ReactNode[] = [];

  messages.forEach((m, i) => {
    const dateLabel = m.created_at ? formatMessageDateLabel(m.created_at) : "";
    if (dateLabel && dateLabel !== lastDate) {
      lastDate = dateLabel;
      nodes.push(
        <div
          key={`d-${dateLabel}-${i}`}
          className="text-muted-foreground my-6 flex items-center gap-3 text-xs"
        >
          <span className="bg-border h-px flex-1" />
          <span className="shrink-0 font-medium">{dateLabel}</span>
          <span className="bg-border h-px flex-1" />
        </div>
      );
    }

    const isClient = m.sender_type === "client";
    const label = isClient
      ? "Customer"
      : m.sender_type === "human"
        ? "Team"
        : "Assistant";
    const time = formatMessageTime(m.created_at);

    nodes.push(
      <div
        key={`${m.uuid ?? m.id ?? i}-${i}`}
        className={cn("mb-4 flex gap-2", isClient ? "justify-start" : "justify-end")}
      >
        {isClient ? (
          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
            <User className="text-muted-foreground size-4" aria-hidden />
          </div>
        ) : null}
        <div className={cn("max-w-[min(100%,520px)]", isClient ? "" : "order-first flex flex-col items-end")}>
          <div
            className={cn(
              "text-muted-foreground mb-1 flex items-center gap-2 text-xs",
              isClient ? "" : "flex-row-reverse"
            )}
          >
            <span className="text-foreground font-medium capitalize">{label}</span>
            <span className="tabular-nums">{time}</span>
            {m.is_generated ? (
              <span className="bg-primary/15 text-primary rounded px-1.5 py-0 text-[10px] font-medium">
                AI
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
              isClient
                ? "bg-card text-card-foreground border-border border"
                : "bg-muted text-foreground border-border/50 border"
            )}
          >
            <p className="wrap-break-word whitespace-pre-wrap">{m.message}</p>
          </div>
        </div>
        {!isClient ? (
          <div className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            {m.sender_type === "human" ? (
              <User className="size-4" aria-hidden />
            ) : (
              <Bot className="size-4" aria-hidden />
            )}
          </div>
        ) : null}
      </div>
    );
  });

  return <div className="pb-2">{nodes}</div>;
}

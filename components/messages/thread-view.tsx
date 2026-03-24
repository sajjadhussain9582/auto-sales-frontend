"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bot, Info, SendHorizonal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { conversationsService } from "@/services/conversations.service";
import type { ConversationDetail, ConversationMessage } from "@/types/conversation";
import { cn } from "@/lib/utils";

type Props = {
  backHref: string;
  backLabel: string;
  /** Page title label (e.g. Messages, Conversations) */
  sectionLabel: string;
  /** Enables composer UI (gated until POST message API exists) */
  composerEnabled?: boolean;
};

export function ThreadView({
  backHref,
  backLabel,
  sectionLabel,
  composerEnabled = false,
}: Props) {
  const params = useParams();
  const id = useMemo(() => (typeof params.id === "string" ? params.id : ""), [params.id]);

  const [data, setData] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing conversation id");
      return;
    }
    let cancelled = false;
    conversationsService
      .getById(id)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const composerDisabledReason =
    "Message sending is pending backend support (POST /conversations/{id}/messages).";

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Loading thread…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-destructive text-sm">{error ?? "Not found"}</p>
        <Button asChild variant="outline">
          <Link href={backHref}>
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {sectionLabel}
          </p>
          <h2 className="text-foreground truncate font-mono text-sm font-medium">{data.id}</h2>
          <div className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
            {data.channel ? (
              <span className="bg-muted rounded px-2 py-0.5 capitalize">{data.channel}</span>
            ) : null}
            {data.status ? <span>Status: {data.status}</span> : null}
            {data.is_escalated ? <span className="text-warning font-medium">Escalated</span> : null}
            {data.qualification_stage ? <span>Stage: {data.qualification_stage}</span> : null}
          </div>
        </div>
      </div>

      {!composerEnabled ? (
        <Card className="border-border bg-info/25">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="bg-info/40 text-info-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Info className="size-4" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-info-foreground text-base">Reply is coming next</CardTitle>
              <CardDescription className="text-info-foreground/80">
                {composerDisabledReason}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Thread</CardTitle>
          <CardDescription>Client vs AI / human messages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MessageList messages={data.messages} />

          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply…"
              rows={3}
              disabled={!composerEnabled}
            />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" disabled={!composerEnabled} onClick={() => setDraft("")}>
                Clear
              </Button>
              <Button type="button" disabled={!composerEnabled || !draft.trim()}>
                <SendHorizonal className="size-4" aria-hidden />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessageList({ messages }: { messages: ConversationMessage[] }) {
  if (!messages.length) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No messages in this thread.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m, i) => (
        <li
          key={`${m.created_at ?? i}-${i}`}
          className={cn(
            "flex gap-3 rounded-xl border p-3",
            m.sender_type === "client"
              ? "border-border bg-chat-client text-chat-client-foreground"
              : "border-primary/15 bg-chat-agent text-chat-agent-foreground"
          )}
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              m.sender_type === "client" ? "bg-background/50" : "bg-primary/15 text-primary"
            )}
            aria-hidden
          >
            {m.sender_type === "client" ? <User className="size-4" /> : <Bot className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {m.sender_type === "client" ? "Client" : m.sender_type === "human" ? "Team" : "AI"}
              </span>
              {m.is_generated ? (
                <span className="bg-primary/15 text-primary rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Generated
                </span>
              ) : null}
              {m.created_at ? (
                <span className="text-muted-foreground text-xs">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}


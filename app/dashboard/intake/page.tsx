"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDefaultFormId } from "@/lib/api-config";
import { conversationsService } from "@/services/conversations.service";
import { submitIntakeForm } from "@/services/forms.service";
import type { FormSubmitPayload } from "@/types/form";
import { CHANNEL_OPTIONS, DEFAULT_CHANNEL } from "@/utils/channels";
import { pushRecentConversation } from "@/utils/recent-conversations";

const emptyPayload = (): FormSubmitPayload => ({
  channel: DEFAULT_CHANNEL,
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
});

export default function IntakePage() {
  const [form, setForm] = useState(emptyPayload);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    conversationId: string;
    channel: string;
    aiReply?: string;
    escalated?: boolean;
  } | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [latestAiReply, setLatestAiReply] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState(false);

  const update = <K extends keyof FormSubmitPayload>(key: K, value: FormSubmitPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setReplyDraft("");
    setReplyError(null);
    setLatestAiReply(null);
    setConversationStatus(null);
    setIsEscalated(false);
    setLoading(true);
    try {
      const formId = getDefaultFormId();
      const res = await submitIntakeForm(formId, form);
      const conversationId = res.conversation_uuid ?? res.conversation_id;
      if (!conversationId) throw new Error("No conversation id in response");
      pushRecentConversation({ id: conversationId, channel: form.channel });
      setSuccess({
        conversationId,
        channel: form.channel,
        aiReply: res.ai_reply,
        escalated: res.is_escalated,
      });
      setLatestAiReply(res.ai_reply ?? null);
      setConversationStatus(res.conversation_status ?? null);
      setIsEscalated(Boolean(res.is_escalated));
      setForm(emptyPayload());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const onSimulateReply = async () => {
    if (!success || !replyDraft.trim() || replyLoading) return;
    setReplyLoading(true);
    setReplyError(null);
    try {
      const inbound = await conversationsService.postCustomerInbound(
        success.conversationId,
        replyDraft.trim(),
        success.channel,
        { source: "frontend_chat", conversation_stage: "follow_up" }
      );
      setConversationStatus(inbound.conversation_status ?? null);
      setIsEscalated(Boolean(inbound.is_escalated));
      const thread = await conversationsService.getById(success.conversationId);
      const nextAiReply = [...thread.messages]
        .reverse()
        .find((m) => m.sender_type === "agent" || m.is_generated)?.message;
      setLatestAiReply(nextAiReply ?? null);
      setReplyDraft("");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to send test reply");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">New lead</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a channel and enter lead details. Submits as a test intake until GHL webhooks
          are live.
        </p>
      </div>

      {success ? (
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success text-lg">Lead captured</CardTitle>
            <CardDescription>
              Conversation <span className="text-foreground font-mono text-xs">{success.conversationId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success.escalated ? (
              <p className="text-warning text-sm font-medium">
                Escalated — a team member may follow up.
              </p>
            ) : null}
            {isEscalated || conversationStatus === "pending_human" ? (
              <p className="text-warning text-sm font-medium">
                Human assistance requested ({conversationStatus ?? "pending_human"}).
              </p>
            ) : null}
            {latestAiReply ? (
              <div className="border-border bg-card rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                  AI reply
                </p>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {latestAiReply}
                </p>
              </div>
            ) : null}
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <p className="text-sm font-medium">Reply as customer (test)</p>
              <Textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={3}
                placeholder="Send a follow-up as the lead/customer..."
                disabled={replyLoading}
              />
              {replyError ? (
                <p className="text-destructive text-xs" role="alert">
                  {replyError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onSimulateReply()}
                disabled={replyLoading || !replyDraft.trim()}
              >
                {replyLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {replyLoading ? "Sending..." : "Send customer reply"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/dashboard/messages?c=${encodeURIComponent(success.conversationId)}`}>
                  Open in messages
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setReplyDraft("");
                  setReplyError(null);
                  setLatestAiReply(null);
                  setConversationStatus(null);
                  setIsEscalated(false);
                }}
              >
                Add another lead
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!success ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Lead details</CardTitle>
            <CardDescription>All fields help routing and AI context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? (
                <div
                  className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <select
                  id="channel"
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
                  value={form.channel}
                  onChange={(e) => update("channel", e.target.value)}
                >
                  {CHANNEL_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  required
                  rows={4}
                  placeholder="What they asked or context for the AI…"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {loading ? "Submitting…" : "Submit lead"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

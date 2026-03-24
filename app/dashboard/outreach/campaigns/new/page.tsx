"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextComposer, type RichTextComposerValue } from "@/components/outreach/RichTextComposer";
import { outreachService } from "@/services/campaigns.service";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "multi">("email");
  const [stage, setStage] = useState("");
  const [tags, setTags] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [composer, setComposer] = useState<RichTextComposerValue>({ html: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const audienceFilter = useMemo(() => {
    const filter: Record<string, unknown> = {};
    if (stage.trim()) filter.stage = stage.trim();
    const t = splitTags(tags);
    if (t?.length) filter.tags = t;
    if (sourceChannel.trim()) filter.channel = sourceChannel.trim();
    return filter;
  }, [stage, tags, sourceChannel]);

  const canSave = name.trim().length > 0;

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Phase2 contracts: campaign draft doesn't yet reference template/body.
      // We still create a template in parallel for future linkage.
      if (composer.text.trim()) {
        await outreachService.createTemplate({
          name: `${name.trim()} (campaign)`,
          channel: channel === "sms" ? "sms" : "email",
          body: composer.text.trim(),
        });
      }

      const campaign = await outreachService.createCampaignDraft({
        name: name.trim(),
        channel,
        audience_filter: Object.keys(audienceFilter).length ? audienceFilter : undefined,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      setSuccess(`Draft created: ${campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/outreach/campaigns">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">New campaign</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Build an outreach draft. Audience selection is stored as a filter; message is stored as
          plain text (template created for future linking).
        </p>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="bg-success/10 text-success flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="size-4" aria-hidden />
          {success}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Name, channel, and schedule.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Campaign name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contractor partnership Q1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <select
              id="channel"
              className="border-input bg-background text-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              value={channel}
              onChange={(e) => setChannel(e.target.value as typeof channel)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="multi">Multi</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="schedule">Scheduled at (optional)</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Audience filter</CardTitle>
          <CardDescription>Used by backend to compute campaign targets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Input id="stage" value={stage} onChange={(e) => setStage(e.target.value)} placeholder="qualified" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="contractor, west" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source channel</Label>
            <Input id="source" value={sourceChannel} onChange={(e) => setSourceChannel(e.target.value)} placeholder="ghl" />
          </div>

          <div className="md:col-span-3">
            <div className="bg-info/20 text-info-foreground rounded-lg px-4 py-3 text-sm">
              Audience JSON preview:{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                {JSON.stringify(audienceFilter)}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Message</CardTitle>
          <CardDescription>Compose with rich editor UI, stored as plain text.</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextComposer
            value={composer}
            onChange={setComposer}
            placeholder="Write your outreach message…"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/outreach/campaigns">Cancel</Link>
        </Button>
        <Button type="button" onClick={() => void onSave()} disabled={!canSave || saving} className="gap-1.5">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Saving…" : "Save draft"}
        </Button>
      </div>
    </div>
  );
}

function splitTags(raw: string): string[] | undefined {
  const tags = raw
    .split(/[;,|]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
}


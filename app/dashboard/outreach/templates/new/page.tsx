"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextComposer, type RichTextComposerValue } from "@/components/outreach/RichTextComposer";
import { outreachService } from "@/services/campaigns.service";

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [composer, setComposer] = useState<RichTextComposerValue>({ html: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSave = name.trim() && composer.text.trim();

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const tpl = await outreachService.createTemplate({
        name: name.trim(),
        channel,
        body: composer.text.trim(),
      });
      setSuccess(`Template created: ${tpl.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/outreach/templates">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      </Button>

      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">New template</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Templates are stored as plain text (even if composed with rich editor UI).
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
          <CardDescription>Name and channel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Template name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contractor intro" />
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
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Body</CardTitle>
          <CardDescription>Compose with rich editor UI, stored as plain text.</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextComposer
            value={composer}
            onChange={setComposer}
            placeholder="Write your template…"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/outreach/templates">Cancel</Link>
        </Button>
        <Button type="button" onClick={() => void onSave()} disabled={!canSave || saving} className="gap-1.5">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Saving…" : "Create template"}
        </Button>
      </div>
    </div>
  );
}


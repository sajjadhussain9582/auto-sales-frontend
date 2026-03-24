"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OutreachCampaign } from "@/types/campaign";
import { listCampaigns } from "@/services/campaigns.service";

export default function OutreachCampaignsPage() {
  const [rows, setRows] = useState<OutreachCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCampaigns()
      .then((d) => {
        if (!cancelled) setRows(d);
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
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Outreach</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Campaigns help the agent reach contractors, real estate agents, builders, and partners.
            Sending is gated until backend endpoints exist.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/outreach/campaigns/new">New campaign</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/outreach/templates">Templates</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaigns</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : rows.length ? `${rows.length} campaigns` : "No campaigns yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <Megaphone className="size-12 opacity-30" aria-hidden />
              <p>Create templates first, then wire a campaign send job in the backend.</p>
            </div>
          ) : (
            <div className="divide-border overflow-hidden rounded-lg border divide-y">
              {rows.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/outreach/campaigns/${encodeURIComponent(c.id)}`}
                  className="hover:bg-muted/50 block px-4 py-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-medium">{c.name}</p>
                      <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {c.audienceLabel ?? "—"} {c.bodyPreview ? `· ${c.bodyPreview}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
                        {c.status}
                      </span>
                      <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs uppercase">
                        {c.channel}
                      </span>
                      {c.status === "paused" ? (
                        <PauseCircle className="text-muted-foreground size-4" aria-hidden />
                      ) : (
                        <PlayCircle className="text-muted-foreground size-4" aria-hidden />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


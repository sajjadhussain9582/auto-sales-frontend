"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OutreachCampaign } from "@/types/campaign";
import { getCampaign } from "@/services/campaigns.service";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = useMemo(() => (typeof params.id === "string" ? params.id : ""), [params.id]);
  const [data, setData] = useState<OutreachCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing campaign id");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCampaign(id)
      .then((c) => {
        if (!cancelled) setData(c);
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

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Loading campaign…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-destructive text-sm">{error ?? "Campaign not found"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/outreach/campaigns">
            <ArrowLeft className="size-4" aria-hidden />
            Back to campaigns
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/outreach/campaigns">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      </Button>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">{data.name}</CardTitle>
          <CardDescription>
            {data.audienceLabel ?? "—"} · <span className="uppercase">{data.channel}</span> ·{" "}
            <span className="capitalize">{data.status}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Metric label="Sent" value={data.sentCount ?? 0} />
          <Metric label="Opens" value={data.openCount ?? 0} />
          <Metric label="Replies" value={data.replyCount ?? 0} />
        </CardContent>
      </Card>

      <Card className="border-border bg-info/25">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="bg-info/40 text-info-foreground flex size-9 items-center justify-center rounded-lg">
            <Lock className="size-4" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-info-foreground text-base">Sending is gated</CardTitle>
            <CardDescription className="text-info-foreground/80">
              Requires backend endpoints: campaign CRUD + send job + tracking. This screen is a
              professional shell for stakeholders.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-foreground mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}


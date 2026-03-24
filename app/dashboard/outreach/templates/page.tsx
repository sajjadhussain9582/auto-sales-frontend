"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageTemplate } from "@/types/campaign";
import { listTemplates } from "@/services/campaigns.service";

export default function OutreachTemplatesPage() {
  const [rows, setRows] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listTemplates()
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
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Templates</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Reusable outreach messages for contractors, agents, developers, architects, and builders.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/outreach/templates/new">New template</Link>
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Library</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : rows.length ? `${rows.length} templates` : "No templates yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <FileText className="size-12 opacity-30" aria-hidden />
              <p>Enable mock data or implement template endpoints.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((t) => (
                <Card key={t.id} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription>
                      <span className="uppercase">{t.channel}</span>
                      {t.persona ? ` · ${t.persona}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {t.subject ? (
                      <p className="text-muted-foreground mb-2 text-xs">
                        Subject: <span className="text-foreground">{t.subject}</span>
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap line-clamp-5">{t.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contact } from "@/types/contact";
import { getContact } from "@/services/contacts.service";

export default function ContactDetailPage() {
  const params = useParams();
  const id = useMemo(() => (typeof params.id === "string" ? params.id : ""), [params.id]);
  const [data, setData] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing contact id");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getContact(id)
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
        Loading contact…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-destructive text-sm">{error ?? "Contact not found"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/contacts">
            <ArrowLeft className="size-4" aria-hidden />
            Back to contacts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/contacts">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        </Button>
        {data.ghlContactId ? (
          <Button asChild variant="outline" size="sm">
            <a href="#" onClick={(e) => e.preventDefault()} title="Connect GHL to enable deep links">
              <ExternalLink className="size-4" aria-hidden />
              Open in GHL (soon)
            </a>
          </Button>
        ) : null}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">{data.name}</CardTitle>
          <CardDescription>
            {[data.email, data.phone, data.company].filter(Boolean).join(" · ") || "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.stage ? (
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
              Stage: {data.stage}
            </span>
          ) : null}
          {data.channel ? (
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
              Source: {data.channel}
            </span>
          ) : null}
          {data.tags?.length ? (
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
              Tags: {data.tags.join(", ")}
            </span>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversations</CardTitle>
          <CardDescription>Threads linked to this contact.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.conversationIds?.length ? (
            <ul className="divide-border overflow-hidden rounded-lg border divide-y">
              {data.conversationIds.map((cid) => (
                <li key={cid}>
                  <Link
                    href={`/dashboard/messages?c=${encodeURIComponent(cid)}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 px-4 py-3 transition-colors"
                  >
                    <span className="font-mono text-sm break-all">{cid}</span>
                    <MessagesSquare className="text-muted-foreground size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No linked threads yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Internal context for qualification and follow-up.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.notes ?? "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}


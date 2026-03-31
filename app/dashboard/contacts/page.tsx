"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Contact } from "@/types/contact";
import { listContacts } from "@/services/contacts.service";

export default function ContactsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveQuery = useMemo(() => query.trim(), [query]);

  const formatUpdatedAt = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listContacts(effectiveQuery || undefined)
      .then((data) => {
        if (!cancelled) setRows(data);
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
  }, [effectiveQuery]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Contacts</h2>

        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/dashboard/contacts/import">Import CSV/JSON</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/dashboard/intake">Capture new lead</Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-start">

        <div className="relative max-w-xl">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="pl-9"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Directory</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${rows.length} contacts`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
              <Users className="size-12 opacity-30" aria-hidden />
              <p>No contacts yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Company</th>
                    <th className="px-4 py-3 text-left font-medium">Stage</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c, i) => (
                    <tr key={c.id || c.uuid || i} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 align-top">{i + 1}</td>
                      <td className="px-4 py-3 align-top">
                        <Link
                          href={`/dashboard/contacts/${encodeURIComponent(c.id)}`}
                          className="text-foreground hover:underline"
                        >
                          {c.name || "Unknown"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">{c.email || "—"}</td>
                      <td className="px-4 py-3 align-top text-muted-foreground">{c.company || "—"}</td>
                      <td className="px-4 py-3 align-top">
                        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
                          {c.stage || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs capitalize">
                          {c.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">{formatUpdatedAt(c.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


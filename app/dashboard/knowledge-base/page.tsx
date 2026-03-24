"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { knowledgeBaseService } from "@/services/knowledge-base.service";
import type { KnowledgeBaseRow } from "@/types/knowledge";

export default function KnowledgeBasePage() {
  const [rows, setRows] = useState<KnowledgeBaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    knowledgeBaseService
      .list()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Knowledge base</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            FAQs used for RAG when answering leads. Create and edit via API or future admin tools.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading entries…
        </div>
      ) : rows.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center text-sm">
            <BookOpen className="size-12 opacity-30" aria-hidden />
            <p>No FAQ entries yet, or the list could not be loaded.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={String(row.id)} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {row.question ?? `Entry #${row.id}`}
                  </CardTitle>
                  {row.has_embedding !== undefined ? (
                    <span
                      className={
                        row.has_embedding
                          ? "bg-success/15 text-success shrink-0 rounded px-2 py-0.5 text-xs font-medium"
                          : "bg-muted text-muted-foreground shrink-0 rounded px-2 py-0.5 text-xs"
                      }
                    >
                      {row.has_embedding ? "Embedded" : "No embedding"}
                    </span>
                  ) : null}
                </div>
                {row.category ? (
                  <CardDescription className="text-xs">{row.category}</CardDescription>
                ) : null}
              </CardHeader>
              {row.answer ? (
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {row.answer}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

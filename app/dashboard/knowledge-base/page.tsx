"use client"

import { useEffect, useState } from "react"
import { BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { knowledgeBaseService } from "@/services/knowledge-base.service"
import type { KnowledgeBaseRow } from "@/types/knowledge"

export default function KnowledgeBasePage() {
  const [rows, setRows] = useState<KnowledgeBaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    knowledgeBaseService
      .list()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Knowledge base
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            FAQs used for RAG when answering leads. Create and edit via API or
            future admin tools.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading entries…
        </div>
      ) : rows.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
            <BookOpen className="size-12 opacity-30" aria-hidden />
            <p>No FAQ entries yet, or the list could not be loaded.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <Card
              key={String(row.id)}
              className="flex h-full flex-col border-border bg-card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {row.question ?? `Entry #${row.id}`}
                  </CardTitle>
                  {row.has_embedding !== undefined ? (
                    <span
                      className={
                        row.has_embedding
                          ? "shrink-0 rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
                          : "shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {row.has_embedding ? "Embedded" : "No embedding"}
                    </span>
                  ) : null}
                </div>
                {row.category ? (
                  <CardDescription className="text-xs">
                    {row.category}
                  </CardDescription>
                ) : null}
              </CardHeader>
              {row.answer ? (
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {row.answer}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

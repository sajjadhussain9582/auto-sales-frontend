"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileUp, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ContactImportField,
  ContactImportMapping,
  ContactImportPreview,
} from "@/types/contact-import";
import { parseCsvText } from "@/utils/import/csv";
import { parseJsonText } from "@/utils/import/json";
import { normalizeImportRows, suggestMapping } from "@/utils/import/mapping";
import { contactsService } from "@/services/contacts.service";

const FIELDS: { key: ContactImportField; label: string; optional?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone", optional: true },
  { key: "company", label: "Company", optional: true },
  { key: "tags", label: "Tags", optional: true },
  { key: "stage", label: "Stage", optional: true },
  { key: "notes", label: "Notes", optional: true },
  { key: "ghl_contact_id", label: "GHL contact id", optional: true },
];

type Mode = "csv" | "json";

export function ContactImportWizard() {
  const [mode, setMode] = useState<Mode>("csv");
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<ContactImportPreview | null>(null);
  const [mapping, setMapping] = useState<ContactImportMapping>({});
  const [defaultStage, setDefaultStage] = useState("");
  const [tagsToApply, setTagsToApply] = useState("");
  const [upsertKey, setUpsertKey] = useState<"email" | "email_or_phone">("email");
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const parsed = useMemo(() => {
    if (!preview) return null;
    const normalized = normalizeImportRows({
      rows: preview.rows,
      mapping,
      defaultStage: defaultStage.trim() || undefined,
      tagsToApply: splitTags(tagsToApply),
      upsertKey,
    });
    const total = normalized.length;
    const invalid = normalized.filter((r) => r.errors.length).length;
    return { normalized, total, invalid };
  }, [preview, mapping, defaultStage, tagsToApply, upsertKey]);

  const canParse = rawText.trim().length > 0;
  const canImport = !!parsed && parsed.total > 0 && parsed.invalid === 0;

  const handleParse = () => {
    setError(null);
    setImportResult(null);
    try {
      const p = mode === "csv" ? parseCsvText(rawText) : parseJsonText(rawText);
      setPreview(p);
      setMapping((prev) => {
        const suggested = suggestMapping(p.headers);
        return Object.keys(prev).length ? prev : suggested;
      });
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Failed to parse file");
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setImportResult(null);
    const text = await file.text();
    setRawText(text);
  };

  const doImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setError(null);
    setImportResult(null);
    try {
      const payload = parsed.normalized.map((r) => ({
        name: r.contact.name,
        email: r.contact.email,
        phone: r.contact.phone,
        company: r.contact.company,
        stage: r.contact.stage,
        tags: r.contact.tags,
        notes: r.contact.notes,
        external_ids: r.contact.externalIds,
      }));
      const res = await contactsService.importContacts(payload, { upsertKey });
      setImportResult(
        `Imported. Created: ${res.created_count ?? 0}, Updated: ${res.updated_count ?? 0}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">Import contacts</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload CSV/JSON to create or update contacts, then use them for outreach campaigns.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Source</CardTitle>
          <CardDescription>Choose CSV or JSON. Paste content or upload a file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "csv" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMode("csv")}
            >
              CSV
            </Button>
            <Button
              type="button"
              variant={mode === "json" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMode("json")}
            >
              JSON
            </Button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <Label htmlFor="file">Upload file</Label>
              <Input
                id="file"
                type="file"
                accept={mode === "csv" ? ".csv,text/csv" : "application/json,.json"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </div>
            <Button
              type="button"
              onClick={handleParse}
              disabled={!canParse}
              className="gap-1.5"
            >
              <FileUp className="size-4" aria-hidden />
              Parse & preview
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paste">{mode === "csv" ? "Paste CSV" : "Paste JSON array"}</Label>
            <Textarea
              id="paste"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={mode === "csv" ? "name,email,phone\nJane,jane@x.com,..." : "[{\"name\":\"...\"}]"}
              rows={8}
            />
          </div>

          {error ? (
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}
          {importResult ? (
            <div className="bg-success/10 text-success flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
              <CheckCircle2 className="size-4" aria-hidden />
              {importResult}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mapping</CardTitle>
          <CardDescription>Match your columns/keys to contact fields.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="upsert">Upsert key</Label>
                <select
                  id="upsert"
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
                  value={upsertKey}
                  onChange={(e) => setUpsertKey(e.target.value as typeof upsertKey)}
                >
                  <option value="email">Email</option>
                  <option value="email_or_phone">Email or phone</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultStage">Default stage</Label>
                <Input
                  id="defaultStage"
                  value={defaultStage}
                  onChange={(e) => setDefaultStage(e.target.value)}
                  placeholder="qualified"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applyTags">Tags to apply (comma-separated)</Label>
              <Input
                id="applyTags"
                value={tagsToApply}
                onChange={(e) => setTagsToApply(e.target.value)}
                placeholder="contractor, outreach"
              />
            </div>
          </div>

          <div className="space-y-3">
            {!preview ? (
              <div className="bg-info/20 text-info-foreground flex gap-3 rounded-lg p-4 text-sm">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>Parse a file to see headers and configure mapping.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className="space-y-2">
                    <Label>
                      {f.label}
                      {f.optional ? (
                        <span className="text-muted-foreground ml-2 text-xs">(optional)</span>
                      ) : null}
                    </Label>
                    <select
                      className="border-input bg-background text-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
                      value={mapping[f.key] ?? ""}
                      onChange={(e) =>
                        setMapping((m) => ({
                          ...m,
                          [f.key]: e.target.value || undefined,
                        }))
                      }
                    >
                      <option value="">—</option>
                      {preview.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>First rows plus validation results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!parsed ? (
            <p className="text-muted-foreground text-sm">Parse a file to preview.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">
                  Rows: <span className="text-foreground font-medium">{parsed.total}</span> ·{" "}
                  Invalid:{" "}
                  <span
                    className={parsed.invalid ? "text-warning font-medium" : "text-success font-medium"}
                  >
                    {parsed.invalid}
                  </span>
                </p>
                <Button
                  type="button"
                  onClick={() => void doImport()}
                  disabled={!canImport || importing}
                  title={
                    canImport
                      ? "Import contacts"
                      : parsed.invalid
                        ? "Fix validation issues before importing"
                        : "No rows to import"
                  }
                >
                  {importing ? "Importing…" : "Import"}
                </Button>
              </div>

              {parsed.invalid ? (
                <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-lg px-4 py-3 text-sm">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>
                    Fix validation errors. Common issues: missing email (upsert key) or invalid email
                    format.
                  </p>
                </div>
              ) : null}

              <div className="divide-border overflow-hidden rounded-lg border divide-y">
                {parsed.normalized.slice(0, 25).map((r) => (
                  <div key={r.rowNumber} className="px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-foreground text-sm font-medium">
                        #{r.rowNumber} · {r.contact.name}
                      </p>
                      {r.errors.length ? (
                        <span className="bg-warning/15 text-warning rounded px-2 py-0.5 text-xs">
                          {r.errors.length} issue{r.errors.length === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="bg-success/15 text-success rounded px-2 py-0.5 text-xs">
                          OK
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {[r.contact.email, r.contact.phone, r.contact.company].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                    {r.errors.length ? (
                      <ul className="text-warning mt-2 list-disc space-y-1 pl-5 text-xs">
                        {r.errors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
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


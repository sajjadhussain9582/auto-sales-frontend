"use client";

import Link from "next/link";
import { Activity, ArrowRight, GitBranch, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/utils/pipeline";

export default function AutomationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">Automations</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Organize leads, trigger follow-ups, and keep the pipeline clean. This is the control
          plane for your agent once workflow APIs exist.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Pipeline</CardTitle>
                <CardDescription>Default stages used for lead qualification.</CardDescription>
              </div>
              <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                <Activity className="size-4" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PIPELINE_STAGES.map((s) => (
              <span key={s.id} className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                {s.label}
              </span>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Rules</CardTitle>
                <CardDescription>Escalation, reminders, and routing logic.</CardDescription>
              </div>
              <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                <ListChecks className="size-4" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Example rules (UI-only): escalate when budget is high, auto-send booking link, follow
              up after 24h, tag by intent.
            </p>
            <Button type="button" variant="outline" disabled title="Workflow engine pending">
              Create rule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-info/25">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="bg-info/40 text-info-foreground flex size-9 items-center justify-center rounded-lg">
            <GitBranch className="size-4" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-info-foreground text-base">Decide where workflows live</CardTitle>
            <CardDescription className="text-info-foreground/80">
              If you want a GHL-first approach, this page becomes a read-only mirror. If you want
              native workflows, the backend needs triggers + actions APIs.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/integrations" className="gap-1.5">
              Review integrations
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


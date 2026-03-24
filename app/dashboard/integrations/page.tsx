"use client";

import Link from "next/link";
import { Calendar, Database, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect GoHighLevel, email, SMS, and scheduling. This page is a professional shell until
          OAuth/webhooks are implemented in the backend.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <IntegrationCard
          title="GoHighLevel"
          description="Preferred CRM. Webhooks create/update contacts and conversations."
          icon={<ShieldCheck className="size-4" aria-hidden />}
          status="Not connected"
        />
        <IntegrationCard
          title="Email"
          description="Inbound/outbound email routing for client communication and outreach."
          icon={<Mail className="size-4" aria-hidden />}
          status="Not connected"
        />
        <IntegrationCard
          title="SMS"
          description="Text message channel for leads and reminders."
          icon={<MessageSquare className="size-4" aria-hidden />}
          status="Not connected"
        />
        <IntegrationCard
          title="Scheduling"
          description="Calendly or Google Calendar booking links and reminders."
          icon={<Calendar className="size-4" aria-hidden />}
          status="Not connected"
        />
        <IntegrationCard
          title="Sheets / Tracking"
          description="Google Sheets or internal CRM tracking for pipeline visibility."
          icon={<Database className="size-4" aria-hidden />}
          status="Not connected"
        />
      </div>

      <Card className="border-border bg-info/25">
        <CardHeader>
          <CardTitle className="text-info-foreground text-base">Next backend work</CardTitle>
          <CardDescription className="text-info-foreground/80">
            Add webhook handlers and OAuth flows, then expose connection status APIs for this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/automations">View automations</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  status,
  icon,
}: {
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">{status}</span>
        <Button type="button" variant="outline" size="sm" disabled title="Backend integration pending">
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}


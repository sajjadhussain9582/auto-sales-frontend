import Link from "next/link";
import { MessageSquarePlus, Inbox, Users, Megaphone, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-7xl  space-y-8">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Improve client satisfaction, automate responses, and qualify leads. Use{" "}
          <strong className="text-foreground font-medium">New lead</strong> to simulate
          inbound contacts by channel until GoHighLevel webhooks are connected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Intake</CardTitle>
            <CardDescription>Simulate leads (website, GHL, SMS, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/intake">
                <MessageSquarePlus className="size-4" aria-hidden />
                New lead
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages</CardTitle>
            <CardDescription>Inbox and thread view</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/dashboard/messages">
                <Inbox className="size-4" aria-hidden />
                Open messages
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contacts</CardTitle>
            <CardDescription>Manage your CRM directory</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/contacts">
                <Users className="size-4" aria-hidden />
                View contacts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Outreach</CardTitle>
            <CardDescription>Campaign shells for growth partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/outreach/campaigns">
                <Megaphone className="size-4" aria-hidden />
                Campaigns
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-info/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-info-foreground text-base">Integrations</CardTitle>
            <CardDescription className="text-info-foreground/80">
              Connect GoHighLevel, email/SMS, and scheduling when backend webhooks/OAuth are ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/integrations">
                <PlugZap className="size-4" aria-hidden />
                Integrations hub
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

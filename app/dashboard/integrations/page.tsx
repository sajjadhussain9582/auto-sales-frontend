"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Database, Mail, MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { integrationsService } from "@/services/integrations.service";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"email" | "calendly" | "availability" | null>(null);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const data = await integrationsService.list();
      setIntegrations(data);
      
      const cal = data.find(i => i.provider === "scheduling" && i.status === "connected");
      if (cal) {
        fetchEventTypes();
      }
    } catch (err) {
      console.error("Failed to fetch integrations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    setFetchingEvents(true);
    try {
      const data = await integrationsService.getCalendlyEventTypes();
      setEventTypes(data.collection || []);
    } catch (err) {
      console.error("Failed to fetch event types", err);
    } finally {
      setFetchingEvents(false);
    }
  };

  const getStatus = (provider: string) => {
    const integration = integrations.find((i) => i.provider === provider);
    return integration ? integration.status : "Not connected";
  };
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
          status={getStatus("ghl")}
          onConnect={() => {}} // TODO: Implement GHL OAuth
        />
        <IntegrationCard
          title="Email"
          description="Inbound/outbound email routing for client communication and outreach."
          icon={<Mail className="size-4" aria-hidden />}
          status={getStatus("email")}
          onConnect={() => setActiveModal("email")}
        />
        <IntegrationCard
          title="SMS"
          description="Text message channel for leads and reminders."
          icon={<MessageSquare className="size-4" aria-hidden />}
          status={getStatus("sms")}
          onConnect={() => {}}
        />
        <IntegrationCard
          title="Scheduling"
          description="Calendly or Google Calendar booking links and reminders."
          icon={<Calendar className="size-4" aria-hidden />}
          status={getStatus("scheduling")}
          onConnect={() => setActiveModal("calendly")}
          onViewAvailability={getStatus("scheduling") === "connected" ? () => setActiveModal("availability") : undefined}
          eventTypes={eventTypes}
          isLoadingEvents={fetchingEvents}
        />
        <IntegrationCard
          title="Sheets / Tracking"
          description="Google Sheets or internal CRM tracking for pipeline visibility."
          icon={<Database className="size-4" aria-hidden />}
          status={getStatus("sheets")}
          onConnect={() => {}}
        />
      </div>

      {activeModal === "email" && (
        <EmailConfigModal
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null);
            fetchIntegrations();
          }}
        />
      )}

      {activeModal === "calendly" && (
        <CalendlyConfigModal
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setActiveModal(null);
            fetchIntegrations();
          }}
        />
      )}

      {activeModal === "availability" && (
        <CalendlyAvailabilityModal
          eventTypes={eventTypes}
          onClose={() => setActiveModal(null)}
        />
      )}

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
  onConnect,
  onViewAvailability,
  eventTypes,
  isLoadingEvents,
}: {
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
  onConnect: () => void;
  onViewAvailability?: () => void;
  eventTypes?: any[];
  isLoadingEvents?: boolean;
}) {
  const isConnected = status === "connected";
  const isPending = status === "pending";

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <CheckCircle2 className="text-success size-3.5" />
            ) : isPending ? (
              <Loader2 className="text-warning size-3.5 animate-spin" />
            ) : (
              <AlertCircle className="text-muted-foreground size-3.5" />
            )}
            <span className="text-muted-foreground text-xs capitalize">{status}</span>
          </div>
          <Button
            type="button"
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={onConnect}
          >
            {isConnected ? "Reconfigure" : "Connect"}
          </Button>
        </div>

        {isConnected && title === "Scheduling" && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs font-medium">Event Types</span>
              {onViewAvailability && (
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onViewAvailability}>
                  Preview All
                </Button>
              )}
            </div>
            
            {isLoadingEvents ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>Loading events...</span>
              </div>
            ) : eventTypes && eventTypes.length > 0 ? (
              <div className="grid gap-2">
                {eventTypes.slice(0, 3).map((et: any) => (
                  <div key={et.uri} className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-xs">
                    <span className="truncate font-medium">{et.name}</span>
                    <span className="text-muted-foreground">{et.duration}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active event types found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmailConfigModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [type, setType] = useState<"smtp" | "resend">("smtp");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    host: "",
    port: "587",
    user: "",
    password: "",
    api_key: "",
    from_email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data =
        type === "smtp"
          ? {
              type: "smtp",
              host: formData.host,
              port: parseInt(formData.port),
              user: formData.user,
              password: formData.password,
              from_email: formData.from_email,
            }
          : {
              type: "resend",
              api_key: formData.api_key,
              from_email: formData.from_email,
            };

      await integrationsService.configureEmail(data);
      onSuccess();
    } catch (err) {
      console.error("Failed to configure email", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configure Email</CardTitle>
          <CardDescription>Setup your outbound email provider</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-1 text-sm ${
                  type === "smtp" ? "bg-background shadow-sm" : ""
                }`}
                onClick={() => setType("smtp")}
              >
                SMTP
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-1 text-sm ${
                  type === "resend" ? "bg-background shadow-sm" : ""
                }`}
                onClick={() => setType("resend")}
              >
                Resend API
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                type="email"
                required
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              />
            </div>

            {type === "smtp" ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      required
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      required
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">Username</Label>
                  <Input
                    id="user"
                    required
                    value={formData.user}
                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  required
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                />
              </div>
            )}
          </CardContent>
          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Save Connection"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function CalendlyConfigModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "url" as "url" | "pat",
    token: "",
    booking_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await integrationsService.configureCalendly(formData);
      onSuccess();
    } catch (err) {
      console.error("Failed to configure Calendly", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configure Calendly</CardTitle>
          <CardDescription>Setup your scheduling integration</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-1 text-sm ${
                  formData.type === "url" ? "bg-background shadow-sm" : ""
                }`}
                onClick={() => setFormData({ ...formData, type: "url" })}
              >
                Booking URL
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-1 text-sm ${
                  formData.type === "pat" ? "bg-background shadow-sm" : ""
                }`}
                onClick={() => setFormData({ ...formData, type: "pat" })}
              >
                Personal Access Token
              </button>
            </div>

            {formData.type === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="booking_url">Calendly Booking URL</Label>
                <Input
                  id="booking_url"
                  placeholder="https://calendly.com/your-link"
                  required
                  value={formData.booking_url}
                  onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="token">Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  required
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                />
              </div>
            )}
          </CardContent>
          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Save Connection"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


function CalendlyAvailabilityModal({ eventTypes, onClose }: { eventTypes: any[]; onClose: () => void }) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (eventTypes && eventTypes.length > 0 && !selectedUrl) {
      setSelectedUrl(eventTypes[0].scheduling_url);
    }
  }, [eventTypes, selectedUrl]);

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
          <div>
            <CardTitle className="text-xl">Calendly Availability</CardTitle>
            <CardDescription>Live preview of your booking calendar</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-2">
            <X className="size-4" />
            <span>Close</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <div className="flex gap-2 overflow-x-auto p-4 border-b">
            {eventTypes.map((et) => (
              <Button
                key={et.uri}
                variant={selectedUrl === et.scheduling_url ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedUrl(et.scheduling_url)}
                className="whitespace-nowrap"
              >
                {et.name} ({et.duration}m)
              </Button>
            ))}
          </div>
          <div className="flex-1 bg-white">
            {selectedUrl ? (
              <iframe
                src={`${selectedUrl}?embed_domain=localhost&embed_type=Inline`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Calendly"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select an event type to view availability
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

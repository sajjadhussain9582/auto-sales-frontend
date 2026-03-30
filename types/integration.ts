export type IntegrationProvider = "hubspot" | "calendly" | "email";

export interface Integration {
  provider: IntegrationProvider;
  status: "connected" | "disconnected";
  last_sync_at?: string;
  [key: string]: any; // Allow other properties
}

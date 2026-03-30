export type IntegrationProvider =
  | "hubspot"
  | "calendly"
  | "email"
  | "scheduling"
  | "ghl"
  | "sms"
  | "sheets"

export interface Integration {
  provider: IntegrationProvider
  status: "connected" | "disconnected"
  last_sync_at?: string
  [key: string]: unknown // Allow other properties
}

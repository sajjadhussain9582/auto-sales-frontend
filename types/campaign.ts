export type CampaignStatus = "draft" | "scheduled" | "sending" | "paused" | "completed";

export type OutreachCampaign = {
  id: string;
  name: string;
  channel: "email" | "sms" | "multi";
  status: CampaignStatus;
  audienceLabel?: string;
  sentCount?: number;
  openCount?: number;
  replyCount?: number;
  updatedAt?: string;
  templateId?: string;
  bodyPreview?: string;
};

export type MessageTemplate = {
  id: string;
  name: string;
  channel: "email" | "sms";
  persona?: string;
  subject?: string;
  body: string;
};

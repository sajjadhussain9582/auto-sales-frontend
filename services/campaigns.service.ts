import { apiRequest, ApiError } from "@/lib/api-client";
import { isMockDataEnabled } from "@/lib/feature-flags";
import type { OutreachCampaign, MessageTemplate } from "@/types/campaign";
import { MOCK_CAMPAIGNS, MOCK_TEMPLATES } from "@/utils/mock-dashboard-data";

export type CampaignDraftPayload = {
  name: string;
  channel: "email" | "sms" | "multi";
  audience_filter?: Record<string, unknown>;
  scheduled_at?: string | null;
};

export async function listCampaigns(): Promise<OutreachCampaign[]> {
  if (isMockDataEnabled()) return [...MOCK_CAMPAIGNS];
  try {
    const data = await apiRequest<unknown>("/campaigns");
    return Array.isArray(data) ? (data as OutreachCampaign[]) : [];
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) return [];
    throw e;
  }
}

export async function getCampaign(id: string): Promise<OutreachCampaign | null> {
  if (isMockDataEnabled()) {
    return MOCK_CAMPAIGNS.find((c) => c.id === id) ?? null;
  }
  try {
    return await apiRequest<OutreachCampaign>(`/campaigns/${encodeURIComponent(id)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function listTemplates(): Promise<MessageTemplate[]> {
  if (isMockDataEnabled()) return [...MOCK_TEMPLATES];
  try {
    const data = await apiRequest<unknown>("/templates");
    return Array.isArray(data) ? (data as MessageTemplate[]) : [];
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      try {
        const data = await apiRequest<unknown>("/campaigns/templates");
        return Array.isArray(data) ? (data as MessageTemplate[]) : [];
      } catch {
        return [];
      }
    }
    throw e;
  }
}

export const outreachService = {
  listCampaigns,
  getCampaign,
  listTemplates,

  async createCampaignDraft(payload: CampaignDraftPayload): Promise<OutreachCampaign> {
    try {
      return await apiRequest<OutreachCampaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        throw new Error("Campaigns API not available yet (POST /campaigns).");
      }
      throw e;
    }
  },

  async createTemplate(payload: { name: string; channel: "email" | "sms"; body: string }): Promise<MessageTemplate> {
    try {
      return await apiRequest<MessageTemplate>("/templates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        throw new Error("Templates API not available yet (POST /templates).");
      }
      throw e;
    }
  },
};

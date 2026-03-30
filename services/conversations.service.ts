import { apiRequest, getSessionToken } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/api-config";
import type { ConversationDetail, SenderType } from "@/types/conversation";

function normalizeMessages(raw: unknown): ConversationDetail["messages"] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { message_list?: unknown })?.message_list)
      ? ((raw as { message_list: unknown[] }).message_list as unknown[])
      : [];
  return list as ConversationDetail["messages"];
}

type InboundFollowupResponse = {
  conversation_uuid?: string;
  inbound_message_uuid?: string;
  ai_reply_message_uuid?: string;
  ai_reply?: string;
  conversation_status?: string;
  is_escalated?: boolean;
};

function formatInboundError(data: unknown, status: number, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  if (status === 400) return "Invalid conversation reference. Please retry from a valid lead.";
  if (status === 401) return "Inbound auth failed. Verify FORM_SUBMIT_API_KEY on backend/frontend.";
  if (status === 422) return "Please enter a message before sending.";
  return fallback;
}

export const conversationsService = {
  async getById(conversationRef: string): Promise<ConversationDetail> {
    const raw = await apiRequest<Record<string, unknown>>(
      `/conversations/${encodeURIComponent(conversationRef)}`
    );
    const messages = normalizeMessages(raw.messages);

    return {
      id: String(raw.id ?? conversationRef),
      uuid: raw.uuid !== undefined ? String(raw.uuid) : undefined,
      contact_id: raw.contact_id !== undefined ? String(raw.contact_id) : undefined,
      contact_uuid: raw.contact_uuid !== undefined ? String(raw.contact_uuid) : undefined,
      channel: raw.channel !== undefined ? String(raw.channel) : undefined,
      status: raw.status !== undefined ? String(raw.status) : undefined,
      is_escalated: Boolean(raw.is_escalated),
      last_intent:
        raw.last_intent !== undefined ? String(raw.last_intent) : undefined,
      qualification_stage:
        raw.qualification_stage !== undefined
          ? String(raw.qualification_stage)
          : undefined,
      messages,
    };
  },

  /** Phase 2: UUID path only. See docs/phase2.md */
  async postMessage(
    conversationUuid: string,
    message: string,
    senderType: SenderType = "human",
    channel?: string
  ): Promise<void> {
    await apiRequest<unknown>(`/conversations/${encodeURIComponent(conversationUuid)}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message,
        sender_type: senderType,
        ...(channel ? { channel } : {}),
      }),
    });
  },

  async postStaffMessage(
    conversationUuid: string,
    message: string,
    channel?: string
  ): Promise<void> {
    await this.postMessage(conversationUuid, message, "human", channel);
  },

  async postCustomerInbound(
    conversationUuid: string,
    message: string,
    channel?: string,
    metadata?: Record<string, unknown>
  ): Promise<InboundFollowupResponse> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `${getApiBaseUrl()}/conversations/${encodeURIComponent(conversationUuid)}/inbound`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          ...(channel ? { channel } : {}),
          ...(metadata ? { metadata } : {}),
        }),
      }
    );

    const text = await res.text();
    let data: unknown = {};
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = { raw: text };
      }
    }

    if (!res.ok) {
      throw new Error(formatInboundError(data, res.status, res.statusText));
    }

    return data as InboundFollowupResponse;
  },
};

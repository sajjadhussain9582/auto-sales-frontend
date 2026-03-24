export type SenderType = "client" | "agent" | "human";

export type ConversationMessage = {
  id?: string;
  uuid?: string;
  conversation_uuid?: string;
  sender_type: SenderType;
  message: string;
  channel?: string;
  is_generated?: boolean;
  rag_source_kb_ids?: string[];
  created_at?: string;
};

export type ConversationDetail = {
  id: string;
  uuid?: string;
  contact_id?: string;
  contact_uuid?: string;
  channel?: string;
  status?: string;
  is_escalated?: boolean;
  last_intent?: string;
  qualification_stage?: string;
  messages: ConversationMessage[];
};

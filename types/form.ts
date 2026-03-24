export type ChannelOption = {
  value: string;
  label: string;
};

export type FormSubmitPayload = {
  channel: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type FormSubmitResponse = {
  submission_id?: string;
  submission_uuid?: string;
  contact_id?: string;
  contact_uuid?: string;
  conversation_id?: string;
  conversation_uuid?: string;
  ai_reply?: string;
  rag_kb_ids?: string[];
  conversation_status?: string;
  is_escalated?: boolean;
};

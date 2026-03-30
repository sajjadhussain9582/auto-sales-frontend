export type Contact = {
  id: string;
  uuid?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  channel?: string;
  stage?: string;
  tags?: string[];
  notes?: string;
  ghlContactId?: string;
  conversationIds?: string[];
};

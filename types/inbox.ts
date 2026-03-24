/** Phase 2 GET /conversations item — see docs/phase2.md */
export type InboxContactPreview = {
  uuid?: string;
  email?: string;
  username?: string;
  company?: string;
};

export type InboxThreadRow = {
  /** Preferred ref for URLs and POST /messages (UUID) */
  uuid: string;
  /** Legacy numeric id when API still returns it */
  legacyId?: string;
  contactPreview?: InboxContactPreview;
  contactName: string;
  contactSubtitle?: string;
  lastMessagePreview?: string;
  status?: string;
  channel?: string;
  isEscalated?: boolean;
  updatedAt?: string;
};

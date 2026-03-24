import type { InboxThreadRow } from "@/types/inbox";
import type { Contact } from "@/types/contact";
import type { OutreachCampaign, MessageTemplate } from "@/types/campaign";

export const MOCK_INBOX_ROWS: InboxThreadRow[] = [
  {
    uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    contactName: "Alex Rivera",
    contactSubtitle: "Rivera Homes · alex@example.com",
    contactPreview: {
      uuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
      email: "alex@example.com",
      username: "Alex Rivera",
      company: "Rivera Homes",
    },
    channel: "ghl",
    lastMessagePreview: "Interested in a consultation next week…",
    status: "open",
    isEscalated: false,
    updatedAt: new Date().toISOString(),
  },
  {
    uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    contactName: "Jordan Lee",
    contactSubtitle: "Website lead",
    contactPreview: {
      email: "jordan@example.com",
      username: "Jordan Lee",
    },
    channel: "website",
    lastMessagePreview: "What areas do you serve?",
    status: "open",
    isEscalated: true,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Alex Rivera",
    email: "alex@example.com",
    phone: "+1 555-0101",
    company: "Rivera Homes",
    channel: "ghl",
    stage: "qualified",
    tags: ["contractor", "high-intent"],
    notes: "Asked about timeline for Q2.",
    conversationIds: ["demo-thread-1"],
  },
  {
    id: "c2",
    name: "Sam Chen",
    email: "sam.chen@buildco.dev",
    company: "BuildCo",
    channel: "email",
    stage: "new",
    tags: ["developer"],
    conversationIds: [],
  },
  {
    id: "c3",
    name: "Morgan Blake",
    email: "morgan@metro-realty.com",
    company: "Metro Realty",
    channel: "sms",
    stage: "booked",
    tags: ["real_estate"],
    conversationIds: [],
  },
];

export const MOCK_CAMPAIGNS: OutreachCampaign[] = [
  {
    id: "camp-1",
    name: "Contractor partnership Q1",
    channel: "email",
    status: "draft",
    audienceLabel: "Contractors · West region",
    sentCount: 0,
    openCount: 0,
    replyCount: 0,
    updatedAt: new Date().toISOString(),
    templateId: "tpl-1",
    bodyPreview: "Hi {{name}}, we partner with contractors on…",
  },
  {
    id: "camp-2",
    name: "RE agent intro sequence",
    channel: "multi",
    status: "paused",
    audienceLabel: "Real estate agents",
    sentCount: 120,
    openCount: 48,
    replyCount: 9,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    templateId: "tpl-2",
  },
];

export const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl-1",
    name: "Contractor intro",
    channel: "email",
    persona: "Contractors",
    subject: "Partnership opportunity",
    body: "Hi {{name}},\n\nWe help teams like yours scale client communication with AI…\n\nBook a call: {{calendar_link}}",
  },
  {
    id: "tpl-2",
    name: "RE agent SMS touch",
    channel: "sms",
    persona: "Real estate agents",
    body: "Hi {{name}} — quick question about referral partners in your market. Reply YES to chat.",
  },
  {
    id: "tpl-3",
    name: "Architect nurture",
    channel: "email",
    persona: "Architects",
    subject: "Spec-driven workflows",
    body: "Sharing how firms use our agent for intake and scheduling…",
  },
];

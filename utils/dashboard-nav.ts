import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquarePlus,
  Inbox,
  Users,
  Megaphone,
  PlugZap,
  Workflow,
  BookOpen,
  Settings,
  LayoutTemplate,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/lead-flow", label: "Lead flow", icon: LayoutTemplate },
  { href: "/dashboard/sales", label: "Sales Pipeline", icon: MessageSquarePlus },
  { href: "/dashboard/messages", label: "Messages", icon: Inbox },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/outreach/campaigns", label: "Outreach", icon: Megaphone },
  { href: "/dashboard/integrations", label: "Integrations", icon: PlugZap },
  { href: "/dashboard/automations", label: "Automations", icon: Workflow },
  { href: "/dashboard/knowledge-base", label: "Knowledge base", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

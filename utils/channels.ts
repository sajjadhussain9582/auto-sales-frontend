import type { ChannelOption } from "@/types/form";

/** Lead source options for intake — `value` must match backend expectations */
export const CHANNEL_OPTIONS: readonly ChannelOption[] = [
  { value: "website", label: "Website" },
  { value: "ghl", label: "GoHighLevel" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
] as const;

export const DEFAULT_CHANNEL = "website" as const;

import { redirect } from "next/navigation";

/** Backwards-compatible alias for older links. */
export default function ConversationsAliasPage() {
  redirect("/dashboard/messages");
}


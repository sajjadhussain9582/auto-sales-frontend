import { redirect } from "next/navigation";

export default async function ConversationsAliasThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/messages?c=${encodeURIComponent(id)}`);
}

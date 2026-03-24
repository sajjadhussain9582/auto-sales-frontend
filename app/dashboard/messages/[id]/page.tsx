import { redirect } from "next/navigation";

/** Deep link: prefer UUID in URL per phase2.md */
export default async function MessageThreadRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/messages?c=${encodeURIComponent(id)}`);
}

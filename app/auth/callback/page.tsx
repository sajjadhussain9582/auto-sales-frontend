import { redirect } from "next/navigation";

/** OAuth callback reserved; Google is not wired yet */
export default function AuthCallbackPage() {
  redirect("/login");
}

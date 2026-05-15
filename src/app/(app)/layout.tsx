import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentProfile } from "@/lib/data";
import { getSessionUserId } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return <AppShell username={profile.username}>{children}</AppShell>;
}

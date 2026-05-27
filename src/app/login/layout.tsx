import { TelegramAuthGate } from "@/components/TelegramAuthGate";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  if (userId) redirect("/map");

  return <TelegramAuthGate hasSession={false}>{children}</TelegramAuthGate>;
}

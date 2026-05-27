import { Suspense } from "react";
import { TelegramAuthGate } from "@/components/TelegramAuthGate";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  if (userId) redirect("/map");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#07090d]">
          <p className="text-sm text-zinc-500">Загрузка…</p>
        </div>
      }
    >
      <TelegramAuthGate hasSession={false}>{children}</TelegramAuthGate>
    </Suspense>
  );
}

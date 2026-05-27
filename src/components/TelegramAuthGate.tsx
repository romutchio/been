"use client";

import { signInWithTelegramAction } from "@/app/auth/telegram/actions";
import { TelegramOnboarding } from "@/components/TelegramOnboarding";
import { useTelegram } from "@/components/TelegramProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  hasSession: boolean;
  children: React.ReactNode;
};

export function TelegramAuthGate({ hasSession, children }: Props) {
  const { isTelegram, isReady, initData } = useTelegram();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    if (!isReady || !isTelegram || hasSession || tried.current || !initData) {
      return;
    }
    tried.current = true;
    setBusy(true);

    void signInWithTelegramAction(initData).then((result) => {
      if (result?.needsChoice) {
        setNeedsChoice(true);
        setBusy(false);
        return;
      }
      if (result?.error) {
        setError(result.error);
        setBusy(false);
        return;
      }
      if (result?.ok) {
        router.replace("/map");
        router.refresh();
        return;
      }
      setBusy(false);
    });
  }, [isReady, isTelegram, hasSession, initData, router]);

  if (isTelegram && !hasSession && needsChoice) {
    return <TelegramOnboarding />;
  }

  if (isTelegram && !hasSession && (busy || !tried.current)) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
        <p className="text-sm text-zinc-400">
          {error ?? "Вход через Telegram…"}
        </p>
      </div>
    );
  }

  if (error && isTelegram && !hasSession) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#07090d] px-4">
        <p className="text-center text-sm text-red-400">{error}</p>
        <a href="/login" className="text-sm text-emerald-400 hover:underline">
          Войти по логину и паролю
        </a>
      </div>
    );
  }

  return children;
}

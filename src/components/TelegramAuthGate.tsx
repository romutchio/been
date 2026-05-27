"use client";

import { signInWithTelegramAction } from "@/app/auth/telegram/actions";
import { AuthBrand } from "@/components/AuthBrand";
import { TelegramOnboarding } from "@/components/TelegramOnboarding";
import { useTelegram } from "@/components/TelegramProvider";
import {
  enableTelegramPasswordLogin,
  isTelegramPasswordLogin,
} from "@/lib/telegram-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  hasSession: boolean;
  children: React.ReactNode;
};

export function TelegramAuthGate({ hasSession, children }: Props) {
  const { isTelegram, isReady, initData } = useTelegram();
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordFromUrl = searchParams.get("password") === "1";

  const [error, setError] = useState<string | null>(null);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const tried = useRef(false);

  const skipTelegramAuth =
    passwordFromUrl ||
    passwordMode ||
    (typeof window !== "undefined" && isTelegramPasswordLogin());

  const openPasswordLogin = useCallback(() => {
    enableTelegramPasswordLogin();
    tried.current = true;
    setPasswordMode(true);
    setNeedsChoice(false);
    setBusy(false);
    setError(null);
    router.replace("/login?password=1");
  }, [router]);

  useEffect(() => {
    if (passwordFromUrl || isTelegramPasswordLogin()) {
      setPasswordMode(true);
      tried.current = true;
    }
  }, [passwordFromUrl]);

  useEffect(() => {
    if (
      skipTelegramAuth ||
      !isReady ||
      !isTelegram ||
      hasSession ||
      tried.current ||
      !initData
    ) {
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
  }, [skipTelegramAuth, isReady, isTelegram, hasSession, initData, router]);

  if (isTelegram && !hasSession && (passwordMode || passwordFromUrl)) {
    return children;
  }

  if (isTelegram && !hasSession && needsChoice) {
    return <TelegramOnboarding onUsePassword={openPasswordLogin} />;
  }

  if (isTelegram && !hasSession && (busy || !tried.current)) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
        <div className="w-full max-w-sm">
          <AuthBrand />
          <p className="text-center text-sm text-zinc-400">
            {error ?? "Вход через Telegram…"}
          </p>
        </div>
      </div>
    );
  }

  if (error && isTelegram && !hasSession) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#07090d] px-4">
        <div className="w-full max-w-sm">
          <AuthBrand />
        <p className="text-center text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={openPasswordLogin}
          className="text-sm text-emerald-400 hover:underline"
        >
          Войти по логину и паролю
        </button>
        </div>
      </div>
    );
  }

  return children;
}

"use client";

import { registerWithTelegramAction } from "@/app/auth/telegram/actions";
import { useTelegram } from "@/components/TelegramProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  onUsePassword: () => void;
};

export function TelegramOnboarding({ onUsePassword }: Props) {
  const { initData } = useTelegram();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleNewAccount() {
    if (!initData) return;
    setBusy(true);
    setError(null);
    const result = await registerWithTelegramAction(initData);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.replace("/map");
    router.refresh();
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-xl font-bold">Вход в mutchio</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Если у тебя уже есть аккаунт на сайте (логин и пароль), сначала войди
          им — потом привяжешь Telegram в настройках. Иначе создастся второй
          аккаунт.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onUsePassword}
            className="rounded-lg bg-emerald-600 py-2.5 text-sm font-medium hover:bg-emerald-500"
          >
            У меня уже есть аккаунт
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleNewAccount()}
            className="rounded-lg border border-white/15 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            {busy ? "Создание…" : "Новый аккаунт через Telegram"}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

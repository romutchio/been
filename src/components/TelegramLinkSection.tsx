"use client";

import { useState } from "react";
import { createTelegramLinkAction } from "@/app/settings/actions";
import { useTelegram } from "@/components/TelegramProvider";
import { linkTelegramForSessionAction } from "@/app/auth/telegram/actions";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";

type Props = {
  telegramId: number | null;
  telegramUsername: string | null;
};

export function TelegramLinkSection({
  telegramId,
  telegramUsername,
}: Props) {
  const { isTelegram, initData, openExternal } = useTelegram();
  const router = useRouter();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (telegramId) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-sky-400" />
          <h2 className="text-lg font-semibold">Telegram</h2>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {telegramUsername
            ? `@${telegramUsername}`
            : `ID ${telegramId}`}{" "}
          — привязан
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Можно входить через Mini App без пароля.
        </p>
      </section>
    );
  }

  async function handleCreateLink() {
    setBusy(true);
    setError(null);
    const result = await createTelegramLinkAction();
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.link) setLink(result.link);
  }

  async function handleLinkInApp() {
    if (!initData) return;
    setBusy(true);
    setError(null);
    const result = await linkTelegramForSessionAction(initData);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-sky-400" />
        <h2 className="text-lg font-semibold">Telegram</h2>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        Привяжи Telegram, чтобы входить через Mini App. Логин и пароль на сайте
        останутся.
      </p>

      {isTelegram ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleLinkInApp()}
          className="mt-4 w-full rounded-lg bg-sky-600 py-2.5 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "Привязка…" : "Привязать этот Telegram"}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleCreateLink()}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
          >
            {busy ? "Создание ссылки…" : "Получить ссылку для привязки"}
          </button>
          {link && (
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
              <p className="mb-2 text-zinc-500">
                Открой в Telegram (действует 15 минут):
              </p>
              <button
                type="button"
                onClick={() => openExternal(link)}
                className="break-all text-left text-sky-400 hover:underline"
              >
                {link}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}

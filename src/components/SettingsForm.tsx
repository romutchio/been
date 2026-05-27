"use client";

import { useActionState } from "react";
import {
  resendVerificationAction,
  updateEmailAction,
  type SettingsState,
} from "@/app/settings/actions";
import { TelegramLinkSection } from "@/components/TelegramLinkSection";
import { CheckCircle2, Mail } from "lucide-react";

type Props = {
  username: string;
  email: string | null;
  emailVerified: boolean;
  telegramId: number | null;
  telegramUsername: string | null;
};

export function SettingsForm({
  username,
  email,
  emailVerified,
  telegramId,
  telegramUsername,
}: Props) {
  const [emailState, emailAction, emailPending] = useActionState<
    SettingsState,
    FormData
  >(updateEmailAction, null);
  const [resendState, resendAction, resendPending] = useActionState<
    SettingsState,
    FormData
  >(async (_prev, _formData) => resendVerificationAction(), null);

  const message = emailState?.success || resendState?.success;
  const error = emailState?.error || resendState?.error;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Аккаунт</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Логин для входа:{" "}
          <span className="text-zinc-300">@{username}</span>
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Email</h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500">
          Нужен для восстановления пароля. Подтверди email по ссылке из письма.
          После смены адреса письмо уходит только на новый; сброс пароля
          работает лишь после подтверждения.
        </p>

        {email && emailVerified && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {email} — подтверждён
          </div>
        )}

        {email && !emailVerified && (
          <div className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            {email} — ожидает подтверждения
          </div>
        )}

        <form action={emailAction} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={email ?? ""}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <button
            type="submit"
            disabled={emailPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {emailPending ? "Сохранение…" : "Сохранить email"}
          </button>
        </form>

        {email && !emailVerified && (
          <form action={resendAction} className="mt-3">
            <button
              type="submit"
              disabled={resendPending}
              className="text-sm text-emerald-400 hover:underline disabled:opacity-50"
            >
              {resendPending ? "Отправка…" : "Отправить письмо ещё раз"}
            </button>
          </form>
        )}
      </section>

      <TelegramLinkSection
        telegramId={telegramId}
        telegramUsername={telegramUsername}
      />

      {message && <p className="text-sm text-emerald-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type AuthState,
} from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
    null,
  );

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-xl font-bold text-emerald-400"
        >
          mutchio
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold">Сброс пароля</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Только подтверждённый email из настроек аккаунта. На случайный адрес
            письмо не придёт — это нормально.
          </p>
          {state?.success ? (
            <p className="mt-6 text-sm text-emerald-400">{state.success}</p>
          ) : (
            <form action={formAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
                />
              </label>
              {state?.error && (
                <p className="text-sm text-red-400">{state.error}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {pending ? "Отправка…" : "Отправить ссылку"}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/login" className="text-emerald-400 hover:underline">
              ← Назад ко входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

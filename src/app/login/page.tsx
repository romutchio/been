"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { signInAction, type AuthState } from "@/app/auth/actions";
import { useTelegram } from "@/components/TelegramProvider";

function LoginForm() {
  const { isTelegram } = useTelegram();
  const searchParams = useSearchParams();
  const resetDone = searchParams.get("reset") === "1";
  const tgError = searchParams.get("tg_error");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    null,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
      <h1 className="text-2xl font-bold">Вход</h1>
      <p className="mt-1 text-sm text-zinc-500">Логин и пароль</p>
      {isTelegram && (
        <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
          После входа открой Настройки → Привязать Telegram, чтобы не создавать
          второй аккаунт.
        </p>
      )}
      {resetDone && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Пароль обновлён. Войди с новым паролем.
        </p>
      )}
      {tgError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {decodeURIComponent(tgError)}
        </p>
      )}
      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Логин</span>
          <input
            name="username"
            required
            autoComplete="username"
            pattern="[a-z0-9_]{3,24}"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Пароль</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
          />
        </label>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:underline"
          >
            Забыли пароль?
          </Link>
        </div>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {pending ? "Вход…" : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Нет аккаунта?{" "}
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Регистрация
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-xl font-bold text-emerald-400"
        >
          mutchio
        </Link>
        <Suspense fallback={<p className="text-center text-zinc-500">Загрузка…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

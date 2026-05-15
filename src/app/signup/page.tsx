"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthState } from "@/app/auth/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUpAction,
    null,
  );

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-xl font-bold text-emerald-400"
        >
          been
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="mt-1 text-sm text-zinc-500">Начни отмечать страны</p>
          <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Username</span>
              <input
                name="username"
                required
                autoComplete="username"
                pattern="[a-z0-9_]{3,24}"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </label>
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
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Пароль</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </label>
            {state?.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-emerald-400">{state.success}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {pending ? "Создание…" : "Создать аккаунт"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Войти
            </Link>
          </p>
        </div>
        </div>
    </div>
  );
}

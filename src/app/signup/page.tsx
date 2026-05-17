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
          mutchio
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Логин и пароль — без почты
          </p>
          <form action={formAction} className="mt-6 space-y-4">
            <AuthField
              label="Логин"
              name="username"
              required
              autoComplete="username"
              pattern="[a-z0-9_]{3,24}"
              hint="Латиница, цифры, _ · 3–24 символа"
            />
            <AuthField
              label="Имя (необязательно)"
              name="display_name"
              placeholder="Как показывать друзьям"
            />
            <AuthField
              label="Пароль"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Минимум 6 символов"
            />
            {state?.error && (
              <p className="text-sm text-red-400">{state.error}</p>
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

function AuthField({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-400">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
      />
      {hint && <span className="mt-1 block text-xs text-zinc-600">{hint}</span>}
    </label>
  );
}

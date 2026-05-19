"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { resetPasswordAction, type AuthState } from "@/app/auth/actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    null,
  );

  if (!token) {
    return (
      <p className="mt-6 text-sm text-red-400">
        Ссылка недействительна. Запроси сброс пароля заново.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">Новый пароль</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">Повтор пароля</span>
        <input
          name="password_confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-500/50"
        />
      </label>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Сохранение…" : "Сохранить пароль"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold">Новый пароль</h1>
          <p className="mt-1 text-sm text-zinc-500">Придумай новый пароль для входа</p>
          <Suspense fallback={<p className="mt-6 text-sm text-zinc-500">Загрузка…</p>}>
            <ResetPasswordForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/login" className="text-emerald-400 hover:underline">
              ← Ко входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

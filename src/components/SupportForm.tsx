"use client";

import { useActionState } from "react";
import { submitSupportAction, type SupportState } from "@/app/support/actions";

type Props = {
  defaultEmail: string;
};

export function SupportForm({ defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState<SupportState, FormData>(
    submitSupportAction,
    null,
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">Email для ответа</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1 block text-sm text-zinc-400">Сообщение</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Опиши вопрос или проблему"
          className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </label>
      {state?.error && (
        <p className="mt-3 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-3 text-sm text-emerald-400">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}

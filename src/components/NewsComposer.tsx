"use client";

import { useActionState, useEffect, useRef } from "react";
import { createWallPostAction, type NewsState } from "@/app/news/actions";

export function NewsComposer() {
  const [state, formAction, pending] = useActionState<NewsState, FormData>(
    createWallPostAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Новая запись</span>
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={3}
          placeholder="Что нового?"
          className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-600">До 2000 символов</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {pending ? "Публикация…" : "Опубликовать"}
        </button>
      </div>
      {state?.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-2 text-sm text-emerald-400">{state.success}</p>
      )}
    </form>
  );
}

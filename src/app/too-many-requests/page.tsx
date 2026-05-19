import Link from "next/link";
import { Timer } from "lucide-react";

export default function TooManyRequestsPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="mb-8 block text-xl font-bold text-emerald-400"
        >
          mutchio
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Timer className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-amber-400">429</p>
          <h1 className="mt-1 text-2xl font-bold">Слишком много запросов</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            С этого IP слишком часто отправляли форму. Подожди минуту и попробуй
            снова.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-600 py-2.5 text-sm font-medium hover:bg-emerald-500"
            >
              К регистрации
            </Link>
            <Link
              href="/login"
              className="py-2 text-sm text-zinc-500 hover:text-emerald-400"
            >
              Ко входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

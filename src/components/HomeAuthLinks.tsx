"use client";

import Link from "next/link";
import { useTelegram } from "@/components/TelegramProvider";

export function HomeAuthLinks() {
  const { isTelegram } = useTelegram();
  const loginHref = "/login";
  const startHref = isTelegram ? "/login" : "/signup";

  return (
    <div className="flex gap-2 sm:gap-3">
      <Link
        href={loginHref}
        className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 sm:px-4"
      >
        Войти
      </Link>
      <Link
        href={startHref}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 sm:px-4"
      >
        Начать
      </Link>
    </div>
  );
}

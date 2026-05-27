"use client";

import Link from "next/link";
import { useTelegram } from "@/components/TelegramProvider";

export function HomeMainCta() {
  const { isTelegram } = useTelegram();
  const href = isTelegram ? "/login" : "/signup";

  return (
    <Link
      href={href}
      className="mt-10 inline-block rounded-xl bg-emerald-600 px-8 py-3 font-medium hover:bg-emerald-500"
    >
      Создать аккаунт
    </Link>
  );
}

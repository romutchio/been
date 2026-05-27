"use client";

import { useTelegram } from "@/components/TelegramProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** С главной в Mini App уводим на /login (там выбор входа / регистрации) */
export function TelegramHomeRedirect() {
  const { isTelegram, isReady } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (isReady && isTelegram) {
      router.replace("/login");
    }
  }, [isReady, isTelegram, router]);

  return null;
}

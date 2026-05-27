"use server";

import {
  createSessionToken,
  getSessionUserId,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  parseTelegramLinkToken,
  validateTelegramInitData,
} from "@/lib/auth/telegram";
import { consumeAuthToken } from "@/lib/auth/tokens";
import {
  getProfileByTelegramId,
  linkTelegramToProfile,
  registerTelegramUser,
} from "@/lib/auth/users";

export type TelegramAuthState = {
  error?: string;
  ok?: boolean;
  /** Telegram не привязан — нужен выбор: войти по паролю или создать новый */
  needsChoice?: boolean;
} | null;

async function establishSession(userId: string): Promise<TelegramAuthState> {
  const token = await createSessionToken(userId);
  await setSessionCookie(token);
  return { ok: true };
}

/** Вход только если Telegram уже привязан (без авто-регистрации) */
export async function signInWithTelegramAction(
  initData: string,
): Promise<TelegramAuthState> {
  const parsed = validateTelegramInitData(initData);
  if (!parsed) return { error: "Недействительные данные Telegram" };

  const linkToken = parseTelegramLinkToken(parsed.startParam);
  if (linkToken) {
    return linkTelegramWithTokenAction(initData, linkToken);
  }

  const existing = await getProfileByTelegramId(parsed.user.id);
  if (!existing) {
    return { needsChoice: true };
  }

  return establishSession(existing.id);
}

/** Явное создание нового аккаунта через Telegram */
export async function registerWithTelegramAction(
  initData: string,
): Promise<TelegramAuthState> {
  const parsed = validateTelegramInitData(initData);
  if (!parsed) return { error: "Недействительные данные Telegram" };

  const existing = await getProfileByTelegramId(parsed.user.id);
  if (existing) {
    return {
      error:
        "Этот Telegram уже привязан. Войди по логину или используй тот аккаунт.",
    };
  }

  const created = await registerTelegramUser(parsed.user);
  if ("error" in created) return { error: created.error };
  return establishSession(created.userId);
}

export async function linkTelegramWithTokenAction(
  initData: string,
  linkToken: string,
): Promise<TelegramAuthState> {
  const parsed = validateTelegramInitData(initData);
  if (!parsed) return { error: "Недействительные данные Telegram" };

  const userId = await consumeAuthToken(linkToken, "telegram_link");
  if (!userId) {
    return { error: "Ссылка для привязки устарела. Создай новую в настройках." };
  }

  const linked = await linkTelegramToProfile(userId, parsed.user);
  if ("error" in linked) return { error: linked.error };

  const token = await createSessionToken(userId);
  await setSessionCookie(token);
  return { ok: true };
}

/** Привязка Telegram к уже залогиненному аккаунту (настройки в Mini App) */
export async function linkTelegramForSessionAction(
  initData: string,
): Promise<TelegramAuthState> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Нужно войти в аккаунт" };

  const parsed = validateTelegramInitData(initData);
  if (!parsed) return { error: "Недействительные данные Telegram" };

  const linked = await linkTelegramToProfile(userId, parsed.user);
  if ("error" in linked) return { error: linked.error };
  return { ok: true };
}

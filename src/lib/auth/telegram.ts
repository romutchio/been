import { createHmac, timingSafeEqual } from "crypto";

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type ValidatedTelegramInitData = {
  user: TelegramWebAppUser;
  authDate: number;
  startParam: string | null;
};

const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не настроен");
  return token;
}

function buildDataCheckString(params: URLSearchParams): string {
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  return pairs.join("\n");
}

export function validateTelegramInitData(
  initData: string,
): ValidatedTelegramInitData | null {
  const trimmed = initData.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams(trimmed);
  const hash = params.get("hash");
  if (!hash) return null;

  const dataCheckString = buildDataCheckString(params);
  const secretKey = createHmac("sha256", "WebAppData")
    .update(getBotToken())
    .digest();

  const calculated = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(calculated, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return null;
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > MAX_AUTH_AGE_SEC) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramWebAppUser;
  try {
    user = JSON.parse(userRaw) as TelegramWebAppUser;
  } catch {
    return null;
  }

  if (!user?.id || !user.first_name) return null;

  return {
    user,
    authDate,
    startParam: params.get("start_param"),
  };
}

export function parseTelegramLinkToken(
  startParam: string | null,
): string | null {
  if (!startParam?.startsWith("link_")) return null;
  const token = startParam.slice("link_".length);
  return token.length > 0 ? token : null;
}

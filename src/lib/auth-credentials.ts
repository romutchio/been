const AUTH_DOMAIN =
  process.env.AUTH_EMAIL_DOMAIN?.trim() || "been.local";

export function usernameToAuthEmail(username: string): string {
  return `${username.toLowerCase()}@${AUTH_DOMAIN}`;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return "Логин: 3–24 символа, латиница, цифры и _";
  }
  return null;
}

export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Неверный логин или пароль";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Этот логин уже занят";
  }
  if (m.includes("password") && m.includes("short")) {
    return "Пароль минимум 6 символов";
  }
  return message;
}

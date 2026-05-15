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
  if (m.includes("duplicate") || m.includes("unique")) {
    return "Этот логин уже занят";
  }
  return message;
}

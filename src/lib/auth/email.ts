export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Некорректный email";
  }
  if (email.length > 254) return "Email слишком длинный";
  return null;
}

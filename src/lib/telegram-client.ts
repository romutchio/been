/** В Mini App: пользователь выбрал вход по логину/паролю, не авто-Telegram */
export const TG_PASSWORD_LOGIN_KEY = "mutchio_tg_password_login";

export function enableTelegramPasswordLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TG_PASSWORD_LOGIN_KEY, "1");
}

export function clearTelegramPasswordLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TG_PASSWORD_LOGIN_KEY);
}

export function isTelegramPasswordLogin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TG_PASSWORD_LOGIN_KEY) === "1";
}

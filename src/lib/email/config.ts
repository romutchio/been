export function getAppUrl(): string {
  const url = process.env.APP_URL?.trim() || "https://mutchio.ru";
  return url.replace(/\/$/, "");
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "mutchio <noreply@mutchio.ru>";
}

/** Куда приходят обращения в поддержку */
export function getSupportEmailTo(): string {
  const to = process.env.SUPPORT_EMAIL?.trim();
  if (!to) {
    throw new Error("SUPPORT_EMAIL не настроен");
  }
  return to;
}

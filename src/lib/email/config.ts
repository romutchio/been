export function getAppUrl(): string {
  const url = process.env.APP_URL?.trim() || "https://mutchio.ru";
  return url.replace(/\/$/, "");
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "mutchio <noreply@mutchio.ru>";
}

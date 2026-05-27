/** @username бота без @, для deep link привязки */
export function getTelegramBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME?.trim() || "MutchioBot";
}

export function buildTelegramLinkUrl(startAppParam: string): string {
  const bot = getTelegramBotUsername();
  return `https://t.me/${bot}/map?startapp=${encodeURIComponent(startAppParam)}`;
}

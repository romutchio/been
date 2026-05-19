function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;padding:24px;background:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto">
<tr><td style="background:#07090d;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:32px 32px 0;text-align:center"><span style="font-size:22px;font-weight:700;color:#34d399">mutchio</span></td></tr>
${body}
<tr><td style="padding:20px 32px 32px;border-top:1px solid rgba(255,255,255,0.08)">
<p style="margin:0;font-size:12px;color:#52525b">mutchio · карта путешествий</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function passwordResetEmailHtml(params: {
  username: string;
  resetUrl: string;
}): string {
  const body = `
<tr><td style="padding:24px 32px 8px"><h1 style="margin:0;font-size:22px;font-weight:700;color:#f4f4f5">Сброс пароля</h1></td></tr>
<tr><td style="padding:0 32px 24px"><p style="margin:0;font-size:15px;line-height:1.6;color:#a1a1aa">
Привет! Запрос на смену пароля для аккаунта <strong style="color:#e4e4e7">@${params.username}</strong>.
Нажми кнопку ниже, чтобы задать новый пароль.</p></td></tr>
<tr><td style="padding:0 32px 28px;text-align:center">
<a href="${params.resetUrl}" style="display:inline-block;padding:14px 28px;background:#059669;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px">Сбросить пароль</a>
</td></tr>
<tr><td style="padding:0 32px 24px">
<p style="margin:0;font-size:13px;line-height:1.5;color:#71717a">Ссылка действует <strong style="color:#a1a1aa">1 час</strong>. Если кнопка не работает:</p>
<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#34d399;word-break:break-all">${params.resetUrl}</p>
<p style="margin:16px 0 0;font-size:13px;color:#71717a">Не запрашивал сброс? Просто проигнорируй письмо.</p>
</td></tr>`;
  return layout("Сброс пароля — mutchio", body);
}

export function passwordResetEmailText(params: {
  username: string;
  resetUrl: string;
}): string {
  return `Сброс пароля на mutchio

Запрос для аккаунта @${params.username}.

Перейди по ссылке (действует 1 час):
${params.resetUrl}

Если это не ты — ничего делать не нужно.

— mutchio`;
}

export function verifyEmailHtml(params: {
  username: string;
  verifyUrl: string;
}): string {
  const body = `
<tr><td style="padding:24px 32px 8px"><h1 style="margin:0;font-size:22px;font-weight:700;color:#f4f4f5">Подтверждение email</h1></td></tr>
<tr><td style="padding:0 32px 24px"><p style="margin:0;font-size:15px;line-height:1.6;color:#a1a1aa">
Подтверди email для аккаунта <strong style="color:#e4e4e7">@${params.username}</strong> — так ты сможешь восстановить пароль, если забудешь.</p></td></tr>
<tr><td style="padding:0 32px 28px;text-align:center">
<a href="${params.verifyUrl}" style="display:inline-block;padding:14px 28px;background:#059669;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px">Подтвердить email</a>
</td></tr>
<tr><td style="padding:0 32px 24px">
<p style="margin:0;font-size:13px;line-height:1.5;color:#71717a">Ссылка действует <strong style="color:#a1a1aa">24 часа</strong>.</p>
<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#34d399;word-break:break-all">${params.verifyUrl}</p>
</td></tr>`;
  return layout("Подтвердите email — mutchio", body);
}

export function verifyEmailText(params: {
  username: string;
  verifyUrl: string;
}): string {
  return `Подтвердите email на mutchio

Аккаунт @${params.username}.

Ссылка (24 часа):
${params.verifyUrl}

— mutchio`;
}

import { Resend } from "resend";
import { getEmailFrom, getSupportEmailTo } from "@/lib/email/config";
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
  supportEmailHtml,
  supportEmailText,
  verifyEmailHtml,
  verifyEmailText,
} from "@/lib/email/templates";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY не настроен");
  return new Resend(key);
}

export async function sendPasswordResetEmail(params: {
  to: string;
  username: string;
  resetUrl: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: params.to,
    subject: "Сброс пароля на mutchio",
    html: passwordResetEmailHtml(params),
    text: passwordResetEmailText(params),
  });
  if (error) throw new Error(error.message);
}

export async function sendVerifyEmail(params: {
  to: string;
  username: string;
  verifyUrl: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: params.to,
    subject: "Подтвердите email на mutchio",
    html: verifyEmailHtml(params),
    text: verifyEmailText(params),
  });
  if (error) throw new Error(error.message);
}

export async function sendSupportEmail(params: {
  fromEmail: string;
  username: string;
  userId: string;
  message: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: getSupportEmailTo(),
    replyTo: params.fromEmail,
    subject: `Поддержка mutchio — @${params.username}`,
    html: supportEmailHtml(params),
    text: supportEmailText(params),
  });
  if (error) throw new Error(error.message);
}

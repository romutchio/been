"use server";

import { normalizeEmail, validateEmail } from "@/lib/auth/email";
import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { sendSupportEmail } from "@/lib/email/send";

export type SupportState = { error?: string; success?: string } | null;

const MIN_MSG = 10;
const MAX_MSG = 5000;

export async function submitSupportAction(
  _prev: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Нужно войти в аккаунт" };

  const rawEmail = (formData.get("email") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim() ?? "";

  const emailError = validateEmail(rawEmail);
  if (emailError) return { error: emailError };

  if (message.length < MIN_MSG) {
    return { error: `Сообщение минимум ${MIN_MSG} символов` };
  }
  if (message.length > MAX_MSG) {
    return { error: `Сообщение максимум ${MAX_MSG} символов` };
  }

  const email = normalizeEmail(rawEmail);

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "Профиль не найден" };

  try {
    await sendSupportEmail({
      fromEmail: email,
      username: profile.username,
      userId,
      message,
    });
  } catch (e) {
    console.error("support email failed", e);
    return {
      error:
        e instanceof Error ? e.message : "Не удалось отправить. Попробуй позже.",
    };
  }

  return {
    success: "Сообщение отправлено. Ответим на указанный email.",
  };
}

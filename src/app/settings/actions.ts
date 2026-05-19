"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, validateEmail } from "@/lib/auth/email";
import { storeAuthToken } from "@/lib/auth/tokens";
import { getAppUrl } from "@/lib/email/config";
import { sendVerifyEmail } from "@/lib/email/send";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export type SettingsState = {
  error?: string;
  success?: string;
} | null;

const VERIFY_TTL = 24 * 60 * 60 * 1000;

async function requireUserId() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function updateEmailAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const userId = await requireUserId();
  const ip = await getClientIp();

  const ipLimit = await checkRateLimit("email_update_ip", ip, 10, 60 * 60 * 1000);
  if (!ipLimit.ok) return { error: ipLimit.message };

  const rawEmail = (formData.get("email") as string)?.trim() ?? "";
  if (!rawEmail) {
    return { error: "Укажи email" };
  }

  const emailError = validateEmail(rawEmail);
  if (emailError) return { error: emailError };

  const email = normalizeEmail(rawEmail);
  const emailLimit = await checkRateLimit(
    "email_update_email",
    email,
    3,
    60 * 60 * 1000,
  );
  if (!emailLimit.ok) return { error: emailLimit.message };

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "Профиль не найден" };

  if (profile.email === email && profile.email) {
    return { success: "Email уже привязан" };
  }

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .neq("id", userId)
    .maybeSingle();

  if (taken) return { error: "Этот email уже используется" };

  const { error } = await supabase
    .from("profiles")
    .update({
      email,
      email_verified_at: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  try {
    const raw = await storeAuthToken(userId, "email_verify", VERIFY_TTL);
    await sendVerifyEmail({
      to: email,
      username: profile.username,
      verifyUrl: `${getAppUrl()}/verify-email?token=${encodeURIComponent(raw)}`,
    });
  } catch (e) {
    console.error("verify email send failed", e);
    return { error: "Email сохранён, но письмо не отправилось. Попробуй ещё раз." };
  }

  revalidatePath("/settings");
  return {
    success: "Письмо с подтверждением отправлено на новый адрес",
  };
}

export async function resendVerificationAction(): Promise<SettingsState> {
  const userId = await requireUserId();
  const ip = await getClientIp();
  const ipLimit = await checkRateLimit("verify_resend_ip", ip, 5, 60 * 60 * 1000);
  if (!ipLimit.ok) return { error: ipLimit.message };

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, email_verified_at")
    .eq("id", userId)
    .single();

  if (!profile?.email) {
    return { error: "Сначала укажи email" };
  }
  if (profile.email_verified_at) {
    return { success: "Email уже подтверждён" };
  }

  try {
    const raw = await storeAuthToken(userId, "email_verify", VERIFY_TTL);
    await sendVerifyEmail({
      to: profile.email,
      username: profile.username,
      verifyUrl: `${getAppUrl()}/verify-email?token=${encodeURIComponent(raw)}`,
    });
  } catch (e) {
    console.error("verify resend failed", e);
    return { error: "Не удалось отправить письмо" };
  }

  return { success: "Письмо отправлено повторно" };
}

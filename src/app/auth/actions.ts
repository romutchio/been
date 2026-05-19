"use server";

import {
  createSessionToken,
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  registerUser,
  updateUserPassword,
  verifyUserLogin,
  getProfileByVerifiedEmail,
} from "@/lib/auth/users";
import {
  normalizeUsername,
  translateAuthError,
  validateUsername,
} from "@/lib/auth-credentials";
import { normalizeEmail, validateEmail } from "@/lib/auth/email";
import { storeAuthToken, consumeAuthToken } from "@/lib/auth/tokens";
import { getAppUrl } from "@/lib/email/config";
import { sendPasswordResetEmail, sendVerifyEmail } from "@/lib/email/send";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: string;
} | null;

const HOUR = 60 * 60 * 1000;
const RESET_TTL = HOUR;
const VERIFY_TTL = 24 * HOUR;

function mapAuthError(code: string): string {
  if (code === "username_taken") return "Этот логин уже занят";
  if (code === "email_taken") return "Этот email уже используется";
  if (code === "invalid_username") {
    return "Логин: 3–24 символа, латиница, цифры и _";
  }
  if (code === "weak_password") return "Пароль минимум 6 символов";
  return translateAuthError(code);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername((formData.get("username") as string) ?? "");
  const password = formData.get("password") as string;
  const displayName =
    (formData.get("display_name") as string)?.trim() || username;
  const rawEmail = (formData.get("email") as string)?.trim() ?? "";

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  if (!password || password.length < 6) {
    return { error: "Пароль минимум 6 символов" };
  }

  let email: string | null = null;
  if (rawEmail) {
    const emailError = validateEmail(rawEmail);
    if (emailError) return { error: emailError };
    email = normalizeEmail(rawEmail);
  }

  try {
    const result = await registerUser(username, password, displayName, email);

    if ("error" in result) {
      return { error: mapAuthError(result.error) };
    }

    if (email) {
      try {
        const raw = await storeAuthToken(
          result.userId,
          "email_verify",
          VERIFY_TTL,
        );
        await sendVerifyEmail({
          to: email,
          username,
          verifyUrl: `${getAppUrl()}/verify-email?token=${encodeURIComponent(raw)}`,
        });
      } catch (e) {
        console.error("verify email send failed", e);
      }
    }

    const token = await createSessionToken(result.userId);
    await setSessionCookie(token);
    redirect("/map");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return {
      error: err instanceof Error ? err.message : "Ошибка регистрации",
    };
  }
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername((formData.get("username") as string) ?? "");
  const password = formData.get("password") as string;

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  if (!password) return { error: "Введи пароль" };

  try {
    const userId = await verifyUserLogin(username, password);

    if (!userId) {
      return { error: "Неверный логин или пароль" };
    }

    const token = await createSessionToken(userId);
    await setSessionCookie(token);
    redirect("/map");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return {
      error: err instanceof Error ? err.message : "Ошибка входа",
    };
  }
}

export async function signOutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawEmail = (formData.get("email") as string)?.trim() ?? "";
  const emailError = validateEmail(rawEmail);
  if (emailError) return { error: emailError };

  const email = normalizeEmail(rawEmail);

  const profile = await getProfileByVerifiedEmail(email);

  if (profile?.email) {
    try {
      const raw = await storeAuthToken(
        profile.id,
        "password_reset",
        RESET_TTL,
      );
      await sendPasswordResetEmail({
        to: profile.email,
        username: profile.username,
        resetUrl: `${getAppUrl()}/reset-password?token=${encodeURIComponent(raw)}`,
      });
    } catch (e) {
      console.error("password reset email failed", e);
    }
  }

  return {
    success:
      "Запрос принят. Письмо придёт только если этот адрес привязан к аккаунту и подтверждён. Проверь входящие и спам.",
  };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawToken = (formData.get("token") as string)?.trim() ?? "";
  const password = formData.get("password") as string;
  const confirm = formData.get("password_confirm") as string;

  if (!rawToken) return { error: "Ссылка недействительна" };
  if (!password || password.length < 6) {
    return { error: "Пароль минимум 6 символов" };
  }
  if (password !== confirm) return { error: "Пароли не совпадают" };

  const userId = await consumeAuthToken(rawToken, "password_reset");
  if (!userId) {
    return { error: "Ссылка устарела или уже использована" };
  }

  await updateUserPassword(userId, password);
  redirect("/login?reset=1");
}

export async function verifyEmailAction(
  rawToken: string,
): Promise<{ ok: boolean }> {
  const userId = await consumeAuthToken(rawToken, "email_verify");
  if (!userId) return { ok: false };

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", userId);

  return { ok: true };
}

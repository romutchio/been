"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createSessionToken,
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  normalizeUsername,
  translateAuthError,
  validateUsername,
} from "@/lib/auth-credentials";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
} | null;

function mapRpcError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("username_taken")) return "Этот логин уже занят";
  if (m.includes("invalid_username")) return "Логин: 3–24 символа, латиница, цифры и _";
  if (m.includes("weak_password")) return "Пароль минимум 6 символов";
  return translateAuthError(message);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername((formData.get("username") as string) ?? "");
  const password = formData.get("password") as string;
  const displayName =
    (formData.get("display_name") as string)?.trim() || username;

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  if (!password || password.length < 6) {
    return { error: "Пароль минимум 6 символов" };
  }

  try {
    const supabase = await createClient();

    const { data: userId, error } = await supabase.rpc("register_user", {
      p_username: username,
      p_password: password,
      p_display_name: displayName,
    });

    if (error) {
      return { error: mapRpcError(error.message) };
    }

    if (!userId || typeof userId !== "string") {
      return { error: "Ошибка регистрации" };
    }

    const token = await createSessionToken(userId);
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
    const supabase = await createClient();

    const { data: userId, error } = await supabase.rpc("verify_user_password", {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return { error: mapRpcError(error.message) };
    }

    if (!userId) {
      return { error: "Неверный логин или пароль" };
    }

    const token = await createSessionToken(userId as string);
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

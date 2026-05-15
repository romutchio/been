"use server";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeUsername,
  translateAuthError,
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/auth-credentials";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: string;
} | null;

function authErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("ENOTFOUND") || err.message.includes("fetch failed")) {
      return (
        "Не удалось подключиться к Supabase. Проверь .env.local и перезапусти dev-сервер."
      );
    }
    return translateAuthError(err.message);
  }
  return "Неизвестная ошибка";
}

async function isUsernameAvailable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_available", {
    name: username,
  });
  if (error) {
    // RPC missing — fallback: check profiles (works when logged in only)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    return !profile;
  }
  return data === true;
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

    const available = await isUsernameAvailable(supabase, username);
    if (!available) {
      return { error: "Этот логин уже занят" };
    }

    const { data, error } = await supabase.auth.signUp({
      email: usernameToAuthEmail(username),
      password,
      options: {
        data: { username, display_name: displayName },
      },
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    if (data.user && !data.session) {
      return {
        error:
          "Включено подтверждение email в Supabase — отключи: Authentication → Email → Confirm email",
      };
    }

    redirect("/map");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: authErrorMessage(err) };
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

  if (!password) {
    return { error: "Введи пароль" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(username),
      password,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    redirect("/map");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: authErrorMessage(err) };
  }
}

"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
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

async function isUsernameAvailable(username: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin.rpc("is_username_available", { name: username });
  if (data === false) return false;
  if (data === true) return true;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return !profile;
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

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Добавь SUPABASE_SERVICE_ROLE_KEY в .env.local (Project Settings → API → service_role)",
    };
  }

  try {
    if (!(await isUsernameAvailable(username))) {
      return { error: "Этот логин уже занят" };
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);

    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      username,
      display_name: displayName,
    });

    if (profileError) {
      return { error: translateAuthError(profileError.message) };
    }

    const { error: credError } = await admin
      .from("account_credentials")
      .insert({ user_id: userId, password_hash: passwordHash });

    if (credError) {
      await admin.from("profiles").delete().eq("id", userId);
      return { error: translateAuthError(credError.message) };
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

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Добавь SUPABASE_SERVICE_ROLE_KEY в .env.local (Project Settings → API → service_role)",
    };
  }

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (!profile) {
      return { error: "Неверный логин или пароль" };
    }

    const { data: cred } = await admin
      .from("account_credentials")
      .select("password_hash")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (!cred || !(await verifyPassword(password, cred.password_hash))) {
      return { error: "Неверный логин или пароль" };
    }

    const token = await createSessionToken(profile.id);
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

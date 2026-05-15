"use server";

import {
  createSessionToken,
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { registerUser, verifyUserLogin } from "@/lib/auth/users";
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

function mapAuthError(code: string): string {
  if (code === "username_taken") return "Этот логин уже занят";
  if (code === "invalid_username") return "Логин: 3–24 символа, латиница, цифры и _";
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

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  if (!password || password.length < 6) {
    return { error: "Пароль минимум 6 символов" };
  }

  try {
    const result = await registerUser(username, password, displayName);

    if ("error" in result) {
      return { error: mapAuthError(result.error) };
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

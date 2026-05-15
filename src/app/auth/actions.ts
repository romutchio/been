"use server";

import { createClient } from "@/lib/supabase/server";
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
        "Не удалось подключиться к Supabase. Проверь NEXT_PUBLIC_SUPABASE_URL в .env.local и перезапусти dev-сервер (Ctrl+C → npm run dev)."
      );
    }
    return err.message;
  }
  return "Неизвестная ошибка";
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const username = (formData.get("username") as string)?.trim().toLowerCase();

  if (!email || !password) {
    return { error: "Заполни email и пароль" };
  }

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return { error: "Username: 3–24 символа, латиница, цифры, _" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user && !data.session) {
      return {
        success:
          "Аккаунт создан. Проверь почту и перейди по ссылке для подтверждения, затем войди.",
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
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Заполни email и пароль" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    redirect("/map");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: authErrorMessage(err) };
  }
}

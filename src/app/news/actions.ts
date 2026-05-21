"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type NewsState = { error?: string; success?: string } | null;

const MAX_LEN = 2000;

export async function createWallPostAction(
  _prev: NewsState,
  formData: FormData,
): Promise<NewsState> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Нужно войти в аккаунт" };

  const body = (formData.get("body") as string)?.trim() ?? "";
  if (!body) return { error: "Напиши что-нибудь" };
  if (body.length > MAX_LEN) {
    return { error: `Максимум ${MAX_LEN} символов` };
  }

  const supabase = createClient();
  const { error } = await supabase.from("wall_posts").insert({
    user_id: userId,
    body,
  });

  if (error) return { error: error.message };

  revalidatePath("/news");
  return { success: "Опубликовано" };
}

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, WallPost } from "@/types/database";

export const getWallPosts = cache(async (limit = 100): Promise<WallPost[]> => {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from("wall_posts")
    .select("id, user_id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !posts?.length) return [];

  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p as Pick<Profile, "id" | "username" | "display_name">]),
  );

  return posts.map((p) => ({
    ...p,
    profile: profileMap.get(p.user_id),
  }));
});

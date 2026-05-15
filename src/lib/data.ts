import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Trip } from "@/types/database";

export async function getCurrentProfile() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return profile as Profile | null;
}

export async function getUserTravelData(userId: string) {
  const supabase = createClient();

  const [visitsRes, wishlistRes] = await Promise.all([
    supabase.from("visits").select("country_code").eq("user_id", userId),
    supabase.from("wishlist").select("country_code").eq("user_id", userId),
  ]);

  return {
    visited: (visitsRes.data ?? []).map((v) => v.country_code),
    wishlist: (wishlistRes.data ?? []).map((w) => w.country_code),
  };
}

export async function getTrips(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("trips")
    .select("*, trip_countries(country_code), trip_cities(id, country_code, city_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Trip[];
}

export async function getFriendProfile(friendId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", friendId)
    .single();
  return data as Profile | null;
}

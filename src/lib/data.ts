import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Trip } from "@/types/database";

export const getCurrentProfile = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return profile as Profile | null;
});

/** Profile + visits/wishlist in one parallel round-trip batch. */
export const getProfileWithTravel = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [profile, travel] = await Promise.all([
    getCurrentProfile(),
    getUserTravelData(userId),
  ]);

  if (!profile) return null;
  return { profile, ...travel };
});

export const getUserTravelData = cache(async (userId: string) => {
  const supabase = createClient();

  const [visitsRes, wishlistRes] = await Promise.all([
    supabase.from("visits").select("country_code").eq("user_id", userId),
    supabase.from("wishlist").select("country_code").eq("user_id", userId),
  ]);

  return {
    visited: (visitsRes.data ?? []).map((v) => v.country_code),
    wishlist: (wishlistRes.data ?? []).map((w) => w.country_code),
  };
});

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

export type LeaderboardEntry = {
  rank: number;
  profile: Profile;
  countries: number;
};

const fetchLeaderboard = unstable_cache(
  async (): Promise<LeaderboardEntry[]> => {
    const supabase = createClient();

    const { data: visits } = await supabase
      .from("visits")
      .select("user_id, country_code");

    const counts = new Map<string, Set<string>>();
    for (const v of visits ?? []) {
      let set = counts.get(v.user_id);
      if (!set) {
        set = new Set();
        counts.set(v.user_id, set);
      }
      set.add(v.country_code);
    }

    const sorted = [...counts.entries()]
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 50);
    if (sorted.length === 0) return [];

    const userIds = sorted.map(([id]) => id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p as Profile]),
    );

    return sorted
      .map(([userId, codes], index) => {
        const profile = profileMap.get(userId);
        if (!profile) return null;
        return {
          rank: index + 1,
          profile,
          countries: codes.size,
        };
      })
      .filter((e): e is LeaderboardEntry => e !== null);
  },
  ["leaderboard"],
  { revalidate: 30 },
);

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchLeaderboard();
}

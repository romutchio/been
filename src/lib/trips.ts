import { createClient } from "@/lib/supabase/server";
import type { Trip, TripStatus } from "@/types/database";

export function isTripPlanned(trip: { status?: TripStatus }): boolean {
  return (trip.status ?? "completed") === "planned";
}

export async function getPlannedCountryCodes(userId: string): Promise<string[]> {
  const supabase = createClient();

  const { data: memberRows } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", userId);

  const memberTripIds = (memberRows ?? []).map((r) => r.trip_id);

  const [ownedRes, sharedRes] = await Promise.all([
    supabase
      .from("trips")
      .select("trip_countries(country_code)")
      .eq("user_id", userId)
      .eq("status", "planned"),
    memberTripIds.length > 0
      ? supabase
          .from("trips")
          .select("trip_countries(country_code)")
          .in("id", memberTripIds)
          .eq("status", "planned")
      : Promise.resolve({ data: [] as { trip_countries: { country_code: string }[] }[] }),
  ]);

  const codes = new Set<string>();
  for (const trip of [...(ownedRes.data ?? []), ...(sharedRes.data ?? [])]) {
    for (const tc of trip.trip_countries ?? []) {
      codes.add(tc.country_code);
    }
  }
  return [...codes];
}

export async function getTripsForUser(userId: string): Promise<Trip[]> {
  const supabase = createClient();

  const { data: memberRows } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", userId);

  const memberTripIds = (memberRows ?? []).map((r) => r.trip_id);

  const tripSelect =
    "*, trip_countries(country_code), trip_cities(id, country_code, city_name), trip_members(user_id, profile:profiles(id, username, display_name))";

  const [ownedRes, sharedRes] = await Promise.all([
    supabase
      .from("trips")
      .select(tripSelect)
      .eq("user_id", userId)
      .order("start_date", { ascending: false, nullsFirst: false }),
    memberTripIds.length > 0
      ? supabase
          .from("trips")
          .select(tripSelect)
          .in("id", memberTripIds)
          .order("start_date", { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] as Trip[] }),
  ]);

  const byId = new Map<string, Trip>();
  for (const trip of [...(ownedRes.data ?? []), ...(sharedRes.data ?? [])]) {
    byId.set(trip.id, trip as Trip);
  }

  return [...byId.values()].sort((a, b) => {
    const da = a.start_date ?? a.created_at;
    const db = b.start_date ?? b.created_at;
    return db.localeCompare(da);
  });
}

export async function getAcceptedFriends(userId: string) {
  const supabase = createClient();
  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const friendIds = new Set<string>();
  for (const f of friendships ?? []) {
    friendIds.add(f.requester_id === userId ? f.addressee_id : f.requester_id);
  }

  if (friendIds.size === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", [...friendIds]);

  return profiles ?? [];
}

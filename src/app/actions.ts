"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TripPayload } from "@/types/database";

async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");
  const supabase = createClient();
  return { supabase, user: { id: userId } };
}

function revalidateVisits() {
  revalidatePath("/map");
  revalidatePath("/wishlist");
  revalidatePath("/leaderboard");
}

async function syncVisitsFromCountries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  countryCodes: string[],
  visitedAt: string | null,
) {
  for (const code of countryCodes) {
    const { data: visit } = await supabase
      .from("visits")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .maybeSingle();

    if (!visit) {
      await supabase.from("visits").insert({
        user_id: userId,
        country_code: code,
        visited_at: visitedAt,
      });
    }
  }
}

async function saveTripRelations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tripId: string,
  payload: TripPayload,
) {
  await supabase.from("trip_countries").delete().eq("trip_id", tripId);
  await supabase.from("trip_cities").delete().eq("trip_id", tripId);

  const countries = [...new Set(payload.countries.map((c) => c.toUpperCase()))];
  if (countries.length > 0) {
    await supabase.from("trip_countries").insert(
      countries.map((country_code) => ({ trip_id: tripId, country_code })),
    );
  }

  if (payload.cities.length > 0) {
    await supabase.from("trip_cities").insert(
      payload.cities.map((c) => ({
        trip_id: tripId,
        country_code: c.country_code.toUpperCase(),
        city_name: c.city_name.trim(),
      })),
    );
  }
}

function parseTripPayload(formData: FormData): TripPayload {
  const payloadRaw = formData.get("payload") as string;
  if (payloadRaw) {
    const parsed = JSON.parse(payloadRaw) as TripPayload;
    return {
      ...parsed,
      status: parsed.status === "planned" ? "planned" : "completed",
      member_ids: parsed.member_ids ?? [],
    };
  }

  return {
    title: (formData.get("title") as string)?.trim() ?? "",
    notes: (formData.get("notes") as string)?.trim() || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    status: "completed",
    countries: formData
      .getAll("countries")
      .map((c) => String(c).trim().toUpperCase())
      .filter(Boolean),
    cities: [],
    member_ids: [],
  };
}

async function assertFriends(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  memberIds: string[],
) {
  const unique = [...new Set(memberIds.filter((id) => id && id !== ownerId))];
  if (unique.length === 0) return unique;

  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${ownerId},addressee_id.eq.${ownerId}`);

  const friendIds = new Set<string>();
  for (const f of friendships ?? []) {
    friendIds.add(f.requester_id === ownerId ? f.addressee_id : f.requester_id);
  }

  for (const id of unique) {
    if (!friendIds.has(id)) {
      throw new Error("Можно добавлять только друзей в поездку");
    }
  }
  return unique;
}

async function saveTripMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tripId: string,
  ownerId: string,
  memberIds: string[],
) {
  const valid = await assertFriends(supabase, ownerId, memberIds);

  await supabase.from("trip_members").delete().eq("trip_id", tripId);

  if (valid.length > 0) {
    await supabase.from("trip_members").insert(
      valid.map((user_id) => ({ trip_id: tripId, user_id })),
    );
  }
}

export async function toggleVisit(countryCode: string, visitedAt?: string) {
  const { supabase, user } = await requireUser();
  const code = countryCode.toUpperCase();

  const { data: existing } = await supabase
    .from("visits")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (existing) {
    await supabase.from("visits").delete().eq("id", existing.id);
  } else {
    await supabase.from("visits").insert({
      user_id: user.id,
      country_code: code,
      visited_at: visitedAt ?? null,
    });
  }

  revalidateVisits();
}

export async function addVisit(countryCode: string) {
  const { supabase, user } = await requireUser();
  const code = countryCode.toUpperCase();

  const { data: existing } = await supabase
    .from("visits")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (!existing) {
    await supabase.from("visits").insert({
      user_id: user.id,
      country_code: code,
    });
  }

  revalidateVisits();
}

export async function toggleWishlist(countryCode: string) {
  const { supabase, user } = await requireUser();
  const code = countryCode.toUpperCase();

  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist").delete().eq("id", existing.id);
  } else {
    await supabase.from("wishlist").insert({
      user_id: user.id,
      country_code: code,
    });
  }

  revalidatePath("/map");
  revalidatePath("/wishlist");
}

export async function addToWishlist(countryCode: string) {
  const { supabase, user } = await requireUser();
  const code = countryCode.toUpperCase();

  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (!existing) {
    await supabase.from("wishlist").insert({
      user_id: user.id,
      country_code: code,
    });
  }

  revalidatePath("/map");
  revalidatePath("/wishlist");
}

export async function createTrip(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = parseTripPayload(formData);

  if (!payload.title) throw new Error("Title required");

  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: payload.title,
      notes: payload.notes,
      start_date: payload.start_date,
      end_date: payload.end_date,
      status: payload.status,
    })
    .select("id")
    .single();

  if (error || !trip) throw new Error(error?.message ?? "Failed to create trip");

  await saveTripRelations(supabase, trip.id, payload);
  await saveTripMembers(supabase, trip.id, user.id, payload.member_ids);

  if (payload.status === "completed") {
    await syncVisitsFromCountries(
      supabase,
      user.id,
      payload.countries,
      payload.start_date,
    );
  }

  revalidatePath("/trips");
  revalidateVisits();
}

export async function updateTrip(tripId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = parseTripPayload(formData);

  if (!payload.title) throw new Error("Title required");

  const { error } = await supabase
    .from("trips")
    .update({
      title: payload.title,
      notes: payload.notes,
      start_date: payload.start_date,
      end_date: payload.end_date,
      status: payload.status,
    })
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  await saveTripRelations(supabase, tripId, payload);
  await saveTripMembers(supabase, tripId, user.id, payload.member_ids);

  if (payload.status === "completed") {
    await syncVisitsFromCountries(
      supabase,
      user.id,
      payload.countries,
      payload.start_date,
    );
  }

  revalidatePath("/trips");
  revalidateVisits();
}

export async function completeTrip(tripId: string) {
  const { supabase, user } = await requireUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, start_date, trip_countries(country_code)")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .eq("status", "planned")
    .maybeSingle();

  if (!trip) throw new Error("Поездка не найдена или уже завершена");

  const countries =
    trip.trip_countries?.map((c) => c.country_code) ?? [];

  const { error } = await supabase
    .from("trips")
    .update({ status: "completed" })
    .eq("id", tripId);

  if (error) throw new Error(error.message);

  await syncVisitsFromCountries(
    supabase,
    user.id,
    countries,
    trip.start_date,
  );

  revalidatePath("/trips");
  revalidateVisits();
}

export async function deleteTrip(tripId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id);
  revalidatePath("/trips");
  revalidateVisits();
}

export async function sendFriendRequest(username: string) {
  const { supabase, user } = await requireUser();

  const normalized = username.trim().toLowerCase();
  if (!normalized) throw new Error("Username required");

  const { data: friend } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", normalized)
    .maybeSingle();

  if (!friend) throw new Error("User not found");
  if (friend.id === user.id) throw new Error("Cannot add yourself");

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: friend.id,
    status: "pending",
  });

  if (error?.code === "23505") throw new Error("Request already sent");
  if (error) throw new Error(error.message);

  revalidatePath("/friends");
}

export async function respondFriendRequest(
  friendshipId: string,
  accept: boolean,
) {
  const { supabase } = await requireUser();

  if (accept) {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
  } else {
    await supabase.from("friendships").delete().eq("id", friendshipId);
  }

  revalidatePath("/friends");
  revalidatePath("/map");
}

export async function removeFriend(friendshipId: string) {
  const { supabase, user } = await requireUser();

  const { data: friendship } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("id", friendshipId)
    .maybeSingle();

  if (!friendship) throw new Error("Дружба не найдена");
  if (
    friendship.requester_id !== user.id &&
    friendship.addressee_id !== user.id
  ) {
    throw new Error("Нет доступа");
  }

  await supabase.from("friendships").delete().eq("id", friendshipId);

  revalidatePath("/friends");
  revalidatePath("/map");
}

import Link from "next/link";
import { MapClient } from "@/components/MapClient";
import {
  getProfileWithTravel,
  getFriendProfile,
  getUserTravelData,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ friend?: string }>;
};

export default async function MapPage({ searchParams }: Props) {
  const { friend: friendId } = await searchParams;
  const me = await getProfileWithTravel();
  if (!me) return null;
  const {
    profile,
    visited: visitedList,
    wishlist: wishlistList,
    planned: plannedList,
  } = me;
  const own = {
    visited: visitedList,
    wishlist: wishlistList,
    planned: plannedList,
  };

  if (friendId) {
    const friend = await getFriendProfile(friendId);
    if (!friend) {
      return (
        <p className="text-zinc-500">
          Пользователь не найден.{" "}
          <Link href="/map" className="text-emerald-400">
            Вернуться
          </Link>
        </p>
      );
    }

    const supabase = createClient();
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id")
      .eq("status", "accepted")
      .or(
        `and(requester_id.eq.${profile.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${profile.id})`,
      )
      .maybeSingle();

    if (!friendship) {
      return (
        <p className="text-zinc-500">
          Можно смотреть карту только друзей.{" "}
          <Link href="/friends" className="text-emerald-400">
            К друзьям
          </Link>
        </p>
      );
    }

    const friendData = await getUserTravelData(friendId);

    return (
      <div className="space-y-4">
        <Link
          href="/map"
          className="text-sm text-emerald-400 hover:underline"
        >
          ← Моя карта
        </Link>
        <MapClient
          visited={own.visited}
          wishlist={own.wishlist}
          planned={own.planned}
          friendVisited={friendData.visited}
          friendName={friend.display_name ?? friend.username}
        />
      </div>
    );
  }

  return (
    <MapClient
      visited={own.visited}
      wishlist={own.wishlist}
      planned={own.planned}
    />
  );
}

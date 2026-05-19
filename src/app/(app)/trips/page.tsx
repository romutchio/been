import { TripsClient } from "@/components/TripsClient";
import { getAcceptedFriends, getCurrentProfile, getTrips } from "@/lib/data";

export default async function TripsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [trips, friends] = await Promise.all([
    getTrips(profile.id),
    getAcceptedFriends(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Поездки</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Запланируй будущие поездки с друзьями · завершённые отмечают страны
          на карте
        </p>
      </div>
      <TripsClient
        trips={trips}
        friends={friends}
        currentUserId={profile.id}
      />
    </div>
  );
}

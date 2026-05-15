import { TripsClient } from "@/components/TripsClient";
import { getCurrentProfile, getTrips } from "@/lib/data";

export default async function TripsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const trips = await getTrips(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Поездки</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Все поездки · фильтр по годам · редактирование
        </p>
      </div>
      <TripsClient trips={trips} />
    </div>
  );
}

import { getCurrentProfile, getLeaderboard } from "@/lib/data";
import { TOTAL_COUNTRIES } from "@/lib/countries";
import { LeaderboardList } from "@/components/LeaderboardList";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const [profile, entries] = await Promise.all([
    getCurrentProfile(),
    getLeaderboard(),
  ]);
  if (!profile) return null;

  const myEntry = entries.find((e) => e.profile.id === profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Trophy className="h-7 w-7 text-amber-400" />
          Лидерборд
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Топ-50 по числу посещённых стран (из {TOTAL_COUNTRIES})
        </p>
      </div>

      {myEntry && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-emerald-400">
            Твоё место: <span className="font-bold">#{myEntry.rank}</span> ·{" "}
            {myEntry.countries} {pluralCountries(myEntry.countries)}
          </p>
        </div>
      )}

      <LeaderboardList entries={entries} currentUserId={profile.id} />
    </div>
  );
}

function pluralCountries(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "страна";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "страны";
  }
  return "стран";
}

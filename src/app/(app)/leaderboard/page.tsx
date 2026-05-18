import { getCurrentProfile, getLeaderboard } from "@/lib/data";
import { LeaderboardIntro } from "@/components/LeaderboardIntro";
import { LeaderboardList } from "@/components/LeaderboardList";
import { pluralCountries } from "@/lib/plural";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const [profile, { entries, travelerCount }] = await Promise.all([
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
        <LeaderboardIntro travelerCount={travelerCount} />
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

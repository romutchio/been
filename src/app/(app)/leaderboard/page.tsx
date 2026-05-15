import { getCurrentProfile, getLeaderboard } from "@/lib/data";
import { TOTAL_COUNTRIES } from "@/lib/countries";
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
          Рейтинг по числу посещённых стран (из {TOTAL_COUNTRIES})
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

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Пока никто не отметил страны на карте
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry) => {
            const isMe = entry.profile.id === profile.id;
            return (
              <li
                key={entry.profile.id}
                className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                  isMe
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    entry.rank === 1
                      ? "bg-amber-500/20 text-amber-400"
                      : entry.rank === 2
                        ? "bg-zinc-400/20 text-zinc-300"
                        : entry.rank === 3
                          ? "bg-orange-600/20 text-orange-400"
                          : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {entry.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {entry.profile.display_name ?? entry.profile.username}
                    {isMe && (
                      <span className="ml-2 text-xs text-emerald-400">ты</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500">@{entry.profile.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">
                    {entry.countries}
                  </p>
                  <p className="text-xs text-zinc-500">стран</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
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

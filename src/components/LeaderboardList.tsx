import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/data";

type Props = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

export function LeaderboardList({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Пока никто не отметил страны на карте
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => {
        const isMe = currentUserId === entry.profile.id;
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
              <Link
                href={`/info/${entry.profile.username}`}
                className="block hover:text-emerald-400"
              >
                <p className="truncate font-medium">
                  {entry.profile.display_name ?? entry.profile.username}
                  {isMe && (
                    <span className="ml-2 text-xs text-emerald-400">ты</span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  @{entry.profile.username}
                </p>
              </Link>
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
  );
}

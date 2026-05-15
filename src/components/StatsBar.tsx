import { calcStats } from "@/lib/countries";

type Props = {
  visitedCodes: string[];
};

export function StatsBar({ visitedCodes }: Props) {
  const { visited, total, percent } = calcStats(visitedCodes);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Посещено" value={visited.toString()} />
      <StatCard label="Из всего" value={`${visited} / ${total}`} />
      <StatCard label="Мир" value={`${percent}%`} highlight />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

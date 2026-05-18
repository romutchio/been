import { calcStats } from "@/lib/countries";

type Props = {
  visitedCodes: string[];
  onVisitedClick?: () => void;
  onTotalClick?: () => void;
};

export function StatsBar({
  visitedCodes,
  onVisitedClick,
  onTotalClick,
}: Props) {
  const { visited, total, percent } = calcStats(visitedCodes);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Посещено"
        value={visited.toString()}
        onClick={onVisitedClick}
      />
      <StatCard
        label="Из всего"
        value={`${visited} / ${total}`}
        onClick={onTotalClick}
      />
      <StatCard label="Мир" value={`${percent}%`} highlight />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  onClick,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </>
  );

  if (!onClick) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98]"
    >
      {content}
    </button>
  );
}

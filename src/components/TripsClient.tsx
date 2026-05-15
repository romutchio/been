"use client";

import { useMemo, useState } from "react";
import { TripEditor } from "@/components/TripEditor";
import { TripTimeline } from "@/components/TripTimeline";
import type { Trip } from "@/types/database";

type Props = {
  trips: Trip[];
};

function tripYear(trip: Trip): number {
  const d = trip.start_date ?? trip.end_date ?? trip.created_at;
  return new Date(d).getFullYear();
}

export function TripsClient({ trips }: Props) {
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const years = useMemo(() => {
    const set = new Set(trips.map(tripYear));
    return [...set].sort((a, b) => b - a);
  }, [trips]);

  const filtered =
    yearFilter === "all"
      ? trips
      : trips.filter((t) => tripYear(t) === yearFilter);

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <TripEditor
          key={editingTrip?.id ?? "new"}
          trip={editingTrip}
          onCancel={() => setEditingTrip(null)}
          onSaved={() => setEditingTrip(null)}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Год:</span>
            <YearButton
              active={yearFilter === "all"}
              onClick={() => setYearFilter("all")}
            >
              Все ({trips.length})
            </YearButton>
            {years.map((y) => (
              <YearButton
                key={y}
                active={yearFilter === y}
                onClick={() => setYearFilter(y)}
              >
                {y} ({trips.filter((t) => tripYear(t) === y).length})
              </YearButton>
            ))}
          </div>

          <TripTimeline
            trips={filtered}
            totalCount={trips.length}
            onEdit={setEditingTrip}
          />
        </div>
      </div>
    </div>
  );
}

function YearButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${
        active
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

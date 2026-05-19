"use client";

import { useMemo, useState } from "react";
import { TripEditor } from "@/components/TripEditor";
import { TripTimeline } from "@/components/TripTimeline";
import { isTripPlanned } from "@/lib/trips";
import type { Trip } from "@/types/database";

type FriendOption = {
  id: string;
  username: string;
  display_name: string | null;
};

type Props = {
  trips: Trip[];
  friends: FriendOption[];
  currentUserId: string;
};

type Filter = "all" | "planned" | "completed" | number;

function tripYear(trip: Trip): number {
  const d = trip.start_date ?? trip.end_date ?? trip.created_at;
  return new Date(d).getFullYear();
}

export function TripsClient({ trips, friends, currentUserId }: Props) {
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const years = useMemo(() => {
    const set = new Set(trips.map(tripYear));
    return [...set].sort((a, b) => b - a);
  }, [trips]);

  const plannedCount = trips.filter((t) => isTripPlanned(t)).length;
  const completedCount = trips.length - plannedCount;

  const filtered = useMemo(() => {
    if (filter === "planned") {
      return trips.filter((t) => isTripPlanned(t));
    }
    if (filter === "completed") {
      return trips.filter((t) => !isTripPlanned(t));
    }
    if (filter === "all") return trips;
    return trips.filter((t) => tripYear(t) === filter);
  }, [trips, filter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <TripEditor
          key={editingTrip?.id ?? "new"}
          trip={editingTrip}
          friends={friends}
          currentUserId={currentUserId}
          onCancel={() => setEditingTrip(null)}
          onSaved={() => setEditingTrip(null)}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Показать:</span>
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Все ({trips.length})
            </FilterButton>
            <FilterButton
              active={filter === "planned"}
              onClick={() => setFilter("planned")}
            >
              Запланированные ({plannedCount})
            </FilterButton>
            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              Завершённые ({completedCount})
            </FilterButton>
          </div>

          {years.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-zinc-500">Год:</span>
              {years.map((y) => (
                <FilterButton
                  key={y}
                  active={filter === y}
                  onClick={() => setFilter(y)}
                >
                  {y}
                </FilterButton>
              ))}
            </div>
          )}

          <TripTimeline
            trips={filtered}
            totalCount={trips.length}
            currentUserId={currentUserId}
            onEdit={setEditingTrip}
          />
        </div>
      </div>
    </div>
  );
}

function FilterButton({
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

"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CheckCircle2, Pencil, Trash2, Users } from "lucide-react";
import { completeTrip, deleteTrip } from "@/app/actions";
import { getCountryName } from "@/lib/countries";
import { isTripPlanned } from "@/lib/trips";
import type { Trip } from "@/types/database";

type Props = {
  trips: Trip[];
  totalCount: number;
  currentUserId: string;
  onEdit: (trip: Trip) => void;
};

export function TripTimeline({
  trips,
  totalCount,
  currentUserId,
  onEdit,
}: Props) {
  if (totalCount === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
        Пока нет поездок. Добавь первую слева!
      </p>
    );
  }

  if (trips.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
        Нет поездок за выбранный фильтр
      </p>
    );
  }

  const sorted = [...trips].sort((a, b) => {
    const da = a.start_date ?? a.created_at;
    const db = b.start_date ?? b.created_at;
    return db.localeCompare(da);
  });

  return (
    <ol className="relative space-y-6 border-l border-white/10 pl-6">
      {sorted.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          currentUserId={currentUserId}
          onEdit={onEdit}
        />
      ))}
    </ol>
  );
}

function TripCard({
  trip,
  currentUserId,
  onEdit,
}: {
  trip: Trip;
  currentUserId: string;
  onEdit: (trip: Trip) => void;
}) {
  const [pending, startTransition] = useTransition();
  const planned = isTripPlanned(trip);
  const isOwner = trip.user_id === currentUserId;
  const countries =
    trip.trip_countries?.map((tc) => tc.country_code) ?? [];
  const cities = trip.trip_cities ?? [];
  const members = trip.trip_members ?? [];
  const dateLabel = formatTripDates(trip.start_date, trip.end_date);

  return (
    <li className="relative">
      <span
        className={`absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 bg-[#07090d] ${
          planned ? "border-sky-400" : "border-emerald-400"
        }`}
      />
      <div
        className={`rounded-xl border p-4 ${
          planned
            ? "border-sky-500/25 bg-sky-500/5"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{trip.title}</h3>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  planned
                    ? "bg-sky-500/20 text-sky-300"
                    : "bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {planned ? "Запланирована" : "Завершена"}
              </span>
              {!isOwner && (
                <span className="text-xs text-zinc-500">совместная</span>
              )}
            </div>
            {dateLabel && (
              <p className="mt-0.5 text-sm text-zinc-500">{dateLabel}</p>
            )}
          </div>
          <div className="flex gap-1">
            {isOwner && planned && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => completeTrip(trip.id))
                }
                className="rounded-lg p-1.5 text-sky-400 hover:bg-sky-500/10"
                aria-label="Завершить поездку"
                title="Завершить и отметить страны"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={() => onEdit(trip)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-emerald-400"
                aria-label="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => deleteTrip(trip.id))}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {members.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Users className="h-3.5 w-3.5" />
            {members
              .map((m) => m.profile?.display_name ?? m.profile?.username)
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {trip.notes && (
          <p className="mt-2 text-sm text-zinc-400">{trip.notes}</p>
        )}
        {countries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {countries.map((code) => (
              <span
                key={code}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  planned
                    ? "bg-sky-500/15 text-sky-300"
                    : "bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {getCountryName(code)}
              </span>
            ))}
          </div>
        )}
        {cities.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-sm text-zinc-400">
            {cities.map((c) => (
              <li key={c.id}>
                {c.city_name}
                <span className="text-zinc-600">
                  {" "}
                  · {getCountryName(c.country_code)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function formatTripDates(start: string | null, end: string | null) {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    format(new Date(d), "d MMM yyyy", { locale: ru });
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (start) return fmt(start);
  return end ? fmt(end) : null;
}

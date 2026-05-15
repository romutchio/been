"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTrip } from "@/app/actions";
import { getCountryName } from "@/lib/countries";
import type { Trip } from "@/types/database";

type Props = {
  trips: Trip[];
  totalCount: number;
  onEdit: (trip: Trip) => void;
};

export function TripTimeline({ trips, totalCount, onEdit }: Props) {
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
        Нет поездок за выбранный год
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
        <TripCard key={trip.id} trip={trip} onEdit={onEdit} />
      ))}
    </ol>
  );
}

function TripCard({
  trip,
  onEdit,
}: {
  trip: Trip;
  onEdit: (trip: Trip) => void;
}) {
  const [pending, startTransition] = useTransition();
  const countries =
    trip.trip_countries?.map((tc) => tc.country_code) ?? [];
  const cities = trip.trip_cities ?? [];
  const dateLabel = formatTripDates(trip.start_date, trip.end_date);

  return (
    <li className="relative">
      <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-emerald-400 bg-[#07090d]" />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{trip.title}</h3>
            {dateLabel && (
              <p className="mt-0.5 text-sm text-zinc-500">{dateLabel}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(trip)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-emerald-400"
              aria-label="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => deleteTrip(trip.id))}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {trip.notes && (
          <p className="mt-2 text-sm text-zinc-400">{trip.notes}</p>
        )}
        {countries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {countries.map((code) => (
              <span
                key={code}
                className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400"
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

"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createTrip, updateTrip } from "@/app/actions";
import { CountrySearch } from "@/components/CountrySearch";
import { CitySearch } from "@/components/CitySearch";
import { getCountryName } from "@/lib/countries";
import type { Trip, TripPayload } from "@/types/database";

type Props = {
  trip?: Trip | null;
  onCancel?: () => void;
  onSaved?: () => void;
};

export function TripEditor({ trip, onCancel, onSaved }: Props) {
  const isEdit = !!trip;
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(trip?.title ?? "");
  const [notes, setNotes] = useState(trip?.notes ?? "");
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [countries, setCountries] = useState<string[]>(
    trip?.trip_countries?.map((c) => c.country_code) ?? [],
  );
  const [cities, setCities] = useState<{ country_code: string; city_name: string }[]>(
    trip?.trip_cities?.map((c) => ({
      country_code: c.country_code,
      city_name: c.city_name,
    })) ?? [],
  );
  const [cityCountry, setCityCountry] = useState<string | null>(
    countries[0] ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  function addCountry(code: string) {
    if (!countries.includes(code)) {
      setCountries((prev) => [...prev, code]);
      if (!cityCountry) setCityCountry(code);
    }
  }

  function removeCountry(code: string) {
    setCountries((prev) => prev.filter((c) => c !== code));
    setCities((prev) => prev.filter((c) => c.country_code !== code));
    if (cityCountry === code) {
      setCityCountry(countries.find((c) => c !== code) ?? null);
    }
  }

  function addCity(cityName: string) {
    if (!cityCountry) return;
    const key = `${cityCountry}:${cityName.toLowerCase()}`;
    const exists = cities.some(
      (c) => `${c.country_code}:${c.city_name.toLowerCase()}` === key,
    );
    if (!exists) {
      setCities((prev) => [
        ...prev,
        { country_code: cityCountry, city_name: cityName },
      ]);
    }
  }

  function removeCity(countryCode: string, cityName: string) {
    setCities((prev) =>
      prev.filter(
        (c) =>
          !(c.country_code === countryCode && c.city_name === cityName),
      ),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: TripPayload = {
      title: title.trim(),
      notes: notes.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      countries,
      cities,
    };

    if (!payload.title) {
      setError("Укажи название поездки");
      return;
    }

    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));

    startTransition(async () => {
      try {
        if (isEdit && trip) {
          await updateTrip(trip.id, fd);
        } else {
          await createTrip(fd);
        }
        onSaved?.();
        if (!isEdit) {
          setTitle("");
          setNotes("");
          setStartDate("");
          setEndDate("");
          setCountries([]);
          setCities([]);
          setCityCountry(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {isEdit ? "Редактировать поездку" : "Новая поездка"}
        </h2>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-zinc-500 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Название (например, Италия 2024)"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Заметки (необязательно)"
        className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
      />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Страны
        </p>
        <CountrySearch
          placeholder="Найти и добавить страну…"
          onSelect={addCountry}
          exclude={new Set(countries)}
        />
        {countries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {countries.map((code) => (
              <Tag key={code} onRemove={() => removeCountry(code)}>
                {getCountryName(code)}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {countries.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Города
          </p>
          <div className="mb-2 flex flex-wrap gap-1">
            {countries.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCityCountry(code)}
                className={`rounded-md px-2 py-1 text-xs ${
                  cityCountry === code
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {getCountryName(code)}
              </button>
            ))}
          </div>
          {cityCountry && (
            <CitySearch
              countryCode={cityCountry}
              onSelect={addCity}
              exclude={
                new Set(
                  cities
                    .filter((c) => c.country_code === cityCountry)
                    .map((c) => c.city_name.toLowerCase()),
                )
              }
            />
          )}
          {cities.length > 0 && (
            <ul className="mt-2 space-y-1">
              {cities.map((c) => (
                <li
                  key={`${c.country_code}-${c.city_name}`}
                  className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1 text-sm"
                >
                  <span>
                    {c.city_name}
                    <span className="ml-1 text-zinc-500">
                      ({getCountryName(c.country_code)})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCity(c.country_code, c.city_name)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Сохранение…" : isEdit ? "Сохранить" : "Добавить поездку"}
      </button>
    </form>
  );
}

function Tag({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
      {children}
      <button type="button" onClick={onRemove} className="hover:text-white">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { WorldMap } from "@/components/WorldMap";
import { CountrySearch } from "@/components/CountrySearch";
import { StatsBar } from "@/components/StatsBar";
import { getCountryName } from "@/lib/countries";

type Props = {
  displayName: string;
  username: string;
  visited: string[];
};

export function PublicProfileMap({ displayName, username, visited }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const visitedSet = new Set(visited);

  function focusCountry(code: string) {
    setSelected(code);
    setFocusCode(code);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
        <p className="mt-1 text-sm text-zinc-500">@{username}</p>
      </div>

      <StatsBar visitedCodes={visited} />

      <CountrySearch
        placeholder="Найти страну на карте…"
        onSelect={focusCountry}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <WorldMap
          visited={visitedSet}
          wishlist={new Set()}
          selectedCode={selected}
          focusCode={focusCode}
          onCountryClick={focusCountry}
        />
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 backdrop-blur">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    {getCountryName(selected)}
                  </h3>
                  <p className="text-sm text-zinc-500">{selected}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setFocusCode(null);
                  }}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p
                className={`flex items-center gap-2 text-sm ${
                  visitedSet.has(selected) ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {visitedSet.has(selected) ? (
                  <>
                    <Check className="h-4 w-4" />
                    Был(а) в этой стране
                  </>
                ) : (
                  "Страна не отмечена"
                )}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              Выбери страну на карте или в поиске
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
            <Legend color="var(--map-visited)" label="Посещено" />
            <Legend color="var(--map-default)" label="Не посещено" />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Создай аккаунт
        </Link>
        , чтобы отмечать свои страны
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

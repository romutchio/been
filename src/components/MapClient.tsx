"use client";

import { useState, useTransition } from "react";
import { WorldMap } from "@/components/WorldMap";
import { CountryPanel } from "@/components/CountryPanel";
import { CountrySearch } from "@/components/CountrySearch";
import { StatsBar } from "@/components/StatsBar";
import { addVisit } from "@/app/actions";

type Props = {
  visited: string[];
  wishlist: string[];
  friendVisited?: string[];
  friendName?: string;
};

export function MapClient({
  visited,
  wishlist,
  friendVisited,
  friendName,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visitedSet = new Set(visited);
  const wishlistSet = new Set(wishlist);
  const friendSet = friendVisited ? new Set(friendVisited) : undefined;
  const compareMode = !!friendName;

  function focusCountry(code: string) {
    setSelected(code);
    setFocusCode(code);
  }

  function handleSearchSelect(code: string) {
    focusCountry(code);
    if (!compareMode) {
      startTransition(() => addVisit(code));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {friendName ? `Сравнение с ${friendName}` : "Моя карта"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {compareMode
            ? "Зелёный — только вы · фиолетовый — только друг · красный — оба"
            : "Кликни на страну или найди через поиск"}
        </p>
      </div>

      {!compareMode && <StatsBar visitedCodes={visited} />}

      <CountrySearch
        placeholder={
          compareMode
            ? "Найти страну на карте…"
            : "Найти страну и отметить посещение…"
        }
        onSelect={handleSearchSelect}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <WorldMap
          visited={visitedSet}
          wishlist={wishlistSet}
          friendVisited={friendSet}
          selectedCode={selected}
          focusCode={focusCode}
          onCountryClick={focusCountry}
        />
        <div className="space-y-3">
          {selected ? (
            <CountryPanel
              code={selected}
              myVisited={visitedSet.has(selected)}
              friendVisited={friendSet?.has(selected) ?? false}
              wished={wishlistSet.has(selected)}
              compareMode={compareMode}
              onClose={() => {
                setSelected(null);
                setFocusCode(null);
              }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              {compareMode
                ? "Выбери страну для сравнения"
                : "Выбери страну на карте или в поиске"}
            </div>
          )}
          <MapLegend showFriend={!!friendSet} compareMode={compareMode} />
        </div>
      </div>
    </div>
  );
}

function MapLegend({
  showFriend,
  compareMode,
}: {
  showFriend: boolean;
  compareMode: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
      <Legend color="var(--map-visited)" label="Только вы" />
      {showFriend && (
        <>
          <Legend color="var(--map-friend)" label="Только друг" />
          {compareMode && (
            <Legend color="var(--map-both)" label="Оба" />
          )}
        </>
      )}
      {!compareMode && (
        <Legend color="var(--map-wishlist)" label="Хочу" />
      )}
      <Legend color="var(--map-default)" label="Никто" />
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

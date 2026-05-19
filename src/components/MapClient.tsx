"use client";

import { useState } from "react";
import { WorldMap } from "@/components/WorldMap";
import { CountryPanel } from "@/components/CountryPanel";
import { CountrySearch } from "@/components/CountrySearch";
import { StatsBar } from "@/components/StatsBar";
import { CountryListModal } from "@/components/CountryListModal";
import { CountryActionModal } from "@/components/CountryActionModal";

type ListMode = "visited" | "all";

type Props = {
  visited: string[];
  wishlist: string[];
  planned?: string[];
  friendVisited?: string[];
  friendName?: string;
};

export function MapClient({
  visited,
  wishlist,
  planned = [],
  friendVisited,
  friendName,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const [listMode, setListMode] = useState<ListMode | null>(null);
  const [modalCountry, setModalCountry] = useState<string | null>(null);

  const visitedSet = new Set(visited);
  const wishlistSet = new Set(wishlist);
  const plannedSet = new Set(planned);
  const friendSet = friendVisited ? new Set(friendVisited) : undefined;
  const compareMode = !!friendName;

  function focusCountry(code: string) {
    setSelected(code);
    setFocusCode(code);
  }

  function openCountryModal(code: string) {
    setListMode(null);
    setModalCountry(code);
    focusCountry(code);
  }

  function closeCountryModal() {
    setModalCountry(null);
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
            : "Зелёный — посещено · голубой — запланировано"}
        </p>
      </div>

      {!compareMode && (
        <StatsBar
          visitedCodes={visited}
          onVisitedClick={() => setListMode("visited")}
          onTotalClick={() => setListMode("all")}
        />
      )}

      <CountrySearch
        placeholder="Найти страну на карте…"
        onSelect={focusCountry}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <WorldMap
          visited={visitedSet}
          wishlist={wishlistSet}
          planned={plannedSet}
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

      {listMode && !compareMode && (
        <CountryListModal
          mode={listMode}
          visitedSet={visitedSet}
          onClose={() => setListMode(null)}
          onSelectCountry={openCountryModal}
        />
      )}

      {modalCountry && !compareMode && (
        <CountryActionModal
          code={modalCountry}
          myVisited={visitedSet.has(modalCountry)}
          wished={wishlistSet.has(modalCountry)}
          onClose={closeCountryModal}
        />
      )}
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
        <>
          <Legend color="var(--map-planned)" label="Запланировано" />
          <Legend color="var(--map-wishlist)" label="Хочу" />
        </>
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

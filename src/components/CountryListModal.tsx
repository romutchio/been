"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { COUNTRIES, getCountryName } from "@/lib/countries";
import { searchCountries } from "@/lib/country-search";

type ListMode = "visited" | "all";

type Props = {
  mode: ListMode;
  visitedSet: Set<string>;
  onClose: () => void;
  onSelectCountry: (code: string) => void;
};

export function CountryListModal({
  mode,
  visitedSet,
  onClose,
  onSelectCountry,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const countries = useMemo(() => {
    const base =
      mode === "visited"
        ? COUNTRIES.filter((c) => visitedSet.has(c.code))
        : [...COUNTRIES];

    const filtered = query.trim()
      ? searchCountries(query, 999).filter((c) =>
          mode === "visited" ? visitedSet.has(c.code) : true,
        )
      : base;

    return filtered.sort((a, b) =>
      getCountryName(a.code).localeCompare(getCountryName(b.code), "ru"),
    );
  }, [mode, visitedSet, query]);

  const title =
    mode === "visited"
      ? `Посещено · ${visitedSet.size}`
      : `Все страны · ${visitedSet.size} / ${COUNTRIES.length}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-white/10 bg-zinc-900 shadow-2xl sm:max-h-[80vh] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию…"
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500/50"
              autoComplete="off"
            />
          </div>
        </div>

        <ul className="overflow-y-auto overscroll-contain px-2 py-2">
          {countries.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-zinc-500">
              {mode === "visited"
                ? "Пока нет посещённых стран"
                : "Ничего не найдено"}
            </li>
          ) : (
            countries.map((c) => {
              const isVisited = visitedSet.has(c.code);
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => onSelectCountry(c.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/10 ${
                      isVisited
                        ? "bg-emerald-500/10 text-emerald-100"
                        : "text-zinc-200"
                    }`}
                  >
                    <span className="font-medium">{getCountryName(c.code)}</span>
                    <span
                      className={`text-xs ${
                        isVisited ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {c.code}
                      {isVisited && mode === "all" ? " · ✓" : ""}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

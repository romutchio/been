"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchCities } from "@/lib/city-search";
import { getCountryName } from "@/lib/countries";

type Props = {
  countryCode: string;
  onSelect: (cityName: string) => void;
  exclude?: Set<string>;
};

export function CitySearch({ countryCode, onSelect, exclude }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () =>
      searchCities(query, countryCode).filter(
        (p) => !exclude?.has(p.name.toLowerCase()),
      ),
    [query, countryCode, exclude],
  );

  const trimmed = query.trim();
  const canAddCustom =
    trimmed.length >= 2 &&
    !results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase()) &&
    !exclude?.has(trimmed.toLowerCase());

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(name: string) {
    onSelect(name);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const total = results.length + (canAddCustom ? 1 : 0);
    if (!open || total === 0) {
      if (e.key === "Enter" && canAddCustom) {
        e.preventDefault();
        pick(trimmed);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < results.length) {
        pick(results[active].name);
      } else if (canAddCustom) {
        pick(trimmed);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => trimmed && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={`Город в ${getCountryName(countryCode)}…`}
          className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500/50"
          autoComplete="off"
        />
      </div>
      {open && trimmed.length >= 1 && (results.length > 0 || canAddCustom) && (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
          {results.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                  i === active ? "bg-white/10" : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(p.name)}
              >
                <span className="font-medium">{p.name}</span>
              </button>
            </li>
          ))}
          {canAddCustom && (
            <li>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-white/10 ${
                  active === results.length ? "bg-white/10" : ""
                }`}
                onMouseEnter={() => setActive(results.length)}
                onClick={() => pick(trimmed)}
              >
                Добавить «{trimmed}»
              </button>
            </li>
          )}
        </ul>
      )}
      {open && trimmed.length >= 2 && results.length === 0 && !canAddCustom && (
        <p className="absolute z-30 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
          Город не найден
        </p>
      )}
    </div>
  );
}

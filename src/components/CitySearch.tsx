"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { getCountryName } from "@/lib/countries";

type Place = { name: string; country_code: string | null; region: string | null };

type Props = {
  countryCode: string;
  onSelect: (cityName: string) => void;
  exclude?: Set<string>;
};

export function CitySearch({ countryCode, onSelect, exclude }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          country: countryCode,
        });
        const res = await fetch(`/api/places?${params}`);
        const data = (await res.json()) as Place[];
        setResults(
          data.filter((p) => !exclude?.has(p.name.toLowerCase())),
        );
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, countryCode, exclude]);

  function pick(name: string) {
    onSelect(name);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={`Город в ${getCountryName(countryCode)}…`}
          className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500/50"
          autoComplete="off"
        />
      </div>
      {loading && query.length >= 2 && (
        <p className="absolute z-30 mt-1 text-xs text-zinc-500">Поиск…</p>
      )}
      {open && !loading && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
          {results.map((p) => (
            <li key={`${p.name}-${p.region}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/10"
                onClick={() => pick(p.name)}
              >
                <span className="font-medium">{p.name}</span>
                {p.region && (
                  <span className="ml-2 text-xs text-zinc-500">{p.region}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && query.length >= 2 && results.length === 0 && (
        <p className="absolute z-30 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
          Город не найден
        </p>
      )}
    </div>
  );
}

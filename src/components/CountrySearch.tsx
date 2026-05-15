"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchCountries } from "@/lib/country-search";

type Props = {
  placeholder?: string;
  onSelect: (countryCode: string) => void;
  exclude?: Set<string>;
  className?: string;
};

export function CountrySearch({
  placeholder = "Поиск страны…",
  onSelect,
  exclude,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = searchCountries(query).filter(
    (c) => !exclude?.has(c.code),
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(code: string) {
    onSelect(code);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      pick(results[active].code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500/50"
          autoComplete="off"
        />
      </div>
      {open && query && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
          {results.map((c, i) => (
            <li key={c.code}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/10 ${
                  i === active ? "bg-white/10" : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(c.code)}
              >
                <span>{c.name}</span>
                <span className="text-xs text-zinc-500">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && results.length === 0 && (
        <p className="absolute z-30 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
          Ничего не найдено
        </p>
      )}
    </div>
  );
}

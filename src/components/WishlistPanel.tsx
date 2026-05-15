"use client";

import { useTransition } from "react";
import { toggleWishlist, addToWishlist } from "@/app/actions";
import { getCountryName } from "@/lib/countries";
import { CountrySearch } from "@/components/CountrySearch";
import { Heart, X } from "lucide-react";

type Props = {
  codes: string[];
};

export function WishlistPanel({ codes }: Props) {
  const [pending, startTransition] = useTransition();

  function handleAdd(code: string) {
    startTransition(() => addToWishlist(code));
  }

  return (
    <div className="space-y-4">
      <CountrySearch
        placeholder="Найти страну и добавить в wishlist…"
        onSelect={handleAdd}
        exclude={new Set(codes)}
      />

      {codes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
          Список пуст. Найди страну через поиск выше.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {[...codes]
            .sort((a, b) =>
              getCountryName(a).localeCompare(getCountryName(b), "ru"),
            )
            .map((code) => (
              <li
                key={code}
                className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-amber-400" />
                  <span className="font-medium">{getCountryName(code)}</span>
                  <span className="text-xs text-zinc-500">{code}</span>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => toggleWishlist(code))}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"
                  aria-label="Убрать из wishlist"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

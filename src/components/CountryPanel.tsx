"use client";

import { useTransition } from "react";
import { getCountryName } from "@/lib/countries";
import { toggleVisit, toggleWishlist } from "@/app/actions";
import { Check, Heart, X } from "lucide-react";

type Props = {
  code: string;
  myVisited: boolean;
  friendVisited?: boolean;
  wished: boolean;
  compareMode?: boolean;
  onClose: () => void;
};

export function CountryPanel({
  code,
  myVisited,
  friendVisited = false,
  wished,
  compareMode,
  onClose,
}: Props) {
  const [pending, startTransition] = useTransition();

  function compareMessage(): string {
    if (myVisited && friendVisited) {
      return "Вы оба были в этой стране";
    }
    if (friendVisited) {
      return "Только друг был здесь";
    }
    if (myVisited) {
      return "Только вы были здесь";
    }
    return "Никто из вас не отмечал эту страну";
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{getCountryName(code)}</h3>
          <p className="text-sm text-zinc-500">{code}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {compareMode ? (
        <p className="text-sm text-zinc-300">{compareMessage()}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleVisit(code))}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              myVisited
                ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/40"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Check className="h-4 w-4" />
            {myVisited ? "Был(а) — убрать" : "Отметить посещение"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleWishlist(code))}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              wished
                ? "bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/40"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Heart className="h-4 w-4" />
            {wished ? "В wishlist — убрать" : "Хочу посетить"}
          </button>
        </div>
      )}
    </div>
  );
}

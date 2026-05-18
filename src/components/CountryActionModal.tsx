"use client";

import { useEffect } from "react";
import { CountryPanel } from "@/components/CountryPanel";

type Props = {
  code: string;
  myVisited: boolean;
  friendVisited?: boolean;
  wished: boolean;
  compareMode?: boolean;
  onClose: () => void;
};

export function CountryActionModal({
  code,
  myVisited,
  friendVisited,
  wished,
  compareMode,
  onClose,
}: Props) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-action-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm">
        <CountryPanel
          code={code}
          myVisited={myVisited}
          friendVisited={friendVisited}
          wished={wished}
          compareMode={compareMode}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

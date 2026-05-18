import Link from "next/link";
import { Globe } from "lucide-react";
import { getCurrentProfile } from "@/lib/data";

export async function PublicHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090d]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Globe className="h-4 w-4" />
          </span>
          mutchio
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {profile ? (
            <>
              <Link
                href={`/info/${profile.username}`}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-emerald-400"
              >
                @{profile.username}
              </Link>
              <Link
                href="/map"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Карта
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                Войти
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Начать
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

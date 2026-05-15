"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Heart, LogOut, Map, Users } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

const nav = [
  { href: "/map", label: "Карта", icon: Map },
  { href: "/trips", label: "Поездки", icon: Globe },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/friends", label: "Друзья", icon: Users },
];

type Props = {
  username: string;
  children: React.ReactNode;
};

export function AppShell({ username, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-[#07090d] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/map" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Globe className="h-4 w-4" />
            </span>
            been
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">
              @{username}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                aria-label="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

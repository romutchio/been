import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { getLeaderboard } from "@/lib/data";
import { redirect } from "next/navigation";
import { Globe, Map, Users, Heart, Trophy } from "lucide-react";
import { LeaderboardIntro } from "@/components/LeaderboardIntro";
import { LeaderboardList } from "@/components/LeaderboardList";
import { HomeAuthLinks } from "@/components/HomeAuthLinks";
import { HomeMainCta } from "@/components/HomeMainCta";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/map");

  const { entries, travelerCount } = await getLeaderboard();

  return (
    <div className="min-h-full bg-[#07090d] text-zinc-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="flex items-center gap-2 text-xl font-bold">
          <Globe className="h-6 w-6 text-emerald-400" />
          mutchio
        </span>
        <HomeAuthLinks />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 text-center sm:px-6 sm:pt-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Отмечай страны,
          <br />
          <span className="text-emerald-400">которые ты посетил</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
          Схематичная карта мира, таймлайн поездок, wishlist и карты друзей —
          всё в одном месте.
        </p>
        <HomeMainCta />

        <div className="mt-16 grid gap-6 text-left sm:mt-20 sm:grid-cols-3">
          <Feature
            icon={Map}
            title="Карта мира"
            desc="Кликай по странам — они подсвечиваются на схематичной карте мира"
          />
          <Feature
            icon={Heart}
            title="Wishlist"
            desc="Веди список стран, которые хочешь посетить"
          />
          <Feature
            icon={Users}
            title="Друзья"
            desc="Смотри, где уже побывали друзья, и сравнивай прогресс"
          />
        </div>

        <section className="mt-16 text-left sm:mt-20">
          <div className="mb-6">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold sm:justify-start">
              <Trophy className="h-7 w-7 text-amber-400" />
              Лидерборд
            </h2>
            <LeaderboardIntro
              travelerCount={travelerCount}
              className="text-center sm:text-left"
            />
          </div>
          <LeaderboardList entries={entries} />
        </section>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <Icon className="mb-3 h-8 w-8 text-emerald-400" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{desc}</p>
    </div>
  );
}

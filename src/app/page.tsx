import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Globe, Map, Users, Heart } from "lucide-react";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/map");

  return (
    <div className="min-h-full bg-[#07090d] text-zinc-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 text-xl font-bold">
          <Globe className="h-6 w-6 text-emerald-400" />
          been
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Войти
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
          >
            Начать
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Отмечай страны,
          <br />
          <span className="text-emerald-400">которые ты посетил</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Схематичная карта мира, таймлайн поездок, wishlist и карты друзей —
          как been, но своё.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-block rounded-xl bg-emerald-600 px-8 py-3 font-medium hover:bg-emerald-500"
        >
          Создать аккаунт
        </Link>

        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          <Feature
            icon={Map}
            title="Choropleth карта"
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

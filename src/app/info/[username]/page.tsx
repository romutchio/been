import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { PublicProfileMap } from "@/components/PublicProfileMap";
import { getPublicProfile } from "@/lib/data";
import { normalizeUsername } from "@/lib/auth-credentials";
import { calcStats } from "@/lib/countries";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: raw } = await params;
  const username = normalizeUsername(raw);
  const data = await getPublicProfile(username);

  if (!data) {
    return { title: "Пользователь не найден — mutchio" };
  }

  const name = data.profile.display_name ?? data.profile.username;
  const { visited } = calcStats(data.visited);

  return {
    title: `${name} — ${visited} стран — mutchio`,
    description: `Карта путешествий @${data.profile.username}: ${visited} посещённых стран`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw);

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    notFound();
  }

  const data = await getPublicProfile(username);
  if (!data) notFound();

  const displayName = data.profile.display_name ?? data.profile.username;

  return (
    <div className="min-h-full bg-[#07090d] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Globe className="h-4 w-4" />
            </span>
            mutchio
          </Link>
          <div className="flex gap-2">
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
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <PublicProfileMap
          displayName={displayName}
          username={data.profile.username}
          visited={data.visited}
        />
      </main>
    </div>
  );
}

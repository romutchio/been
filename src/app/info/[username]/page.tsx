import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/PublicHeader";
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
      <PublicHeader />

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

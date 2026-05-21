import Link from "next/link";
import type { WallPost } from "@/types/database";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  posts: WallPost[];
};

export function WallPostList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        Пока пусто. Напиши первым.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const name =
          post.profile?.display_name || post.profile?.username || "пользователь";
        const username = post.profile?.username;

        return (
          <li
            key={post.id}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {username ? (
                <Link
                  href={`/info/${username}`}
                  className="text-sm font-medium text-emerald-400 hover:underline"
                >
                  @{username}
                </Link>
              ) : (
                <span className="text-sm font-medium text-zinc-300">{name}</span>
              )}
              <time
                dateTime={post.created_at}
                className="text-xs text-zinc-600"
              >
                {formatWhen(post.created_at)}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {post.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

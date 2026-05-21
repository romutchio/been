import { NewsComposer } from "@/components/NewsComposer";
import { WallPostList } from "@/components/WallPostList";
import { getWallPosts } from "@/lib/news";
import { Newspaper } from "lucide-react";

export default async function NewsPage() {
  const posts = await getWallPosts();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Newspaper className="h-7 w-7 text-sky-400" />
          Новости
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Общая стена — все видят записи всех путешественников
        </p>
      </div>

      <NewsComposer />
      <WallPostList posts={posts} />
    </div>
  );
}

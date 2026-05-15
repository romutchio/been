import { WishlistPanel } from "@/components/WishlistPanel";
import { getProfileWithTravel } from "@/lib/data";

export default async function WishlistPage() {
  const me = await getProfileWithTravel();
  if (!me) return null;
  const { wishlist } = me;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Хочу посетить</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {wishlist.length} {wishlist.length === 1 ? "страна" : "стран"} в списке
        </p>
      </div>
      <WishlistPanel codes={wishlist} />
    </div>
  );
}

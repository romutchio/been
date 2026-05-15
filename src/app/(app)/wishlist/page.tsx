import { WishlistPanel } from "@/components/WishlistPanel";
import { getCurrentProfile, getUserTravelData } from "@/lib/data";

export default async function WishlistPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { wishlist } = await getUserTravelData(profile.id);

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

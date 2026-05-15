import { FriendsPanel } from "@/components/FriendsPanel";
import { getCurrentProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function FriendsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

  const ids = new Set<string>();
  for (const f of friendships ?? []) {
    ids.add(f.requester_id);
    ids.add(f.addressee_id);
  }
  ids.delete(profile.id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [...ids]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const enriched = (friendships ?? []).map((f) => ({
    ...f,
    requester: profileMap.get(f.requester_id)!,
    addressee: profileMap.get(f.addressee_id)!,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Друзья</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Добавляй друзей и смотри, где они уже были
        </p>
      </div>
      <FriendsPanel
        friendships={enriched}
        currentUserId={profile.id}
      />
    </div>
  );
}

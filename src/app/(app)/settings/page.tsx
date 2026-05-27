import { SettingsForm } from "@/components/SettingsForm";
import { getCurrentProfile } from "@/lib/data";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Email для восстановления пароля
        </p>
      </div>

      <SettingsForm
        username={profile.username}
        email={profile.email}
        emailVerified={!!profile.email_verified_at}
        telegramId={profile.telegram_id}
        telegramUsername={profile.telegram_username}
      />
    </div>
  );
}

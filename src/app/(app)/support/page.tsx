import { SupportForm } from "@/components/SupportForm";
import { getCurrentProfile } from "@/lib/data";
import { LifeBuoy } from "lucide-react";

export default async function SupportPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const defaultEmail = profile.email ?? "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <LifeBuoy className="h-7 w-7 text-emerald-400" />
          Поддержка
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Вопрос уйдёт на почту поддержки. Ответ придёт на указанный email.
        </p>
      </div>

      <SupportForm defaultEmail={defaultEmail} />
    </div>
  );
}

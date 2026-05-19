import Link from "next/link";
import { verifyEmailAction } from "@/app/auth/actions";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  let ok = false;
  if (token) {
    const result = await verifyEmailAction(token);
    ok = result.ok;
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07090d] px-4">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="mb-8 block text-xl font-bold text-emerald-400"
        >
          mutchio
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          {ok ? (
            <>
              <h1 className="text-2xl font-bold text-emerald-400">Email подтверждён</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Можно восстанавливать пароль по этому адресу.
              </p>
              <Link
                href="/settings"
                className="mt-6 inline-block text-sm text-emerald-400 hover:underline"
              >
                В настройки →
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-red-400">Ссылка недействительна</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Ссылка устарела или уже использована. Запроси письмо ещё раз в настройках.
              </p>
              <Link
                href="/settings"
                className="mt-6 inline-block text-sm text-emerald-400 hover:underline"
              >
                В настройки →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

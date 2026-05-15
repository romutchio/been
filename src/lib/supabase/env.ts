function assertEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing ${name} in .env.local — скопируй из Supabase → Project Settings → API`,
    );
  }
  const v = value.trim();
  if (v.includes("your-project") || v.includes("your-anon")) {
    throw new Error(
      `${name} всё ещё placeholder. Укажи реальные значения из Supabase Dashboard и перезапусти npm run dev`,
    );
  }
  return v;
}

export function getSupabaseUrl(): string {
  return assertEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}


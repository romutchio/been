import { NextResponse } from "next/server";
import { getSupabaseUrl } from "@/lib/supabase/env";

/** Dev-only: verify which Supabase URL the server sees. DELETE before production. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const url = getSupabaseUrl();
    const host = new URL(url).hostname;
    return NextResponse.json({
      ok: true,
      host,
      hint: host.includes("supabase.co")
        ? "URL looks valid — restart dev if you changed .env.local"
        : "URL does not look like Supabase",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown" },
      { status: 500 },
    );
  }
}

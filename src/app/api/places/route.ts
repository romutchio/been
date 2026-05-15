import { NextRequest, NextResponse } from "next/server";

type GeoResult = {
  id: number;
  name: string;
  country_code: string;
  admin1?: string;
  population?: number;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const country = request.nextUrl.searchParams.get("country")?.toUpperCase();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "ru");
    if (country) {
      url.searchParams.set("countryCode", country);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const json = (await res.json()) as { results?: GeoResult[] };
    const results = json.results ?? [];

    const places = results
      .filter((r) => {
        if (!country) return true;
        return r.country_code?.toUpperCase() === country;
      })
      .map((r) => ({
        name: r.name,
        country_code: r.country_code?.toUpperCase() ?? country ?? null,
        region: r.admin1 ?? null,
      }));

    const seen = new Set<string>();
    const unique = places.filter((p) => {
      const key = `${p.name}:${p.region ?? ""}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(unique);
  } catch {
    return NextResponse.json([]);
  }
}

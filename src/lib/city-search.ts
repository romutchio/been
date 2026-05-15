import citiesData from "@/data/cities.json";

type CitiesByCountry = Record<string, string[]>;

const CITIES_BY_COUNTRY = citiesData as CitiesByCountry;

export type CityResult = {
  name: string;
  country_code: string;
  region: string | null;
};

export function searchCities(
  query: string,
  countryCode: string,
  limit = 10,
): CityResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const code = countryCode.toUpperCase();
  const list = CITIES_BY_COUNTRY[code] ?? [];

  const matches = list.filter((name) => name.toLowerCase().includes(q));

  return matches.slice(0, limit).map((name) => ({
    name,
    country_code: code,
    region: null,
  }));
}

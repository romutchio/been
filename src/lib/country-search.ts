import { COUNTRIES, type Country } from "./countries";

/** Russian aliases for search */
const ALIASES: Record<string, string[]> = {
  RU: ["россия", "рф"],
  US: ["сша", "америка", "usa"],
  GB: ["англия", "великобритания", "британия"],
  DE: ["германия"],
  FR: ["франция"],
  IT: ["италия"],
  ES: ["испания"],
  PT: ["португалия"],
  GR: ["греция"],
  TR: ["турция"],
  TH: ["тайланд", "таиланд"],
  JP: ["япония"],
  CN: ["китай"],
  KR: ["корея"],
  IN: ["индия"],
  AE: ["оаэ", "эмираты"],
  GE: ["грузия"],
  AM: ["армения"],
  AZ: ["азербайджан"],
  KZ: ["казахстан"],
  UA: ["украина"],
  BY: ["беларусь", "белоруссия"],
  PL: ["польша"],
  CZ: ["чехия"],
  AT: ["австрия"],
  CH: ["швейцария"],
  NL: ["голландия", "нидерланды"],
  BE: ["бельгия"],
  SE: ["швеция"],
  NO: ["норвегия"],
  FI: ["финляндия"],
  DK: ["дания"],
  IS: ["исландия"],
  IE: ["ирландия"],
  HR: ["хорватия"],
  ME: ["черногория"],
  RS: ["сербия"],
  HU: ["венгрия"],
  EG: ["египет"],
  MA: ["марокко"],
  TN: ["тунис"],
  IL: ["израиль"],
  MX: ["мексика"],
  BR: ["бразилия"],
  AR: ["аргентина"],
  AU: ["австралия"],
  NZ: ["новая зеландия"],
  CA: ["канада"],
};

export function searchCountries(query: string, limit = 8): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return COUNTRIES.filter((c) => {
    if (c.code.toLowerCase() === q) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    const aliases = ALIASES[c.code] ?? [];
    return aliases.some((a) => a.includes(q) || q.includes(a));
  }).slice(0, limit);
}

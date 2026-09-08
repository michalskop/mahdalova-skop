import { COUNTRIES } from "./countries";

export const LATIN_AMERICA = [
  "Mexico",
  "Brazil",
  "Argentina",
  "Peru",
  "Bolivia",
  "Colombia",
  "Chile",
];
export const ROUND_POOL = [
  ...LATIN_AMERICA,
  "Canada",
  "United States of America",
  "Greenland",
  "Germany",
  "Ukraine",
  "Poland",
  "Spain",
  "France",
  "United Kingdom",
  "Norway",
  "Sweden",
  "Finland",
  "Czechia",
  "China",
  "India",
  "Japan",
  "Russia",
  "Iran",
  "Afghanistan",
  "Mongolia",
  "Kazakhstan",
  "Saudi Arabia",
  "Turkey",
  "Vietnam",
  "Philippines",
  "Indonesia",
  "Malaysia",
  "Myanmar",
  "Pakistan",
  "Iraq",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Libya",
  "Egypt",
  "Niger",
  "Chad",
  "Sudan",
  "Ethiopia",
  "Kenya",
  "Mali",
  "South Africa",
  "Angola",
  "Nigeria",
  "Somalia",
  "Dem. Rep. Congo",
  "Madagascar",
  "W. Sahara",
  "Australia",
  "New Zealand",
];

export function shuffle<T>(values: T[], random = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Quotas are satisfied together, so a diversity repair cannot break the repeat cap.
export function drawRound(
  pool: string[],
  previous: string[],
  count: 5 | 10 | 15,
  random = Math.random,
): string[] {
  const prior = new Set(previous);
  const latin = new Set(LATIN_AMERICA);
  const unique = Array.from(new Set(pool)).filter((name) => COUNTRIES[name]);
  const regions = Array.from(
    new Set(unique.map((name) => COUNTRIES[name].continent)),
  );
  const minRegions = Math.min(count === 5 ? 4 : 5, regions.length);
  const repeatLimit = Math.floor(count / 5);
  for (let attempt = 0; attempt < 500; attempt++) {
    const chosen: string[] = [];
    const candidates = shuffle(unique, random);
    const take = (predicate: (name: string) => boolean) => {
      const name = candidates.find(
        (name) =>
          !chosen.includes(name) &&
          predicate(name) &&
          (!prior.has(name) ||
            chosen.filter((n) => prior.has(n)).length < repeatLimit),
      );
      if (name) chosen.push(name);
    };
    for (let i = 0; i < (count >= 10 ? 2 : 1); i++)
      take((name) => latin.has(name));
    for (const region of shuffle(regions, random)) {
      if (
        new Set(chosen.map((name) => COUNTRIES[name].continent)).size >=
        minRegions
      )
        break;
      if (!chosen.some((name) => COUNTRIES[name].continent === region))
        take((name) => COUNTRIES[name].continent === region);
    }
    while (chosen.length < count) {
      const before = chosen.length;
      take(
        (name) =>
          chosen.filter(
            (n) => COUNTRIES[n].continent === COUNTRIES[name].continent,
          ).length < Math.ceil(count / 3),
      );
      if (before === chosen.length) break;
    }
    if (
      chosen.length === count &&
      new Set(chosen.map((name) => COUNTRIES[name].continent)).size >=
        minRegions &&
      chosen.filter((name) => latin.has(name)).length >= (count >= 10 ? 2 : 1)
    )
      return shuffle(chosen, random);
  }
  throw new Error("Country pool cannot satisfy the round rules");
}

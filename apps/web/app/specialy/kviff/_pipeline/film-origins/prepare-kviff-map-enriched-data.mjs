import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(HERE, 'data');
const ROOT = path.resolve(HERE, '../..');
const mapCsvPath = path.join(DATA_DIR, 'kviff-film-origins-country-presence-1992-2026.csv');
const rawFilmsPath = path.join(ROOT, '_pipeline/film_archive_raw.json');

const outMapTsv = path.join(DATA_DIR, 'kviff-film-origins-map-enriched-1992-2026.tsv');
const outDetailsJson = path.join(DATA_DIR, 'kviff-film-origin-country-details-1992-2025.json');
const outReadme = path.join(HERE, 'kviff-film-origins-map-enriched-README.md');

fs.mkdirSync(DATA_DIR, { recursive: true });

const continentByCountry = {
  Afghanistan: 'Asie',
  Albania: 'Evropa',
  Algeria: 'Afrika',
  Angola: 'Afrika',
  Argentina: 'Latinska Amerika',
  Armenia: 'Asie',
  Australia: 'Oceanie',
  Austria: 'Evropa',
  Azerbaijan: 'Asie',
  Bangladesh: 'Asie',
  Belarus: 'Evropa',
  Belgium: 'Evropa',
  Bhutan: 'Asie',
  Bolivia: 'Latinska Amerika',
  'Bosnia and Herzegovina': 'Evropa',
  Brazil: 'Latinska Amerika',
  Bulgaria: 'Evropa',
  'Burkina Faso': 'Afrika',
  Burma: 'Asie',
  Cambodia: 'Asie',
  Canada: 'Severni Amerika',
  Chad: 'Afrika',
  Chile: 'Latinska Amerika',
  China: 'Asie',
  Colombia: 'Latinska Amerika',
  'Costa Rica': 'Latinska Amerika',
  Croatia: 'Evropa',
  Cuba: 'Latinska Amerika',
  Cyprus: 'Evropa',
  'Czech Republic': 'Evropa',
  Czechoslovakia: 'Evropa',
  'Democratic Republic of the Congo': 'Afrika',
  Denmark: 'Evropa',
  'Dominican Republic': 'Latinska Amerika',
  Egypt: 'Blizky vychod',
  Estonia: 'Evropa',
  Ethiopia: 'Afrika',
  Finland: 'Evropa',
  France: 'Evropa',
  Georgia: 'Asie',
  Germany: 'Evropa',
  Ghana: 'Afrika',
  Greece: 'Evropa',
  Guatemala: 'Latinska Amerika',
  Guinea: 'Afrika',
  'Guinea-Bissau': 'Afrika',
  'Hong Kong': 'Asie',
  Hungary: 'Evropa',
  Iceland: 'Evropa',
  India: 'Asie',
  Indonesia: 'Asie',
  Iran: 'Blizky vychod',
  Iraq: 'Blizky vychod',
  'Iraqi Kurdistan': 'Blizky vychod',
  Ireland: 'Evropa',
  Israel: 'Blizky vychod',
  Italy: 'Evropa',
  'Ivory Coast': 'Afrika',
  Jamaica: 'Latinska Amerika',
  Japan: 'Asie',
  Jordan: 'Blizky vychod',
  Kazakhstan: 'Asie',
  Kenya: 'Afrika',
  Kosovo: 'Evropa',
  Kurdistan: 'Blizky vychod',
  Kyrgyzstan: 'Asie',
  Latvia: 'Evropa',
  Lebanon: 'Blizky vychod',
  Liechtenstein: 'Evropa',
  Lithuania: 'Evropa',
  Luxembourg: 'Evropa',
  Malawi: 'Afrika',
  Malaysia: 'Asie',
  Malta: 'Evropa',
  Mauritania: 'Afrika',
  Mexico: 'Latinska Amerika',
  Moldova: 'Evropa',
  Monaco: 'Evropa',
  Mongolia: 'Asie',
  Montenegro: 'Evropa',
  Morocco: 'Afrika',
  Myanmar: 'Asie',
  Namibia: 'Afrika',
  Nepal: 'Asie',
  Netherlands: 'Evropa',
  'New Zealand': 'Oceanie',
  Nigeria: 'Afrika',
  'North Korea': 'Asie',
  'North Macedonia': 'Evropa',
  Norway: 'Evropa',
  Pakistan: 'Asie',
  Palestine: 'Blizky vychod',
  Paraguay: 'Latinska Amerika',
  Peru: 'Latinska Amerika',
  Philippines: 'Asie',
  Poland: 'Evropa',
  Portugal: 'Evropa',
  Qatar: 'Blizky vychod',
  Romania: 'Evropa',
  Russia: 'Evropa',
  Rwanda: 'Afrika',
  'Saudi Arabia': 'Blizky vychod',
  Senegal: 'Afrika',
  Serbia: 'Evropa',
  'Sierra Leone': 'Afrika',
  Singapore: 'Asie',
  'Slovak Republic': 'Evropa',
  Slovakia: 'Evropa',
  Slovenia: 'Evropa',
  Somalia: 'Afrika',
  'South Africa': 'Afrika',
  'South Korea': 'Asie',
  Spain: 'Evropa',
  'Sri Lanka': 'Asie',
  Sudan: 'Afrika',
  Sweden: 'Evropa',
  Switzerland: 'Evropa',
  Syria: 'Blizky vychod',
  Taiwan: 'Asie',
  Tajikistan: 'Asie',
  Tanzania: 'Afrika',
  Thailand: 'Asie',
  Tunisia: 'Afrika',
  Turkey: 'Blizky vychod',
  Turkmenistan: 'Asie',
  Uganda: 'Afrika',
  Ukraine: 'Evropa',
  'United Arab Emirates': 'Blizky vychod',
  'United Kingdom': 'Evropa',
  Uruguay: 'Latinska Amerika',
  USA: 'Severni Amerika',
  USSR: 'Evropa',
  Uzbekistan: 'Asie',
  Venezuela: 'Latinska Amerika',
  Vietnam: 'Asie',
  Yemen: 'Blizky vychod',
  Yugoslavia: 'Evropa',
  Zambia: 'Afrika',
  Zimbabwe: 'Afrika',
};

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && quoted && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function readCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function cleanCountry(country) {
  let c = String(country || '').trim();
  if (c.includes('/')) c = c.split('/').at(-1).trim();
  if (!c || c === 'various countries' || c === 'various directors') return null;
  if (c === 'Barma') return 'Burma';
  return c;
}

function uniqueFilmKey(year, film) {
  return `${year}::${film.title || '(bez nazvu)'}::${film.prodYear || ''}::${(film.countries || []).join('|')}`;
}

function sampleFilms(films, country) {
  return films
    .filter((item) => item.title)
    .sort((a, b) => b.year - a.year || b.countries.length - a.countries.length)
    .slice(0, 8)
    .map((item) => ({
      year: item.year,
      title: item.title,
      productionYear: item.prodYear ?? null,
      countries: item.countries,
      coproduction: item.countries.length > 1,
      czechCoproduction: item.countries.includes('Czech Republic') && country !== 'Czech Republic',
    }));
}

const mapRows = readCsv(mapCsvPath)
  .map((row) => ({
    date: row.Date,
    country: row.Country,
    lat: row.Latitude,
    lon: row.Longitude,
    appearances: Number(row['Production country appearances']),
    metric: row.Metric,
    year: Number(row.Year),
  }))
  .sort((a, b) => a.year - b.year || a.country.localeCompare(b.country, 'en'));

const cumulative = new Map();
const enrichedRows = mapRows.map((row) => {
  const next = (cumulative.get(row.country) ?? 0) + row.appearances;
  cumulative.set(row.country, next);
  return {
    Datum: row.date,
    Zeme: row.country,
    Latitude: row.lat,
    Longitude: row.lon,
    'Production country appearances': row.appearances,
    Kumulativne: next,
    Kontinent: continentByCountry[row.country] ?? 'Ostatni',
    DetailKey: row.country,
    Metric: row.metric,
  };
});

const tsvColumns = [
  'Datum',
  'Zeme',
  'Latitude',
  'Longitude',
  'Production country appearances',
  'Kumulativne',
  'Kontinent',
  'DetailKey',
  'Metric',
];

fs.writeFileSync(
  outMapTsv,
  [
    tsvColumns.join('\t'),
    ...enrichedRows.map((row) => tsvColumns.map((column) => String(row[column] ?? '').replace(/\t/g, ' ')).join('\t')),
  ].join('\n'),
  'utf8',
);

const raw = JSON.parse(fs.readFileSync(rawFilmsPath, 'utf8'));
const details = {};

for (const [yearText, films] of Object.entries(raw)) {
  const year = Number(yearText);
  if (year === 2026) continue;
  for (const film of films) {
    const countries = [...new Set((film.countries || []).map(cleanCountry).filter(Boolean))];
    if (!countries.length) continue;
    for (const country of countries) {
      details[country] ??= {
        country,
        continent: continentByCountry[country] ?? 'Ostatni',
        years: {},
        totalFilms: 0,
        totalAppearances: 0,
        coproductionFilms: 0,
        czechCoproductionFilms: 0,
        coProductionCountries: {},
        examples: [],
        dataLimitations: [
          'Detail vychazi z film_archive_raw.json pro roky 1992-2025.',
          'Zdroj zatim neobsahuje systematicky rezisery, herecke obsazeni ani vsechny ceny.',
          'Rok 2026 je ve film-level raw datech jen castecny, proto neni zahrnuty do detailu panelu.',
        ],
      };
      const detail = details[country];
      const key = uniqueFilmKey(year, { ...film, countries });
      if (detail._seen?.has(key)) continue;
      detail._seen ??= new Set();
      detail._seen.add(key);
      detail.totalFilms += 1;
      detail.totalAppearances += 1;
      detail.years[year] = (detail.years[year] ?? 0) + 1;
      if (countries.length > 1) {
        detail.coproductionFilms += 1;
        for (const partner of countries) {
          if (partner === country) continue;
          detail.coProductionCountries[partner] = (detail.coProductionCountries[partner] ?? 0) + 1;
        }
      }
      if (country !== 'Czech Republic' && countries.includes('Czech Republic')) {
        detail.czechCoproductionFilms += 1;
      }
      detail.examples.push({ year, title: film.title || '', prodYear: film.prodYear, countries });
    }
  }
}

for (const detail of Object.values(details)) {
  delete detail._seen;
  detail.coproductionShare = detail.totalFilms ? Math.round((detail.coproductionFilms / detail.totalFilms) * 1000) / 10 : 0;
  detail.czechCoproductionShare = detail.totalFilms ? Math.round((detail.czechCoproductionFilms / detail.totalFilms) * 1000) / 10 : 0;
  detail.topCoproductionCountries = Object.entries(detail.coProductionCountries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([country, count]) => ({ country, count }));
  detail.notableExamples = sampleFilms(detail.examples, detail.country);
  const yearEntries = Object.entries(detail.years).map(([year, count]) => ({ year: Number(year), count }));
  const firstYear = yearEntries.length ? Math.min(...yearEntries.map((row) => row.year)) : null;
  const lastYear = yearEntries.length ? Math.max(...yearEntries.map((row) => row.year)) : null;
  const peak = yearEntries
    .sort((a, b) => b.count - a.count || b.year - a.year)[0] ?? null;
  detail.firstYear = firstYear;
  detail.lastYear = lastYear;
  detail.yearRange = firstYear && lastYear ? `${firstYear}-${lastYear}` : null;
  detail.peakYear = peak ? peak.year : null;
  detail.peakYearAppearances = peak ? peak.count : null;
  detail.awards = [];
  detail.awardsNote = 'Pripraveno pro doplneni cen. Aktualni country raw zdroj neobsahuje systematicke oceneni jednotlivych filmu.';
  detail.directors = [];
  detail.directorsNote = 'Pripraveno pro doplneni reziseru. Aktualni agregacni raw zdroj je ve vygenerovane podobe systematicky neuklada.';
  detail.panelSections = [
    'souhrn',
    'casova stopa',
    'koprodukcni sit',
    'ceska koprodukcni linka',
    'ukazkove filmy',
    'ceny',
    'reziseri',
  ];
  delete detail.examples;
}

function formatPartners(detail) {
  return detail?.topCoproductionCountries?.length
    ? detail.topCoproductionCountries.slice(0, 8).map((row) => `${row.country} (${row.count})`).join('; ')
    : '';
}

function formatExamples(detail) {
  return detail?.notableExamples?.length
    ? detail.notableExamples.slice(0, 5).map((row) => `${row.year}: ${row.title}`).join('; ')
    : '';
}

function formatAwards(detail) {
  return detail?.awards?.length
    ? detail.awards.map((row) => `${row.year}: ${row.title} - ${row.award}`).join('; ')
    : detail?.awardsNote ?? '';
}

function formatDirectors(detail) {
  return detail?.directors?.length
    ? detail.directors.map((row) => `${row.name} (${row.count})`).join('; ')
    : detail?.directorsNote ?? '';
}

const richTsvColumns = [
  'Datum',
  'Zeme',
  'Latitude',
  'Longitude',
  'Production country appearances',
  'Kumulativne',
  'Kontinent',
  'Filmy celkem',
  'Koprodukcni filmy',
  'Podil koprodukci',
  'Koprodukce s Ceskem',
  'Prvni vyskyt',
  'Posledni vyskyt',
  'Nejvyraznejsi rok',
  'Top koprodukcni partneri',
  'Ukazkove filmy',
  'Ceny',
  'Reziseri',
  'DetailKey',
  'Metric',
];

const richRows = enrichedRows.map((row) => {
  const detail = details[row.Zeme];
  return {
    ...row,
    'Filmy celkem': detail?.totalFilms ?? '',
    'Koprodukcni filmy': detail?.coproductionFilms ?? '',
    'Podil koprodukci': detail ? `${detail.coproductionShare} %` : '',
    'Koprodukce s Ceskem': detail?.czechCoproductionFilms ?? '',
    'Prvni vyskyt': detail?.firstYear ?? '',
    'Posledni vyskyt': detail?.lastYear ?? '',
    'Nejvyraznejsi rok': detail?.peakYear ? `${detail.peakYear} (${detail.peakYearAppearances})` : '',
    'Top koprodukcni partneri': formatPartners(detail),
    'Ukazkove filmy': formatExamples(detail),
    Ceny: formatAwards(detail),
    Reziseri: formatDirectors(detail),
  };
});

fs.writeFileSync(
  outMapTsv,
  [
    richTsvColumns.join('\t'),
    ...richRows.map((row) => richTsvColumns.map((column) => String(row[column] ?? '').replace(/\t/g, ' ')).join('\t')),
  ].join('\n'),
  'utf8',
);

fs.writeFileSync(outDetailsJson, JSON.stringify(details, null, 2), 'utf8');
fs.writeFileSync(outReadme, `# KVIFF Map Enriched Data

## Files

- \`kviff-film-origins-map-enriched-1992-2026.tsv\`: map animation table with cumulative values and continent labels.
- \`kviff-film-origin-country-details-1992-2025.json\`: detail panel data keyed by country.

## Important

- \`Kumulativne\` is cumulative production-country appearances by country over time.
- \`Kontinent\` is intended for map legend/color grouping.
- The TSV also includes popup-ready summary fields: total films, coproductions, Czech coproductions, first/last year, peak year, top coproduction partners, example films, awards and directors.
- The detail JSON is complete for film-level source years 1992-2025.
- Year 2026 remains map-level only here, because the current full 2026 catalogue exists as country aggregates, while the raw film-level scrape contains only a partial sample.
- Awards and directors are kept as explicit fields at the bottom of the panel. They are currently placeholders with methodological notes until a dedicated enrichment step adds reliable film-level awards and director metadata.
`, 'utf8');

console.log(`Wrote ${outMapTsv}`);
console.log(`Wrote ${outDetailsJson}`);
console.log(`Wrote ${outReadme}`);
console.log(`Rows: ${enrichedRows.length}`);

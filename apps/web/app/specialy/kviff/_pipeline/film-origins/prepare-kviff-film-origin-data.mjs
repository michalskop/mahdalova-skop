import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const DATA_DIR = path.join(HERE, 'data');
const historyPath = path.join(ROOT, '_pipeline/countries_history.json');
const countriesTsPath = path.join(ROOT, 'countries.ts');

const outCsv = path.join(DATA_DIR, 'kviff-film-origins-country-presence-1992-2026.csv');
const outCsvMinimal = path.join(DATA_DIR, 'kviff-film-origins-country-presence-1992-2026-minimal.csv');
const outReadme = path.join(HERE, 'kviff-film-origins-country-presence-README.md');

fs.mkdirSync(DATA_DIR, { recursive: true });

const cleanCountry = (country) => {
  let c = String(country || '').trim();
  if (c.includes('/')) c = c.split('/').at(-1).trim();
  if (!c || c === 'various countries' || c === 'various directors') return null;
  if (c === 'Barma') return 'Burma';
  return c;
};

const coords = {
  Afghanistan: [33.9, 67.7],
  Albania: [41.2, 20.2],
  Algeria: [28.0, 1.7],
  Angola: [-11.2, 17.9],
  Argentina: [-38.4, -63.6],
  Armenia: [40.1, 45.0],
  Australia: [-25.3, 133.8],
  Austria: [47.5, 14.5],
  Azerbaijan: [40.1, 47.6],
  Bangladesh: [23.7, 90.4],
  Belarus: [53.7, 27.9],
  Belgium: [50.5, 4.5],
  Bhutan: [27.5, 90.4],
  Bolivia: [-16.3, -63.6],
  'Bosnia and Herzegovina': [43.9, 17.7],
  Brazil: [-14.2, -51.9],
  Bulgaria: [42.7, 25.5],
  'Burkina Faso': [12.2, -1.6],
  Burma: [21.9, 95.9],
  Cambodia: [12.6, 104.9],
  Canada: [56.1, -106.3],
  Chad: [15.5, 18.7],
  Chile: [-35.7, -71.5],
  China: [35.9, 104.2],
  Colombia: [4.6, -74.3],
  'Costa Rica': [9.7, -84.2],
  Croatia: [45.1, 15.2],
  Cuba: [21.5, -79.4],
  Cyprus: [35.1, 33.4],
  'Czech Republic': [49.8, 15.5],
  Czechoslovakia: [49.8, 15.0],
  'Democratic Republic of the Congo': [-4.0, 21.8],
  Denmark: [56.3, 9.5],
  'Dominican Republic': [18.7, -70.2],
  Egypt: [26.8, 30.8],
  Estonia: [58.6, 25.0],
  Ethiopia: [9.1, 40.5],
  Finland: [61.9, 25.7],
  France: [46.2, 2.2],
  Georgia: [42.3, 43.4],
  Germany: [51.2, 10.4],
  Ghana: [7.9, -1.0],
  Greece: [39.1, 21.8],
  Guatemala: [15.8, -90.2],
  Guinea: [9.9, -9.7],
  'Guinea-Bissau': [11.8, -15.2],
  'Hong Kong': [22.3, 114.2],
  Hungary: [47.2, 19.5],
  Iceland: [64.9, -18.6],
  India: [20.6, 78.9],
  Indonesia: [-0.8, 113.9],
  Iran: [32.4, 53.7],
  Iraq: [33.2, 43.7],
  'Iraqi Kurdistan': [36.2, 44.0],
  Ireland: [53.4, -8.2],
  Israel: [31.0, 35.0],
  Italy: [41.9, 12.6],
  'Ivory Coast': [7.5, -5.6],
  Jamaica: [18.1, -77.3],
  Japan: [36.2, 138.3],
  Jordan: [30.6, 36.2],
  Kazakhstan: [48.0, 66.9],
  Kenya: [0.0, 37.9],
  Kosovo: [42.6, 20.9],
  Kurdistan: [36.2, 44.0],
  Kyrgyzstan: [41.2, 74.8],
  Latvia: [56.9, 24.6],
  Lebanon: [33.9, 35.9],
  Liechtenstein: [47.2, 9.6],
  Lithuania: [55.2, 23.9],
  Luxembourg: [49.8, 6.1],
  Malawi: [-13.3, 34.3],
  Malaysia: [4.2, 101.9],
  Malta: [35.9, 14.4],
  Mauritania: [21.0, -10.9],
  Mexico: [23.6, -102.5],
  Moldova: [47.4, 28.4],
  Monaco: [43.7, 7.4],
  Mongolia: [46.9, 103.8],
  Montenegro: [42.7, 19.3],
  Morocco: [31.8, -7.1],
  Myanmar: [21.9, 95.9],
  Namibia: [-22.9, 18.5],
  Nepal: [28.4, 84.1],
  Netherlands: [52.1, 5.3],
  'New Zealand': [-40.9, 174.9],
  Nigeria: [9.1, 8.7],
  'North Korea': [40.3, 127.5],
  'North Macedonia': [41.6, 21.7],
  Norway: [60.5, 8.5],
  Pakistan: [30.4, 69.3],
  Palestine: [31.9, 35.2],
  Paraguay: [-23.4, -58.4],
  Peru: [-9.2, -75.0],
  Philippines: [12.9, 122.0],
  Poland: [52.0, 19.1],
  Portugal: [39.4, -8.2],
  Qatar: [25.4, 51.2],
  Romania: [45.9, 24.9],
  Russia: [61.5, 105.3],
  Rwanda: [-1.9, 29.9],
  'Saudi Arabia': [23.9, 45.1],
  Senegal: [14.5, -14.5],
  Serbia: [44.0, 20.9],
  'Sierra Leone': [8.5, -11.8],
  Singapore: [1.35, 103.8],
  'Slovak Republic': [48.7, 19.7],
  Slovakia: [48.7, 19.7],
  Slovenia: [46.2, 14.9],
  Somalia: [5.2, 46.2],
  'South Africa': [-30.6, 22.9],
  'South Korea': [36.5, 127.8],
  Spain: [40.5, -3.7],
  'Sri Lanka': [7.9, 80.8],
  Sudan: [12.9, 30.2],
  Sweden: [60.1, 18.6],
  Switzerland: [46.8, 8.2],
  Syria: [34.8, 38.9],
  Taiwan: [23.7, 121.0],
  Tajikistan: [38.9, 71.0],
  Tanzania: [-6.4, 34.9],
  Thailand: [15.9, 101.0],
  Tunisia: [33.9, 9.5],
  Turkey: [39.0, 35.2],
  Turkmenistan: [38.9, 59.6],
  Uganda: [1.4, 32.3],
  Ukraine: [48.4, 31.2],
  'United Arab Emirates': [23.4, 53.8],
  'United Kingdom': [55.4, -3.4],
  Uruguay: [-32.5, -55.8],
  USA: [39.8, -98.6],
  USSR: [61.5, 105.3],
  Uzbekistan: [41.4, 64.6],
  Venezuela: [6.4, -66.6],
  Vietnam: [14.1, 108.3],
  Yemen: [15.6, 48.5],
  Yugoslavia: [44.0, 20.9],
  Zambia: [-13.1, 27.8],
  Zimbabwe: [-19.0, 29.2],
};

const readCurrent2026 = () => {
  const source = fs.readFileSync(countriesTsPath, 'utf8');
  const rowPattern = /\{\s*country:\s*'([^']+)'\s*,\s*count:\s*(\d+)\s*,\s*region:\s*'([^']+)'\s*,\s*lat:\s*(-?\d+(?:\.\d+)?)\s*,\s*lon:\s*(-?\d+(?:\.\d+)?)\s*\}/g;
  return [...source.matchAll(rowPattern)].map((match) => ({
    country: match[1],
    count: Number(match[2]),
    lat: Number(match[4]),
    lon: Number(match[5]),
  }));
};

const rows = [];
const missing = new Set();
const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

for (const yearRow of history) {
  if (yearRow.year === 2026) continue;
  for (const [rawCountry, count] of Object.entries(yearRow.countries)) {
    const country = cleanCountry(rawCountry);
    if (!country) continue;
    const coord = coords[country];
    if (!coord) {
      missing.add(country);
      continue;
    }
    rows.push({
      Date: `01/07/${yearRow.year}`,
      Country: country,
      Latitude: coord[0],
      Longitude: coord[1],
      'Production country appearances': count,
      Metric: 'Production country appearances in KVIFF catalogue',
      Year: yearRow.year,
      Source: 'KVIFF film archive scrape',
      Note: 'presence count; one coproduction counts once for each listed country',
    });
  }
}

for (const row of readCurrent2026()) {
  rows.push({
    Date: '01/07/2026',
    Country: row.country,
    Latitude: row.lat,
    Longitude: row.lon,
    'Production country appearances': row.count,
    Metric: 'Production country appearances in KVIFF catalogue',
    Year: 2026,
    Source: 'KVIFF 2026 current catalogue dataset',
    Note: '2026 uses the current catalogue dataset, not the incomplete historical scrape',
  });
}

if (missing.size) {
  throw new Error(`Missing coordinates: ${[...missing].sort().join(', ')}`);
}

const csvEscape = (value) => {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

const columns = [
  'Date',
  'Country',
  'Latitude',
  'Longitude',
  'Production country appearances',
  'Metric',
  'Year',
  'Source',
  'Note',
];

const csv = [
  columns.join(','),
  ...rows
    .sort((a, b) => a.Year - b.Year || a.Country.localeCompare(b.Country, 'en'))
    .map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
].join('\n');

fs.writeFileSync(outCsv, csv, 'utf8');

const minimalColumns = [
  'Date',
  'Country',
  'Latitude',
  'Longitude',
  'Production country appearances',
  'Metric',
];
const minimalCsv = [
  minimalColumns.join(','),
  ...rows
    .sort((a, b) => a.Year - b.Year || a.Country.localeCompare(b.Country, 'en'))
    .map((row) => minimalColumns.map((column) => csvEscape(row[column])).join(',')),
].join('\n');

fs.writeFileSync(outCsvMinimal, minimalCsv, 'utf8');

const totals = rows.reduce((acc, row) => {
  acc.years.add(row.Year);
  acc.occurrences += Number(row['Production country appearances']);
  acc.countries.add(row.Country);
  return acc;
}, { years: new Set(), countries: new Set(), occurrences: 0 });

fs.writeFileSync(outReadme, `# KVIFF Film Origins Country Presence

This dataset mirrors the structure of the sample COVID country time-series:

\`Date, Country, Latitude, Longitude, Production country appearances, Metric\`

It is yearly festival data, not daily data. \`Date\` is set to \`01/07/YYYY\` as a stable festival-year timestamp for map animation tools.

## Method

- Metric: production country appearances in the KVIFF catalogue.
- Counting method: presence count. If a film lists three production countries, each country receives one appearance.
- Years 1992-2025: generated from \`apps/web/app/specialy/kviff/_pipeline/countries_history.json\`.
- Year 2026: generated from \`apps/web/app/specialy/kviff/countries.ts\`, because the historical scrape currently has only a 9-film partial sample for 2026.
- Missing years in the source series: 1993 and 2020.

## Output

- Main CSV: \`kviff-film-origins-country-presence-1992-2026.csv\`
- Minimal CSV: \`kviff-film-origins-country-presence-1992-2026-minimal.csv\`
- Rows: ${rows.length}
- Festival years: ${totals.years.size}
- Distinct countries/entities: ${totals.countries.size}
- Total production-country appearances: ${totals.occurrences}

## Editorial note

Do not describe this as nationality of films. It measures visibility/presence of listed production countries in the festival catalogue. For a fairer weighting of coproductions, add a separate fractional-count dataset later.
`, 'utf8');

console.log(`Wrote ${outCsv}`);
console.log(`Wrote ${outCsvMinimal}`);
console.log(`Wrote ${outReadme}`);
console.log(`Rows: ${rows.length}`);

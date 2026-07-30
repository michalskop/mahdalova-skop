import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../../../../..');
const KVIFF_ROOT = path.resolve(HERE, '../..');
const tsvPath = path.join(HERE, 'data', 'kviff-film-origins-map-enriched-1992-2026.tsv');
const filmsPath = path.join(KVIFF_ROOT, 'films.ts');
const outPath = path.join(ROOT, 'docs', 'specialy', 'kviff', 'prototypes', 'kviff-film-origins-dashboard.html');
const inlinePath = path.join(ROOT, 'docs', 'specialy', 'kviff', 'prototypes', 'kviff-film-origins-dashboard-inline.html');

const YEAR_MIN = 1992;
const YEAR_MAX = 2026;
const MISSED_YEARS = [1993, 2020];

const continentLabels = new Map([
  ['Afrika', 'Afrika'],
  ['Asie', 'Asie'],
  ['Blizky vychod', 'Blízký východ'],
  ['Evropa', 'Evropa'],
  ['Latinska Amerika', 'Latinská Amerika'],
  ['Ostatni', 'Ostatní'],
  ['Oceanie', 'Oceánie'],
  ['Severni Amerika', 'Severní Amerika'],
]);

const countryNamesCs = new Map(Object.entries({
  Afghanistan: 'Afghánistán',
  Albania: 'Albánie',
  Algeria: 'Alžírsko',
  Argentina: 'Argentina',
  Australia: 'Austrálie',
  Austria: 'Rakousko',
  Belgium: 'Belgie',
  Brazil: 'Brazílie',
  Bulgaria: 'Bulharsko',
  Canada: 'Kanada',
  Chile: 'Chile',
  China: 'Čína',
  Colombia: 'Kolumbie',
  Croatia: 'Chorvatsko',
  Cuba: 'Kuba',
  'Czech Republic': 'Česko',
  Czechoslovakia: 'Československo',
  Denmark: 'Dánsko',
  Egypt: 'Egypt',
  Estonia: 'Estonsko',
  Finland: 'Finsko',
  France: 'Francie',
  Germany: 'Německo',
  Greece: 'Řecko',
  Hungary: 'Maďarsko',
  Iceland: 'Island',
  India: 'Indie',
  Iran: 'Írán',
  Ireland: 'Irsko',
  Israel: 'Izrael',
  Italy: 'Itálie',
  Japan: 'Japonsko',
  Mexico: 'Mexiko',
  Morocco: 'Maroko',
  Netherlands: 'Nizozemsko',
  'New Zealand': 'Nový Zéland',
  Norway: 'Norsko',
  Palestine: 'Palestina',
  Poland: 'Polsko',
  Portugal: 'Portugalsko',
  Romania: 'Rumunsko',
  Russia: 'Rusko',
  Serbia: 'Srbsko',
  Slovakia: 'Slovensko',
  Slovenia: 'Slovinsko',
  'South Korea': 'Jižní Korea',
  Spain: 'Španělsko',
  Sweden: 'Švédsko',
  Switzerland: 'Švýcarsko',
  Taiwan: 'Tchaj-wan',
  Turkey: 'Turecko',
  Ukraine: 'Ukrajina',
  'United Kingdom': 'Spojené království',
  USA: 'USA',
  Uruguay: 'Uruguay',
  Vietnam: 'Vietnam',
  Yugoslavia: 'Jugoslávie',
}));

function parseTsv(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const headers = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const cols = line.split('\t');
    return Object.fromEntries(headers.map((header, index) => [header, cols[index] ?? '']));
  });
}

function readFilmTotals(file) {
  const source = fs.readFileSync(file, 'utf8');
  const totals = {};
  for (const match of source.matchAll(/\{[^{}]*year:\s*(\d{4})[^{}]*\}/g)) {
    const total = match[0].match(/totalFilms:\s*(\d+)/);
    if (total) totals[match[1]] = Number(total[1]);
  }
  return totals;
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePercent(value) {
  const parsed = Number(String(value).replace('%', '').replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function yearFromDate(date) {
  const match = String(date).match(/(\d{4})$/);
  return match ? Number(match[1]) : null;
}

const rows = parseTsv(tsvPath);
const filmTotals = readFilmTotals(filmsPath);
const byCountry = new Map();
const yearTotals = {};

for (let year = YEAR_MIN; year <= YEAR_MAX; year += 1) yearTotals[year] = 0;

for (const row of rows) {
  const country = cleanText(row.Zeme);
  const year = yearFromDate(row.Datum);
  const appearances = Number(row['Production country appearances'] || 0);
  if (!country || !year || !appearances) continue;

  if (!byCountry.has(country)) {
    byCountry.set(country, {
      key: country,
      name: countryNamesCs.get(country) ?? country,
      originalName: country,
      lat: Number(row.Latitude),
      lon: Number(row.Longitude),
      continent: country === 'Gabon' ? 'Afrika' : (continentLabels.get(row.Kontinent) ?? row.Kontinent),
      continentKey: row.Kontinent,
      years: {},
      cumulative: {},
      total: Number(row['Filmy celkem'] || 0),
      coproductionFilms: Number(row['Koprodukcni filmy'] || 0),
      coproductionShare: parsePercent(row['Podil koprodukci']),
      czechCoproductions: Number(row['Koprodukce s Ceskem'] || 0),
      firstYear: Number(row['Prvni vyskyt'] || year),
      lastYear: Number(row['Posledni vyskyt'] || year),
      peak: cleanText(row['Nejvyraznejsi rok']),
      partners: cleanText(row['Top koprodukcni partneri']),
      examples: cleanText(row['Ukazkove filmy']),
    });
  }
  byCountry.get(country).years[year] = (byCountry.get(country).years[year] || 0) + appearances;
  yearTotals[year] += appearances;
}

const countries = [...byCountry.values()].map((country) => {
  let cumulative = 0;
  for (let year = YEAR_MIN; year <= YEAR_MAX; year += 1) {
    cumulative += country.years[year] || 0;
    country.cumulative[year] = cumulative;
  }
  country.total = cumulative;
  return country;
}).sort((a, b) => b.total - a.total);

const continents = [...new Set(countries.map((country) => country.continent))].sort((a, b) => {
  const order = ['Evropa', 'Severní Amerika', 'Latinská Amerika', 'Asie', 'Blízký východ', 'Afrika', 'Oceánie'];
  return order.indexOf(a) - order.indexOf(b);
});

const payload = {
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  missedYears: MISSED_YEARS,
  filmTotals,
  yearTotals,
  continents,
  countries,
};

const css = String.raw`
  :root {
    color-scheme: light;
    --dt-bg: #f8f7f2;
    --dt-text: #171717;
    --dt-muted: #65615a;
    --dt-line: #d9d2c3;
    --dt-soft: #ece6d8;
    --dt-card: #fffdf8;
    --dt-red: #d6402f;
    --dt-blue: #245c8f;
    --dt-green: #3e7b4f;
    --dt-gold: #b08000;
    --dt-purple: #8060a8;
    --dt-teal: #24827a;
    --dt-brown: #9a6846;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--dt-bg);
    color: var(--dt-text);
    font-family: Arial, Helvetica, sans-serif;
  }
  .kviff-origin-dashboard {
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 18px 34px;
  }
  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, .55fr);
    gap: 20px;
    align-items: end;
    border-bottom: 1px solid var(--dt-line);
    padding-bottom: 18px;
  }
  .eyebrow {
    margin: 0 0 8px;
    color: var(--dt-red);
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    font-size: 12px;
  }
  h1 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(34px, 5vw, 68px);
    line-height: .98;
    letter-spacing: 0;
  }
  .dek {
    margin: 12px 0 0;
    max-width: 840px;
    color: var(--dt-muted);
    font-size: 17px;
    line-height: 1.45;
  }
  .mode-card {
    background: var(--dt-card);
    border: 1px solid var(--dt-line);
    border-radius: 8px;
    padding: 14px;
  }
  .mode-card h2, .side h2, .summary h2 {
    margin: 0 0 10px;
    font-size: 16px;
    line-height: 1.25;
  }
  .segmented, .timeline-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  button {
    border: 1px solid var(--dt-line);
    border-radius: 999px;
    background: var(--dt-card);
    color: var(--dt-text);
    cursor: pointer;
    font: inherit;
    min-height: 34px;
    padding: 7px 12px;
  }
  button[aria-pressed="true"], button.is-active {
    background: var(--dt-text);
    border-color: var(--dt-text);
    color: var(--dt-bg);
  }
  button:disabled { cursor: default; opacity: .35; }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin: 18px 0;
  }
  .stat {
    background: var(--dt-card);
    border: 1px solid var(--dt-line);
    border-radius: 8px;
    padding: 12px;
    min-height: 86px;
  }
  .stat strong {
    display: block;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 32px;
    line-height: 1;
  }
  .stat span {
    display: block;
    margin-top: 6px;
    color: var(--dt-muted);
    font-size: 13px;
    line-height: 1.25;
  }
  .main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 18px;
    align-items: start;
  }
  .map-wrap {
    min-width: 0;
  }
  .map-head {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .map-title {
    margin: 0;
    font-size: 15px;
    color: var(--dt-muted);
  }
  .map-title strong {
    color: var(--dt-text);
  }
  svg#origin-map {
    width: 100%;
    height: auto;
    display: block;
    background: linear-gradient(180deg, rgba(36,92,143,.08), rgba(36,92,143,.02));
    border: 1px solid var(--dt-line);
    border-radius: 8px;
  }
  .graticule {
    stroke: rgba(23,23,23,.13);
    stroke-width: 1;
    fill: none;
  }
  .continent-label {
    fill: rgba(23,23,23,.36);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .bubble {
    stroke: rgba(23,23,23,.38);
    stroke-width: 1;
    transition: r .25s ease, opacity .25s ease, stroke-width .25s ease;
    cursor: pointer;
  }
  .bubble.is-muted { opacity: .23; }
  .bubble.is-selected {
    stroke: var(--dt-text);
    stroke-width: 3;
    opacity: 1;
  }
  .bubble-label {
    pointer-events: none;
    font-size: 11px;
    font-weight: 700;
    paint-order: stroke;
    stroke: var(--dt-bg);
    stroke-width: 3px;
    fill: var(--dt-text);
  }
  .timeline {
    margin-top: 12px;
    background: var(--dt-card);
    border: 1px solid var(--dt-line);
    border-radius: 8px;
    padding: 12px;
  }
  .year-grid {
    display: grid;
    grid-template-columns: repeat(35, minmax(10px, 1fr));
    gap: 3px;
    margin-top: 10px;
  }
  .year-cell {
    min-height: 26px;
    padding: 0;
    border-radius: 4px;
    border: 0;
    background: var(--dt-soft);
  }
  .year-cell.is-missed {
    background: repeating-linear-gradient(45deg, var(--dt-soft), var(--dt-soft) 3px, var(--dt-line) 3px, var(--dt-line) 6px);
  }
  .year-labels {
    display: flex;
    justify-content: space-between;
    color: var(--dt-muted);
    font-size: 12px;
    margin-top: 5px;
  }
  .side {
    background: var(--dt-card);
    border: 1px solid var(--dt-line);
    border-radius: 8px;
    padding: 14px;
    position: sticky;
    top: 12px;
  }
  .continent-row, .bar-row {
    display: grid;
    grid-template-columns: 130px minmax(80px, 1fr) 72px;
    gap: 8px;
    align-items: center;
    padding: 7px 0;
    border-top: 1px solid var(--dt-soft);
    font-size: 13px;
  }
  .bar-track {
    height: 9px;
    background: var(--dt-soft);
    border-radius: 999px;
    overflow: hidden;
  }
  .bar-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
  }
  .bar-val {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .country-detail h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 30px;
    line-height: 1.05;
    margin-bottom: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    border-radius: 999px;
    padding: 3px 9px;
    color: var(--dt-bg);
    font-size: 12px;
    font-weight: 700;
  }
  .detail-line {
    margin: 12px 0;
    font-size: 16px;
    line-height: 1.35;
  }
  .spark {
    width: 100%;
    height: 46px;
    margin: 8px 0 12px;
  }
  .kv {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid var(--dt-soft);
    padding: 8px 0;
    font-size: 13px;
  }
  .kv span { color: var(--dt-muted); }
  .list {
    margin: 6px 0 0;
    padding-left: 18px;
    color: var(--dt-muted);
    line-height: 1.35;
    font-size: 13px;
  }
  .summary {
    margin-top: 28px;
    border-top: 1px solid var(--dt-line);
    padding-top: 22px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  .summary-box {
    background: var(--dt-card);
    border: 1px solid var(--dt-line);
    border-radius: 8px;
    padding: 14px;
  }
  .facts {
    columns: 2;
    column-gap: 24px;
    margin: 12px 0 0;
    padding-left: 18px;
    color: var(--dt-muted);
    line-height: 1.42;
  }
  .facts li { break-inside: avoid; margin-bottom: 8px; }
  .note {
    color: var(--dt-muted);
    font-size: 12px;
    line-height: 1.45;
  }
  .tooltip {
    position: fixed;
    display: none;
    max-width: 260px;
    background: var(--dt-text);
    color: var(--dt-bg);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.35;
    pointer-events: none;
    z-index: 5;
  }
  @media (max-width: 920px) {
    .hero, .main, .summary-grid { grid-template-columns: 1fr; }
    .side { position: static; }
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .facts { columns: 1; }
  }
  @media (max-width: 560px) {
    .kviff-origin-dashboard { padding: 18px 10px 26px; }
    .stats { grid-template-columns: 1fr; }
    .continent-row, .bar-row { grid-template-columns: 104px minmax(70px, 1fr) 56px; }
    .year-grid { gap: 2px; }
  }
`;

const js = String.raw`
(() => {
  const DATA = __DATA__;
  const state = { year: Math.min(2025, DATA.yearMax), mode: 'annual', selected: null, playing: false, timer: null };
  const colors = new Map([
    ['Evropa', 'var(--dt-blue)'],
    ['Severní Amerika', 'var(--dt-red)'],
    ['Latinská Amerika', 'var(--dt-green)'],
    ['Asie', 'var(--dt-gold)'],
    ['Blízký východ', 'var(--dt-purple)'],
    ['Afrika', 'var(--dt-teal)'],
    ['Oceánie', 'var(--dt-brown)'],
  ]);
  const years = Array.from({ length: DATA.yearMax - DATA.yearMin + 1 }, (_, i) => DATA.yearMin + i);
  const fmt = new Intl.NumberFormat('cs-CZ');
  const pct = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 });
  const map = document.getElementById('origin-map');
  const bubbleLayer = document.getElementById('bubble-layer');
  const labelLayer = document.getElementById('label-layer');
  const side = document.getElementById('side-panel');
  const tip = document.getElementById('tooltip');
  const maxAnnual = Math.max(...DATA.countries.flatMap((country) => years.map((year) => country.years[year] || 0)));
  const maxCumulative = Math.max(...DATA.countries.map((country) => country.cumulative[DATA.yearMax] || 0));

  function mercator(lon, lat) {
    const width = 960;
    const height = 520;
    const x = (lon + 180) / 360 * width;
    const clamped = Math.max(-84, Math.min(84, lat));
    const yMerc = Math.log(Math.tan(Math.PI / 4 + clamped * Math.PI / 360));
    const y = height / 2 - (width * yMerc / (2 * Math.PI));
    return [x, Math.max(22, Math.min(height - 24, y))];
  }

  function valueFor(country) {
    return state.mode === 'annual' ? (country.years[state.year] || 0) : (country.cumulative[state.year] || 0);
  }

  function radius(value) {
    if (!value) return 0;
    const max = state.mode === 'annual' ? maxAnnual : maxCumulative;
    const limit = state.mode === 'annual' ? 29 : 34;
    return Math.max(2.4, Math.sqrt(value / max) * limit);
  }

  function plural(value, one, few, many) {
    if (value === 1) return one;
    if (value >= 2 && value <= 4) return few;
    return many;
  }

  function drawBackground() {
    const grid = document.getElementById('grid-layer');
    const labels = [
      ['Severní Amerika', -105, 50], ['Latinská Amerika', -62, -18], ['Evropa', 18, 53],
      ['Afrika', 22, 4], ['Asie', 93, 42], ['Oceánie', 135, -25]
    ];
    const lines = [];
    for (let lon = -180; lon <= 180; lon += 30) {
      const [x1, y1] = mercator(lon, -65);
      const [x2, y2] = mercator(lon, 78);
      lines.push('<line class="graticule" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"></line>');
    }
    for (let lat = -60; lat <= 75; lat += 15) {
      const [x1, y1] = mercator(-180, lat);
      const [x2, y2] = mercator(180, lat);
      lines.push('<line class="graticule" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"></line>');
    }
    grid.innerHTML = lines.join('') + labels.map(([name, lon, lat]) => {
      const [x, y] = mercator(lon, lat);
      return '<text class="continent-label" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '">' + name + '</text>';
    }).join('');
  }

  function initMap() {
    DATA.countries.slice().sort((a, b) => b.total - a.total).forEach((country) => {
      const [x, y] = mercator(country.lon, country.lat);
      country.x = x;
      country.y = y;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'bubble');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 0);
      circle.setAttribute('fill', colors.get(country.continent) || 'var(--dt-muted)');
      circle.addEventListener('mousemove', (event) => showTip(event, country));
      circle.addEventListener('mouseleave', hideTip);
      circle.addEventListener('click', () => selectCountry(country.key));
      country.el = circle;
      bubbleLayer.appendChild(circle);
    });
  }

  function updateLabels() {
    const shown = DATA.countries
      .filter((country) => valueFor(country) > 0)
      .sort((a, b) => valueFor(b) - valueFor(a))
      .slice(0, 10);
    labelLayer.innerHTML = shown.map((country) => {
      const value = valueFor(country);
      const dy = -radius(value) - 5;
      return '<text class="bubble-label" text-anchor="middle" x="' + country.x.toFixed(1) + '" y="' + (country.y + dy).toFixed(1) + '">' + country.name + ' ' + fmt.format(value) + '</text>';
    }).join('');
  }

  function showTip(event, country) {
    const annual = country.years[state.year] || 0;
    const cumulative = country.cumulative[state.year] || 0;
    const total = DATA.yearTotals[state.year] || 0;
    const share = total ? annual / total * 100 : 0;
    tip.innerHTML = '<strong>' + country.name + '</strong><br>' +
      state.year + ': ' + fmt.format(annual) + ' ' + plural(annual, 'výskyt', 'výskyty', 'výskytů') +
      (annual ? ' (' + pct.format(share) + ' % ročních výskytů)' : '') +
      '<br>Kumulativně do roku ' + state.year + ': ' + fmt.format(cumulative);
    tip.style.display = 'block';
    let x = event.clientX + 14;
    let y = event.clientY + 14;
    if (x + 260 > window.innerWidth) x = event.clientX - 276;
    if (y + 90 > window.innerHeight) y = event.clientY - 96;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }

  function hideTip() {
    tip.style.display = 'none';
  }

  function setYear(year) {
    state.year = year;
    render();
  }

  function setMode(mode) {
    state.mode = mode;
    document.getElementById('mode-annual').setAttribute('aria-pressed', mode === 'annual');
    document.getElementById('mode-cumulative').setAttribute('aria-pressed', mode === 'cumulative');
    render();
  }

  function selectCountry(key) {
    state.selected = state.selected === key ? null : key;
    render();
  }

  function stopPlay() {
    state.playing = false;
    clearInterval(state.timer);
    state.timer = null;
    const play = document.getElementById('play');
    play.textContent = 'Přehrát';
    play.setAttribute('aria-pressed', 'false');
  }

  function play() {
    if (state.playing) {
      stopPlay();
      return;
    }
    state.playing = true;
    const playButton = document.getElementById('play');
    playButton.textContent = 'Pauza';
    playButton.setAttribute('aria-pressed', 'true');
    state.timer = setInterval(() => {
      let next = state.year + 1;
      while (DATA.missedYears.includes(next)) next += 1;
      if (next > DATA.yearMax) next = DATA.yearMin;
      while (DATA.missedYears.includes(next)) next += 1;
      setYear(next);
    }, 700);
  }

  function renderStats() {
    const activeCountries = DATA.countries.filter((country) => country.years[state.year]).length;
    const yearAppearances = DATA.yearTotals[state.year] || 0;
    const films = DATA.filmTotals[state.year];
    const copro = DATA.countries.reduce((sum, country) => sum + ((country.years[state.year] || 0) && country.coproductionShare ? (country.years[state.year] || 0) * country.coproductionShare / 100 : 0), 0);
    document.getElementById('stat-year').textContent = state.year;
    document.getElementById('stat-countries').textContent = fmt.format(activeCountries);
    document.getElementById('stat-appearances').textContent = fmt.format(yearAppearances);
    document.getElementById('stat-films').textContent = films ? fmt.format(films) : '–';
    document.getElementById('stat-copro').textContent = yearAppearances ? pct.format(copro / yearAppearances * 100) + ' %' : '–';
  }

  function renderContinents() {
    const rows = DATA.continents.map((continent) => {
      const total = DATA.countries.filter((country) => country.continent === continent)
        .reduce((sum, country) => sum + (country.years[state.year] || 0), 0);
      const all = DATA.countries.filter((country) => country.continent === continent)
        .reduce((sum, country) => sum + country.total, 0);
      return { continent, total, all };
    }).sort((a, b) => b.total - a.total || b.all - a.all);
    const max = Math.max(1, ...rows.map((row) => row.total));
    side.innerHTML = '<h2>Kontinenty v roce ' + state.year + '</h2>' +
      rows.map((row) => '<div class="continent-row"><strong>' + row.continent + '</strong><span class="bar-track"><span class="bar-fill" style="width:' + (row.total / max * 100).toFixed(1) + '%;background:' + (colors.get(row.continent) || 'var(--dt-muted)') + '"></span></span><span class="bar-val">' + fmt.format(row.total) + '</span></div>').join('') +
      '<p class="note">Kliknutím na bublinu otevřete detail země: roční vývoj, podíl na katalogu, partneři koprodukcí a ukázkové filmy.</p>';
  }

  function makeSpark(country) {
    const values = years.map((year) => DATA.missedYears.includes(year) ? null : (country.years[year] || 0));
    const max = Math.max(1, ...values.filter((value) => value !== null));
    const width = 300;
    const height = 46;
    const step = width / (values.length - 1);
    const points = values.map((value, index) => value === null ? null : [index * step, height - 4 - value / max * (height - 10)]);
    const chunks = [];
    let chunk = [];
    points.forEach((point) => {
      if (!point) {
        if (chunk.length) chunks.push(chunk);
        chunk = [];
      } else {
        chunk.push(point);
      }
    });
    if (chunk.length) chunks.push(chunk);
    return '<svg class="spark" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Roční vývoj země">' +
      chunks.map((chunk) => '<polyline fill="none" stroke="' + (colors.get(country.continent) || 'var(--dt-muted)') + '" stroke-width="2.5" points="' + chunk.map((point) => point.map((n) => n.toFixed(1)).join(',')).join(' ') + '"></polyline>').join('') +
      '</svg>';
  }

  function renderCountry(country) {
    const annual = country.years[state.year] || 0;
    const yearAppearances = DATA.yearTotals[state.year] || 0;
    const films = DATA.filmTotals[state.year];
    const shareOfAppearances = yearAppearances ? annual / yearAppearances * 100 : 0;
    const shareOfProgram = films ? annual / films * 100 : null;
    const exampleItems = country.examples ? country.examples.split('; ').slice(0, 5).map((item) => '<li>' + item + '</li>').join('') : '<li>Bez ukázkových filmů v exportu.</li>';
    const partners = country.partners || 'V exportu nejsou uvedeni koprodukční partneři.';
    side.innerHTML = '<div class="country-detail">' +
      '<button type="button" id="back">Zpět na kontinenty</button>' +
      '<h2>' + country.name + '</h2>' +
      '<span class="chip" style="background:' + (colors.get(country.continent) || 'var(--dt-muted)') + '">' + country.continent + '</span>' +
      '<p class="detail-line">' + (annual
        ? '<strong>' + fmt.format(annual) + '</strong> ' + plural(annual, 'výskyt', 'výskyty', 'výskytů') + ' v roce <strong>' + state.year + '</strong>' + (shareOfProgram !== null ? ', tedy u <strong>' + pct.format(shareOfProgram) + ' %</strong> filmů katalogu.' : ', tedy <strong>' + pct.format(shareOfAppearances) + ' %</strong> všech produkčních výskytů ročníku.')
        : 'V roce <strong>' + state.year + '</strong> se v katalogu neobjevuje.') + '</p>' +
      makeSpark(country) +
      '<div class="kv"><span>Celkem výskytů</span><strong>' + fmt.format(country.total) + '</strong></div>' +
      '<div class="kv"><span>První / poslední výskyt</span><strong>' + country.firstYear + ' / ' + country.lastYear + '</strong></div>' +
      '<div class="kv"><span>Nejvýraznější rok</span><strong>' + country.peak + '</strong></div>' +
      '<div class="kv"><span>Podíl koprodukčních filmů</span><strong>' + (country.coproductionShare === null ? '–' : pct.format(country.coproductionShare) + ' %') + '</strong></div>' +
      '<div class="kv"><span>Koprodukce s Českem</span><strong>' + fmt.format(country.czechCoproductions || 0) + '</strong></div>' +
      '<h2>Ukázkové filmy</h2><ul class="list">' + exampleItems + '</ul>' +
      '<h2>Top koprodukční partneři</h2><p class="note">' + partners + '</p>' +
      '</div>';
    document.getElementById('back').addEventListener('click', () => {
      state.selected = null;
      render();
    });
  }

  function renderMap() {
    DATA.countries.forEach((country) => {
      const value = valueFor(country);
      country.el.setAttribute('r', radius(value));
      country.el.classList.toggle('is-selected', state.selected === country.key);
      country.el.classList.toggle('is-muted', Boolean(state.selected && state.selected !== country.key));
    });
    updateLabels();
  }

  function renderTimeline() {
    years.forEach((year) => {
      const cell = document.querySelector('[data-year="' + year + '"]');
      if (cell) cell.classList.toggle('is-active', year === state.year);
    });
  }

  function renderSummary() {
    const grand = DATA.countries.reduce((sum, country) => sum + country.total, 0);
    const continentTotals = DATA.continents.map((continent) => ({
      continent,
      total: DATA.countries.filter((country) => country.continent === continent).reduce((sum, country) => sum + country.total, 0),
    })).sort((a, b) => b.total - a.total);
    const topCountries = DATA.countries.slice().sort((a, b) => b.total - a.total).slice(0, 10);
    const maxContinent = Math.max(...continentTotals.map((row) => row.total));
    const maxCountry = Math.max(...topCountries.map((row) => row.total));
    document.getElementById('summary-total').textContent = fmt.format(grand);
    document.getElementById('summary-continents').innerHTML = continentTotals.map((row) => '<div class="bar-row"><strong>' + row.continent + '</strong><span class="bar-track"><span class="bar-fill" style="width:' + (row.total / maxContinent * 100).toFixed(1) + '%;background:' + (colors.get(row.continent) || 'var(--dt-muted)') + '"></span></span><span class="bar-val">' + fmt.format(row.total) + '</span></div>').join('');
    document.getElementById('summary-countries').innerHTML = topCountries.map((row) => '<div class="bar-row"><strong>' + row.name + '</strong><span class="bar-track"><span class="bar-fill" style="width:' + (row.total / maxCountry * 100).toFixed(1) + '%;background:' + (colors.get(row.continent) || 'var(--dt-muted)') + '"></span></span><span class="bar-val">' + fmt.format(row.total) + '</span></div>').join('');
  }

  function renderFacts() {
    const strongest = DATA.countries.flatMap((country) => years.map((year) => ({
      country,
      year,
      value: country.years[year] || 0,
      films: DATA.filmTotals[year] || null,
    }))).sort((a, b) => b.value - a.value).slice(0, 3);
    const new2026 = DATA.countries.filter((country) => country.firstYear === 2026).map((country) => country.name);
    const highCopro = DATA.countries.filter((country) => country.total >= 10 && country.coproductionShare >= 85).sort((a, b) => b.coproductionShare - a.coproductionShare).slice(0, 4);
    document.getElementById('facts').innerHTML = [
      'Nejsilnější jednorázové špičky: ' + strongest.map((item) => '<strong>' + item.country.name + ' ' + item.year + '</strong> (' + fmt.format(item.value) + ')').join(', ') + '.',
      new2026.length ? 'Ročník 2026 přidává nové nebo nově agregované země v exportu: <strong>' + new2026.join(', ') + '</strong>.' : '',
      'U menších kinematografií je vidět síla koprodukcí: ' + highCopro.map((country) => '<strong>' + country.name + '</strong> ' + pct.format(country.coproductionShare) + ' %').join(', ') + '.',
      'Evropa dominuje celkovému objemu, ale mapa ukazuje i programové vlny mimo evropské centrum: silné roky Jižní Koreje, Austrálie, Brazílie nebo USA.'
    ].filter(Boolean).map((fact) => '<li>' + fact + '</li>').join('');
  }

  function render() {
    document.getElementById('map-year').textContent = state.year;
    renderStats();
    renderMap();
    renderTimeline();
    const selected = DATA.countries.find((country) => country.key === state.selected);
    if (selected) renderCountry(selected);
    else renderContinents();
  }

  function initTimeline() {
    const grid = document.getElementById('year-grid');
    grid.innerHTML = years.map((year) => {
      const missed = DATA.missedYears.includes(year);
      return '<button type="button" class="year-cell' + (missed ? ' is-missed' : '') + '" data-year="' + year + '"' + (missed ? ' disabled' : '') + ' aria-label="' + (missed ? 'Ročník ' + year + ' se nekonal' : 'Zobrazit rok ' + year) + '"></button>';
    }).join('');
    grid.querySelectorAll('button:not(:disabled)').forEach((button) => {
      button.addEventListener('click', () => {
        stopPlay();
        setYear(Number(button.dataset.year));
      });
    });
  }

  document.getElementById('mode-annual').addEventListener('click', () => setMode('annual'));
  document.getElementById('mode-cumulative').addEventListener('click', () => setMode('cumulative'));
  document.getElementById('play').addEventListener('click', play);

  drawBackground();
  initMap();
  initTimeline();
  renderSummary();
  renderFacts();
  render();
})();
`;

const inlineData = JSON.stringify(payload);
const browserJs = js.replace('__DATA__', inlineData);
new Function(browserJs);

const body = String.raw`
<div class="kviff-origin-dashboard">
  <header class="hero">
    <div>
      <p class="eyebrow">DataTimes · KVIFF · produkční země filmů</p>
      <h1>Odkud přijíždějí filmy do Karlových Varů</h1>
      <p class="dek">Interaktivní mapa a dashboard sledují produkční země filmů v katalozích KVIFF 1992-2026. Jednotkou je výskyt země: koprodukční film se započítá každé uvedené produkční zemi.</p>
    </div>
    <div class="mode-card">
      <h2>Zobrazení mapy</h2>
      <div class="segmented">
        <button type="button" id="mode-annual" aria-pressed="true">Roční výskyty</button>
        <button type="button" id="mode-cumulative" aria-pressed="false">Kumulativně</button>
      </div>
      <p class="note">Velikost bubliny odpovídá počtu výskytů produkční země. Časová osa vynechává roky 1993 a 2020, kdy se festival nekonal.</p>
    </div>
  </header>

  <section class="stats" aria-label="Souhrn vybraného ročníku">
    <div class="stat"><strong id="stat-year">2025</strong><span>vybraný ročník</span></div>
    <div class="stat"><strong id="stat-countries">–</strong><span>zemí ve filmových kreditech</span></div>
    <div class="stat"><strong id="stat-appearances">–</strong><span>výskytů produkčních zemí</span></div>
    <div class="stat"><strong id="stat-films">–</strong><span>filmů v katalogu</span></div>
    <div class="stat"><strong id="stat-copro">–</strong><span>odhad výskytů u koprodukčních filmů</span></div>
  </section>

  <section class="main">
    <div class="map-wrap">
      <div class="map-head">
        <p class="map-title">Mapa pro rok <strong id="map-year">2025</strong></p>
        <div class="timeline-controls">
          <button type="button" id="play" aria-pressed="false">Přehrát</button>
        </div>
      </div>
      <svg id="origin-map" viewBox="0 0 960 520" role="img" aria-label="Mapa produkčních zemí filmů KVIFF">
        <g id="grid-layer"></g>
        <g id="bubble-layer"></g>
        <g id="label-layer"></g>
      </svg>
      <div class="timeline">
        <div id="year-grid" class="year-grid"></div>
        <div class="year-labels"><span>1992</span><span>2000</span><span>2010</span><span>2020</span><span>2026</span></div>
        <p class="note">Šrafované buňky označují roky bez festivalového ročníku.</p>
      </div>
    </div>
    <aside id="side-panel" class="side" aria-live="polite"></aside>
  </section>

  <section class="summary">
    <h2>Celkem 1992-2026: <span id="summary-total">–</span> výskytů produkčních zemí</h2>
    <div class="summary-grid">
      <div class="summary-box">
        <h2>Kontinenty podle výskytů</h2>
        <div id="summary-continents"></div>
      </div>
      <div class="summary-box">
        <h2>Deset nejčastějších zemí</h2>
        <div id="summary-countries"></div>
      </div>
    </div>
    <h2>Co v datech stojí za pozornost</h2>
    <ul id="facts" class="facts"></ul>
    <p class="note"><strong>Metodika:</strong> Data vycházejí z oficiálního archivu KVIFF a lokálních exportů v adresáři projektu. Jednotkou je výskyt produkční země u filmu, nikoli národnost filmu. Podíl na programu u detailu země srovnává počet výskytů s počtem filmů v katalogu daného ročníku tam, kde je tento počet k dispozici.</p>
  </section>
</div>
<div id="tooltip" class="tooltip" role="tooltip"></div>
<script>${browserJs}</script>
`;

const standalone = `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Odkud přijíždějí filmy do Karlových Varů</title>
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>
`;

const inline = `<style>${css}</style>\n${body}`;

fs.writeFileSync(outPath, standalone, 'utf8');
fs.mkdirSync(path.dirname(inlinePath), { recursive: true });
fs.writeFileSync(inlinePath, inline, 'utf8');
console.log(JSON.stringify({
  standalone: outPath,
  inline: inlinePath,
  countries: countries.length,
  appearances: countries.reduce((sum, country) => sum + country.total, 0),
  filmYears: Object.keys(filmTotals).length,
  bytes: Buffer.byteLength(standalone, 'utf8'),
}, null, 2));

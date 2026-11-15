// Motiv coveru speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (verze 2, po připomínkách Kateřiny 14. 11. 2026):
// celé Československo 1989 a všechna města, kde prameny zaznamenaly demonstraci v listopadu–prosinci 1989,
// každé STEJNĚ velkým svítícím bodem. Velikost podle počtu účastníků jsme opustili: Praha (Letná 25. 11., až 800 000
// lidí, mnozí přijeli z regionů) by přebila zbytek a cover by tvrdil, že revoluci udělala Praha.
// (Varianta s oblouky k Letné byla zamítnuta, data o tom, odkud kdo přijel, nemáme.)

// Data: statisticka-data/cesko/historie/demonstrace-1989/20261114/demonstrace_1989.csv (ČR, souřadnice RÚIAN)
//       a demonstrace_1989_sk.csv (SR, bez souřadnic → centroid obce z ÚGKK, slovensko/geo/obce-topojson-2026).
// Mapa: tečková mřížka z mapy predikce Senátu (ČR), Slovensko dopočítané ve stejné šestiúhelníkové mřížce.
// node motiv.cjs → motiv-<formát>.svg
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..');
const najdi = (m) => require.resolve(m, { paths: [REPO, path.join(REPO, '..', '..', '..')] });
(async () => {
const { feature, merge } = await import(require('url').pathToFileURL(najdi('topojson-client')).href);
const { geoContains, geoCentroid } = await import(require('url').pathToFileURL(najdi('d3-geo')).href);
const VARIANTA = 'roztrzena';

const dotsCZ = require(path.join(REPO, 'apps', 'web', 'app', 'clanek', '_articles', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json')).dots;
const archiv = (() => {
  for (let p = __dirname; p !== path.dirname(p); p = path.dirname(p)) {
    const f = path.join(p, 'csu-data', 'historie', 'demonstrace-1989', '20261114');
    if (fs.existsSync(f)) return { demo: f, sk: path.join(fs.realpathSync(path.join(p, 'csu-data')), '..', 'slovensko', 'geo', 'obce-topojson-2026', 'sk-obce.topo.json') };
  }
  throw new Error('archiv demonstrací nenalezen (csu-data)');
})();
const topo = JSON.parse(fs.readFileSync(archiv.sk, 'utf8'));

function parse(t) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; }
    else f += ch;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const nacti = (soubor) => {
  const [h, ...r] = parse(fs.readFileSync(path.join(archiv.demo, soubor), 'utf8').replace(/^﻿/, ''));
  const c = Object.fromEntries(h.map((x, i) => [x, i]));
  return r.filter((x) => x[c.obec]).map((x) => Object.fromEntries(Object.entries(c).map(([k, i]) => [k, x[i]])));
};

// města ČR (všechny řádky, i bez čísla – jde o to, KDE se demonstrovalo)
const mesta = new Map();
for (const r of nacti('demonstrace_1989.csv')) if (r.lat) mesta.set(r.obec, { obec: r.obec, lon: +r.lon, lat: +r.lat, stat: 'CZ' });
// města SR: centroid obce (Bratislava, Košice = část Staré Mesto)
const skObce = feature(topo, topo.objects.obce).features;
// Čierna nad Tisou (15. 12.: pochod přespolních studentů vybírajících na stávkový fond) není místní demonstrace.
// Doplněk ze slovenských pramenů (ÚPN, odborná literatura) ve složce 20261115: jen řádky pro_mapu = 1.
const NE_SK = new Set(['Čierna nad Tisou', 'Žiar nad Hronom']); // Žiar 22. 11.: jen 9 lidí
const doplnek = path.join(archiv.demo, '..', '20261115', 'demonstrace_1989_sk_doplnek.csv');
const skRadky = [...nacti('demonstrace_1989_sk.csv'),
  ...(fs.existsSync(doplnek) ? nacti(path.relative(archiv.demo, doplnek)).filter((r) => r.pro_mapu === '1') : [])];
for (const r of skRadky) {
  if (mesta.has(r.obec) || NE_SK.has(r.obec)) continue;
  const f = skObce.find((g) => g.properties.NM4 === r.obec) || skObce.find((g) => g.properties.NM4 === `${r.obec}-Staré Mesto`);
  if (!f) throw new Error(`slovenská obec nenalezena: ${r.obec}`);
  const [lon, lat] = geoCentroid(f);
  mesta.set(r.obec, { obec: r.obec, lon, lat, stat: 'SK' });
}
const body = [...mesta.values()];

// Slovensko ve stejné šestiúhelníkové mřížce jako tečky ČR
const LA0 = 48.604, DLA = 0.0522, LO0 = 12.1371, DLO = 0.0929;
const radek0 = dotsCZ.filter((d) => Math.abs(d[1] - (LA0 + DLA)) < 1e-3)[0];
const posun1 = ((((radek0[0] - LO0) / DLO) % 1) + 1) % 1 > 0.25 ? DLO / 2 : 0; // posun lichých řádků
const sk = merge(topo, topo.objects.kraje.geometries);
const dotsSK = [];
for (let i = -20; i < 80; i++) {
  const la = LA0 + i * DLA;
  if (la < 47.6 || la > 49.7) continue;
  const off = Math.abs(i % 2) === 1 ? posun1 : 0;
  for (let lo = LO0 + off; lo < 22.7; lo += DLO) if (lo > 16.7 && geoContains(sk, [lo, la])) dotsSK.push([lo, la]);
}
// Roztržená republika (Kateřina 14. 11. 2026): Česko dominantní a syté, Slovensko odtržené a tlumené (skutečná velikost; zmenšené vypadalo divně) –
// dnes jsou to dva státy. Souřadnice: u = délka × cos(49,3°), v = −šířka; Slovensko zmenšené kolem svého
// severozápadního rohu (Kysuce/Záhorie) a odsunuté o mezeru na východ a lehce na jih.
const kx = Math.cos((49.3 * Math.PI) / 180);
const SK_K = 1, SK_MEZERA = [0.3, 0.18], SK_OPACITY = 0.5;
const skU = dotsSK.map((d) => d[0] * kx), skV = dotsSK.map((d) => -d[1]);
const kotva = [Math.min(...skU), Math.min(...skV)];
const UV = (lo, la, stat) => {
  const u = lo * kx, v = -la;
  if (stat !== 'SK') return [u, v];
  return [kotva[0] + (u - kotva[0]) * SK_K + SK_MEZERA[0], kotva[1] + (v - kotva[1]) * SK_K + SK_MEZERA[1]];
};
const vse = [...dotsCZ.map((d) => UV(d[0], d[1], 'CZ')), ...dotsSK.map((d) => UV(d[0], d[1], 'SK'))];
const [u0, u1, v0, v1] = [Math.min(...vse.map((p) => p[0])), Math.max(...vse.map((p) => p[0])), Math.min(...vse.map((p) => p[1])), Math.max(...vse.map((p) => p[1]))];

const BOD = '#de1743', ZARE = '#ff8099', REPUBLIKA = '#4c4f8e';
// oblast mapy [x0, y0, x1, y1] v každém formátu
const MAPA = {
  homepage: [1500, 1200, [40, 530, 1480, 1180]], og: [1200, 630, [60, 200, 1140, 555]],
  square: [1080, 1080, [20, 440, 1060, 1050]], instagram: [1080, 1350, [20, 560, 1060, 1230]],
  story: [1080, 1920, [20, 860, 1060, 1560]],
  dlazdice: [1080, 1080, [0, 40, 1080, 600]], // dlaždice speciálu (titulek dole dopisuje web)
};
const PRAHA = body.find((b) => b.obec === 'Praha'), BA = body.find((b) => b.obec === 'Bratislava');

for (const [klic, [W, H, [mx0, my0, mx1, my1]]] of Object.entries(MAPA)) {
  const sc = Math.min((mx1 - mx0) / (u1 - u0), (my1 - my0) / (v1 - v0));
  const ox = mx0 + (mx1 - mx0 - (u1 - u0) * sc) / 2, oy = my0 + (my1 - my0 - (v1 - v0) * sc) / 2;
  const P = (lo, la, stat) => { const [u, v] = UV(lo, la, stat); return [ox + (u - u0) * sc, oy + (v - v0) * sc]; };
  const c = (x, y, rr, a) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" ${a}/>`;
  const vrstva = (stat, k) => {
    const r = Math.max(1.4, sc * 0.016) * k, rb = r * 3.2; // jeden bod = jedno město, bez ohledu na počet lidí
    const tecky = (stat === 'SK' ? dotsSK : dotsCZ).map((d) => c(...P(d[0], d[1], stat), r, `fill="${REPUBLIKA}" opacity="0.85"`)).join('');
    const mesta = body.filter((b) => b.stat === stat);
    const zare = mesta.map((b) => c(...P(b.lon, b.lat, stat), rb * 2.6, 'fill="url(#z)"')).join('');
    const sw = Math.max(1, sc * 0.006 * k).toFixed(1);
    const bb = mesta.map((b) => c(...P(b.lon, b.lat, stat), rb, `fill="${BOD}" stroke="${ZARE}" stroke-width="${sw}"`)).join('');
    // Letná / náměstí SNP: prstence kolem největšího shromáždění
    const hl = stat === 'SK' ? BA : PRAHA;
    const pr = [1.9, 2.8].map((kk, i) => c(...P(hl.lon, hl.lat, stat), rb * kk, `fill="none" stroke="${ZARE}" stroke-width="${Math.max(1.2, sc * 0.007 * k).toFixed(1)}" stroke-opacity="${i ? 0.4 : 0.75}"`)).join('');
    return `<g${stat === 'SK' ? ` opacity="${SK_OPACITY}"` : ''}>${tecky}${zare}${pr}${bb}</g>`;
  };
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="z"><stop offset="0" stop-color="${ZARE}" stop-opacity="0.55"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs>${vrstva('SK', SK_K)}${vrstva('CZ', 1)}</svg>`);
}
console.log(`motiv (${VARIANTA}) hotový: ${body.length} měst (${body.filter((b) => b.stat === 'CZ').length} ČR, ${body.filter((b) => b.stat === 'SK').length} SR), teček SR ${dotsSK.length}`);
})();

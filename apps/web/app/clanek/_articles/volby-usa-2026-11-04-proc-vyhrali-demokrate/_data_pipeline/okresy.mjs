// Podrobná mapa výsledků po okresech: Sněmovna, Senát a guvernéři 2026.
// Vstupy (raw/, mimo git):
//   raw/vysledky-okresy.json – průběžné výsledky po okresech z predikčního modelu DataTimes.cz
//                              (sčítání podle AP z feedů The New York Times a Civic API); sloupce cols + rows
//   raw/counties-albers-10m.json – hranice okresů us-atlas 3.0.1 (US Census Bureau, projekce Albers USA)
// Výstup: ../okresy-mapa.json (kopíruje se do public/ a načítá ho okresy-mapa.html)
// Spuštění: NM=<repo>/node_modules node okresy.mjs   (potřebuje d3-geo a topojson-client z kořenového node_modules)
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NM = process.env.NM || path.join(__dirname, '../../../../../../node_modules');
const { geoPath } = await import(pathToFileURL(path.join(NM, 'd3-geo/src/index.js')).href);
const topojson = (await import(pathToFileURL(path.join(NM, 'topojson-client/dist/topojson-client.js')).href)).default;

const RAW = path.join(__dirname, 'raw');
const topo = JSON.parse(fs.readFileSync(path.join(RAW, 'counties-albers-10m.json'), 'utf8'));
const src = JSON.parse(fs.readFileSync(path.join(RAW, 'vysledky-okresy.json'), 'utf8'));

const FIPS = { AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10', FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55', WY: '56' };
const ST = Object.fromEntries(Object.entries(FIPS).map(([k, v]) => [v, k]));

// jiné názvy ve výsledcích než v mapě
const ALIAS = { 'NY|brooklyn': 'kings', 'NY|manhattan': 'newyork', 'NY|statenisland': 'richmond', 'LA|jeffdavis': 'jeffersondavis', 'MS|jeffdavis': 'jeffersondavis' };
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\b(county|parish|borough|census area|city and borough|municipality|municipio)\b/g, '')
  .replace(/^saint\b/, 'st').replace(/^ste\b/, 'ste').replace(/[.'’\s-]/g, '');

// okresy z mapy: klíč stát|jméno -> id
const geoms = topo.objects.counties.geometries.filter((g) => ST[g.id.slice(0, 2)]);
const byKey = {};
for (const g of geoms) {
  const st = ST[g.id.slice(0, 2)];
  // nezávislá města (FIPS 500+ ve Virginii, Marylandu, Missouri a Nevadě) mají často stejné jméno jako okres
  const isCity = ['VA', 'MD', 'MO', 'NV'].includes(st) && +g.id.slice(2) >= 500;
  const n = norm(g.properties.name);
  const k = `${st}|${n}${isCity && !n.endsWith('city') ? 'city' : ''}`;
  byKey[k] = g.id;
}
const match = (st, unit) => {
  let n = norm(unit);
  n = ALIAS[`${st}|${n}`] || n;
  if (st === 'VA' && !/city$/.test(n) && byKey[`${st}|${n}`] === undefined && byKey[`${st}|${n}city`]) n += 'city';
  if (byKey[`${st}|${n}`]) return byKey[`${st}|${n}`];
  if (/city$/.test(n) && byKey[`${st}|${n.replace(/city$/, '')}`] && st !== 'VA') return byKey[`${st}|${n.replace(/city$/, '')}`];
  return null;
};

// sečtení řádků po okresech (okres rozdělený mezi víc sněmovních obvodů se sčítá)
const cols = src.cols;
const rows = src.rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
const vrstvy = { H: {}, S: {}, G: {} };
const celyStat = { H: {}, S: {}, G: {} }; // státy hlášené po jiných jednotkách (Aljaška, Connecticut) -> barva celého státu
const nesparovano = {};
for (const r of rows) {
  const id = match(r.st, r.unit);
  const cil = id ? vrstvy[r.kind] : celyStat[r.kind];
  const k = id || r.st;
  if (!id) nesparovano[r.st] = (nesparovano[r.st] || new Set()).add(r.unit);
  const v = (cil[k] = cil[k] || { d: 0, r: 0, c: 0, e: 0 });
  v.d += r.votes_d || 0; v.r += r.votes_r || 0; v.c += r.counted || 0; v.e += r.expected || 0;
}
// státy, kde se nic nespárovalo (nebo jen část), obarvit celým státem
for (const kind of Object.keys(vrstvy)) {
  for (const [st, v] of Object.entries(celyStat[kind])) {
    const maOkresy = Object.keys(vrstvy[kind]).some((id) => id.startsWith(FIPS[st]));
    if (maOkresy) continue;
    // Aljaška: o vítězích rozhodne přepočet preferenčních hlasů (18. 11.), první preference barvou neukazujeme -> stat 2
    for (const g of geoms) if (g.id.startsWith(FIPS[st])) vrstvy[kind][g.id] = { ...v, stat: st === 'AK' ? 2 : 1 };
  }
}
for (const [st, s] of Object.entries(nesparovano)) {
  const vse = [...s];
  console.log(`nespárováno ${st}: ${vse.length} (${vse.slice(0, 6).join(', ')}${vse.length > 6 ? '…' : ''})`);
}

// cesty SVG (souřadnice už jsou v projekci Albers USA, 975 × 610)
const p = geoPath().digits(1);
const fc = topojson.feature(topo, { type: 'GeometryCollection', geometries: geoms });
const okresy = fc.features.map((f) => [f.id, f.properties.name, ST[f.id.slice(0, 2)], p(f)]);
const hranice = p(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b));
const obrys = p(topojson.feature(topo, topo.objects.nation));

const ix = Object.fromEntries(okresy.map((o, i) => [o[0], i]));
const ven = {};
for (const [kind, data] of Object.entries(vrstvy)) {
  ven[kind] = {};
  for (const [id, v] of Object.entries(data)) {
    if (ix[id] === undefined) continue;
    ven[kind][ix[id]] = [v.d, v.r, v.e ? Math.round((1000 * v.c) / v.e) / 10 : null, v.stat || 0];
  }
}
// kontrolní součty
for (const kind of ['H', 'S', 'G']) {
  const n = Object.keys(ven[kind]).length;
  const d = Object.values(ven[kind]).reduce((a, v) => a + v[0], 0);
  const r = Object.values(ven[kind]).reduce((a, v) => a + v[1], 0);
  console.log(`${kind}: ${n} okresů, D ${d.toLocaleString('cs')}, R ${r.toLocaleString('cs')}, D−R ${(100 * (d - r) / (d + r)).toFixed(1)} b.`);
}
// kolik okresů vyhrála která strana (bez Aljašky a Connecticutu, barvených za celý stát) – titulek mapy
for (const kind of ['H', 'S', 'G']) {
  const v = Object.values(ven[kind]).filter((x) => x[0] + x[1] > 0 && !x[3]);
  const dw = v.filter((x) => x[0] > x[1]).length;
  const sd = v.reduce((a, x) => a + x[0], 0), sa = v.reduce((a, x) => a + x[0] + x[1], 0);
  console.log(`${kind}: okresy D ${dw}, R ${v.length - dw} (R ${(100 * (v.length - dw) / v.length).toFixed(0)} %), hlasy D ${(100 * sd / sa).toFixed(1)} % ze dvou stran`);
}
// Sněmovní obvody: sečtené hlasy a těžiště (průměr těžišť okresů vážený očekávanými hlasy) -> obvody.json pro kartogram 1 obvod = 1 pole
// Obvody bez souboje demokrata s republikánem (v okresních datech chybí) doplní raw/zavody.json (seznam 435 závodů a jejich hodnocení)
const centroidId = Object.fromEntries(fc.features.map((f) => [f.id, p.centroid(f)]));
const obv = {};
for (const r of rows) {
  if (r.kind !== 'H') continue;
  const o = (obv[r.race] = obv[r.race] || { label: r.label, st: r.st, d: 0, r: 0, c: 0, e: 0, sx: 0, sy: 0, w: 0 });
  o.d += r.votes_d || 0; o.r += r.votes_r || 0; o.c += r.counted || 0; o.e += r.expected || 0;
  const id = match(r.st, r.unit);
  const ids = id ? [id] : geoms.filter((g) => g.id.startsWith(FIPS[r.st])).map((g) => g.id); // Aljaška, Connecticut: celý stát
  for (const i of ids) { const c = centroidId[i]; const w = (r.expected || 1) / ids.length; o.sx += c[0] * w; o.sy += c[1] * w; o.w += w; }
}
const zav = JSON.parse(fs.readFileSync(path.join(RAW, 'zavody.json'), 'utf8'));
const obvody = zav.rows.map((x) => Object.fromEntries(zav.cols.map((c, i) => [c, x[i]]))).filter((x) => x.kind === 'H').map((z) => {
  const o = obv[z.id];
  if (o && o.d + o.r > 0) return [z.label, z.st, o.d, o.r, o.e ? Math.round((1000 * o.c) / o.e) / 10 : null, z.st === 'AK' ? 2 : 0, +(o.sx / o.w).toFixed(1), +(o.sy / o.w).toFixed(1)];
  const strana = /D$/.test(z.fc_rating) ? 'D' : 'R'; // bez souboje D × R: barva podle strany, která obvod podle předvolebního hodnocení drží
  return [z.label, z.st, strana === 'D' ? 1 : 0, strana === 'R' ? 1 : 0, null, 3, null, null];
});
const dObv = obvody.filter((o) => o[5] !== 2 && o[2] > o[3]).length;
console.log(`obvody: ${obvody.length}, demokraté vedou nebo bez soupeře v ${dObv}, republikáni v ${obvody.filter((o) => o[5] !== 2 && o[3] > o[2]).length}, Aljaška ${obvody.filter((o) => o[5] === 2).length}; bez souboje D×R ${obvody.filter((o) => o[5] === 3).length}`);
fs.writeFileSync(path.join(__dirname, 'obvody.json'), JSON.stringify(obvody));

const stav = new Date(src.t * 1000).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
const out = { stav, okresy, hranice, obrys, vrstvy: ven };
const f = path.join(__dirname, '..', 'okresy-mapa.json');
fs.writeFileSync(f, JSON.stringify(out));
console.log(`stav ${stav}; ${f} ${(fs.statSync(f).size / 1024).toFixed(0)} kB`);

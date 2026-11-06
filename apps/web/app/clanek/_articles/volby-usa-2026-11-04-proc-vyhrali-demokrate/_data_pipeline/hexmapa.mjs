// Šestiúhelníková mapa obvodů do Sněmovny 2026: tvary obvodů z hexmapy Daniela Donnera (The Downballot, verze 3.2,
// CC BY 4.0, https://the-db.co/maps), výsledky z obvody.json (výstup okresy.mjs, stejný snímek sčítání jako ostatní mapy článku).
// Vstupy: raw/hexmap-downballot/hex-cd-v32.geojson, raw/hexmap-downballot/hex-states-v30.geojson (viz ZDROJ.txt), obvody.json
// Výstup: ../hexmapa-obvody.json (načítá ho hexmapa.html). Spuštění: node hexmapa.mjs (bez závislostí)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'raw', 'hexmap-downballot');
const cd = JSON.parse(fs.readFileSync(path.join(RAW, 'hex-cd-v32.geojson'), 'utf8'));
const st = JSON.parse(fs.readFileSync(path.join(RAW, 'hex-states-v30.geojson'), 'utf8'));
const obvody = JSON.parse(fs.readFileSync(path.join(__dirname, 'obvody.json'), 'utf8'));

// Donner kreslí v rovinných souřadnicích (x = zeměpisná délka, y = šířka), bez projekce
const W = 1000;
const all = cd.features.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flat(2));
const x0 = Math.min(...all.map((p) => p[0])), x1 = Math.max(...all.map((p) => p[0]));
const y0 = Math.min(...all.map((p) => p[1])), y1 = Math.max(...all.map((p) => p[1]));
const s = W / (x1 - x0), H = Math.ceil((y1 - y0) * s);
const P = ([x, y]) => [Math.round((x - x0) * s * 10) / 10, Math.round((y1 - y) * s * 10) / 10];
// relativní SVG cesta (kratší soubor); vynechá body, které se po zaokrouhlení nepohnou
const cesta = (geom) => {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let d = '';
  for (const poly of polys) for (const ring of poly) {
    let prev = null, first = true;
    for (const pt of ring) {
      const q = P(pt);
      if (prev && q[0] === prev[0] && q[1] === prev[1]) continue;
      d += first ? `M${q[0]} ${q[1]}` : `l${+(q[0] - prev[0]).toFixed(1)} ${+(q[1] - prev[1]).toFixed(1)}`;
      prev = q; first = false;
    }
    d += 'z';
  }
  return d;
};

// výsledky: label "AL-1"; Donner má u států s jediným obvodem CDLABEL = zkratka státu
const vys = Object.fromEntries(obvody.map((o) => [o[0], o]));
const obv = cd.features.map((f) => {
  const { STATEAB, CDLABEL } = f.properties;
  const label = `${STATEAB}-${/^\d+$/.test(CDLABEL) ? CDLABEL : '1'}`;
  const o = vys[label];
  if (!o) throw new Error(`hexmapa: chybí výsledek pro ${label}`);
  // [label, stát, hlasy D, hlasy R, sečteno %, stav (0 souboj D×R, 2 Aljaška – preference, 3 bez souboje D×R), cesta]
  return [label, STATEAB, o[2], o[3], o[4], o[5], cesta(f.geometry)];
});
if (obv.length !== 435 || new Set(obv.map((o) => o[0])).size !== 435) throw new Error('hexmapa: nesedí 435 obvodů');

// hranice států a zkratky do těžiště (průměr vrcholů vnějšího prstence největšího dílu)
const staty = st.features.map((f) => {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const big = polys.map((p) => p[0]).sort((a, b) => b.length - a.length)[0];
  const c = P([big.reduce((a, p) => a + p[0], 0) / big.length, big.reduce((a, p) => a + p[1], 0) / big.length]);
  return [f.properties.STATEAB, cesta(f.geometry), c[0], c[1]];
});

const vyhra = (o) => (o[5] === 2 ? 'nerozhodnuto' : o[2] > o[3] ? 'D' : 'R');
const dN = obv.filter((o) => vyhra(o) === 'D').length, rN = obv.filter((o) => vyhra(o) === 'R').length;
console.log(`hexmapa: ${obv.length} obvodů, demokraté vedou v ${dN}, republikáni v ${rN}, Aljaška ${obv.filter((o) => o[5] === 2).length}; bez souboje D×R ${obv.filter((o) => o[5] === 3).length}`);
const out = { w: W, h: H, zdroj: 'Daniel Donner / The Downballot, CC BY 4.0', obvody: obv, staty };
const f = path.join(__dirname, '..', 'hexmapa-obvody.json');
fs.writeFileSync(f, JSON.stringify(out));
console.log(`${f} ${(fs.statSync(f).size / 1024).toFixed(0)} kB, ${W}×${H}`);

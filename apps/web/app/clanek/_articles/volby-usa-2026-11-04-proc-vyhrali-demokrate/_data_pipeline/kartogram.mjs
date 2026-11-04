// Šestiúhelníkový kartogram voleb do Sněmovny 2026: jeden šestiúhelník = jeden obvod (volitelně 50 000 hlasů).
// Stejný princip jako naše kartogramy Rakouska a USA 2024: plocha odpovídá lidem, ne rozloze.
// Vstupy: ../okresy-mapa.json (výstup okresy.mjs) a raw/counties-albers-10m.json (us-atlas 3.0.1, US Census Bureau)
// Postup: 1) počty šestiúhelníků po státech a okresech metodou největších zbytků,
//         2) spojitý kartogram pevninských států (Dougenik a kol. 1985) – plocha státu podle hlasů,
//         3) převod na šestiúhelníky a dorovnání na přesné kvóty, Aljaška a Havaj kolem svých míst,
//         4) okresy uvnitř státu v pořadí Hilbertovy křivky (drží pohromadě a zhruba na svém místě).
// Výstup: ../kartogram-obvody.json. Spuštění: NM=<repo>/node_modules node kartogram.mjs (nejdřív okresy.mjs)
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NM = process.env.NM || path.join(__dirname, '../../../../../../node_modules');
const { geoPath } = await import(pathToFileURL(path.join(NM, 'd3-geo/src/index.js')).href);
const topojson = (await import(pathToFileURL(path.join(NM, 'topojson-client/dist/topojson-client.js')).href)).default;

// Výchozí: jeden šestiúhelník = jeden obvod do Sněmovny (obvody mají zhruba stejný počet obyvatel), vstup obvody.json z okresy.mjs.
// MODE=hlasy: jeden šestiúhelník = 50 000 hlasů po okresech (v článku nepoužito, výstup kartogram.json)
const OBVODY = process.env.MODE !== 'hlasy';
const UNIT = 50000;
const topo = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw', 'counties-albers-10m.json'), 'utf8'));
const mapa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'okresy-mapa.json'), 'utf8'));
const gp = geoPath();

// okresy s hlasy do Sněmovny; Connecticut (barva za celý stát) a Aljaška (preferenční přepočet) jako jeden celek
const feats = topojson.feature(topo, topo.objects.counties).features;
const featById = Object.fromEntries(feats.map((f) => [f.id, f]));
const H = mapa.vrstvy.H;
const jednotky = []; // {key, name, st, d, r, stat, cx, cy}
const celky = {};
mapa.okresy.forEach((o, i) => {
  const v = H[i];
  if (!v || v[0] + v[1] === 0) return;
  const [id, name, st] = o;
  const c = gp.centroid(featById[id]);
  if (v[3]) { // celý stát: hlasy jen jednou, těžiště z okresů
    const u = (celky[st] = celky[st] || { key: st, name: null, st, d: v[0], r: v[1], stat: v[3], sx: 0, sy: 0, n: 0 });
    u.sx += c[0]; u.sy += c[1]; u.n++;
    return;
  }
  jednotky.push({ key: id, name, st, d: v[0], r: v[1], stat: 0, cx: c[0], cy: c[1] });
});
for (const u of Object.values(celky)) jednotky.push({ ...u, cx: u.sx / u.n, cy: u.sy / u.n });
if (OBVODY) {
  jednotky.length = 0;
  for (const [label, st, d, r, c, stat, cx, cy] of JSON.parse(fs.readFileSync(path.join(__dirname, 'obvody.json'), 'utf8'))) {
    jednotky.push({ key: label, name: label, st, d, r, c, stat, cx, cy, k: 1 });
  }
}

// největší zbytky
const rozdel = (polozky, celkem, vaha) => {
  const s = polozky.reduce((a, p) => a + vaha(p), 0);
  const q = polozky.map((p) => (celkem * vaha(p)) / s);
  const k = q.map(Math.floor);
  let zb = celkem - k.reduce((a, b) => a + b, 0);
  q.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).slice(0, zb).forEach(([, i]) => k[i]++);
  return k;
};
const hlasy = (p) => (OBVODY ? 1 : p.d + p.r);
const staty = {};
for (const u of jednotky) (staty[u.st] = staty[u.st] || { st: u.st, units: [], v: 0 }).units.push(u), (staty[u.st].v += hlasy(u));
const seznam = Object.values(staty);
const vsech = seznam.reduce((a, s) => a + s.v, 0);
const N = OBVODY ? vsech : Math.round(vsech / UNIT);
rozdel(seznam, N, (s) => s.v).forEach((k, i) => (seznam[i].k = Math.max(k, 1)));
for (const s of seznam) rozdel(s.units, s.k, hlasy).forEach((k, i) => (s.units[i].k = k));

// těžiště států z tvaru státu (us-atlas states)
const ST = { '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY' };
let plocha = 0;
for (const f of topojson.feature(topo, topo.objects.states).features) {
  const st = ST[f.id]; if (!staty[st]) continue;
  const c = gp.centroid(f); staty[st].cx = c[0]; staty[st].cy = c[1]; staty[st].area = gp.area(f);
  plocha += gp.area(f);
}
// obvody bez okresních dat (bez souboje D × R) dostanou těžiště státu
for (const u of jednotky) if (u.cx == null) { u.cx = staty[u.st].cx; u.cy = staty[u.st].cy; }

// Spojitý kartogram (Dougenik, Chrisman a Niemeyer 1985): hranice pevninských států se plynule deformují,
// až plocha každého státu odpovídá jeho hlasům; sousedství i tvar zůstanou rozpoznatelné.
// Pak se mapa převede na šestiúhelníky a počty polí se dorovnají přesně na kvóty.
const ostrovy = new Set(['AK', 'HI']);
const key = (q, r) => q + ',' + r;
const SOUSEDE = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
// absolutní souřadnice oblouků (sdílené hranice se pohybují společně)
const T = topo.transform;
const arcs = topo.arcs.map((arc) => { let x = 0, y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * T.scale[0] + T.translate[0], y * T.scale[1] + T.translate[1]]; }); });
const geomPev = topo.objects.states.geometries.filter((g) => staty[ST[g.id]] && !ostrovy.has(ST[g.id]));
const topoAbs = { type: 'Topology', arcs, objects: { s: { type: 'GeometryCollection', geometries: geomPev } } };
const arcIdx = new Set();
const walk = (x) => (Array.isArray(x) ? x.forEach(walk) : arcIdx.add(x < 0 ? ~x : x));
geomPev.forEach((g) => walk(g.arcs));
const body = [...arcIdx].flatMap((i) => arcs[i]); // všechny body pevninských hranic (odkazy, pohyb in-place)
const pevS = seznam.filter((s) => !ostrovy.has(s.st));
const V = pevS.reduce((a, s) => a + s.v, 0);
const stavy = () => topojson.feature(topoAbs, topoAbs.objects.s).features.map((f) => ({ st: ST[f.id], f, A: Math.abs(gp.area(f)), c: gp.centroid(f) }));
let A0 = stavy().reduce((a, x) => a + x.A, 0);
for (let it = 0; it < 40; it++) {
  const ss = stavy();
  const total = ss.reduce((a, x) => a + x.A, 0);
  let chyba = 0;
  for (const x of ss) {
    x.D = (A0 * staty[x.st].v) / V;
    x.r = Math.sqrt(x.A / Math.PI);
    x.M = Math.sqrt(x.D / Math.PI) - x.r;
    chyba += Math.abs(x.A - x.D) / Math.max(x.A, x.D);
  }
  chyba /= ss.length;
  const fr = 1 / (1 + chyba);
  if (it % 10 === 0 || it === 39) console.log(`kartogram iterace ${it}: průměrná chyba plochy ${(100 * chyba).toFixed(1)} %`);
  for (const p of body) {
    let dx = 0, dy = 0;
    for (const x of ss) {
      const vx = p[0] - x.c[0], vy = p[1] - x.c[1], d = Math.hypot(vx, vy) || 1e-6;
      const F = d > x.r ? (x.M * x.r) / d : x.M * ((d * d) / (x.r * x.r)) * (4 - (3 * d) / x.r);
      dx += (vx / d) * F * fr; dy += (vy / d) * F * fr;
    }
    p[0] += dx; p[1] += dy;
  }
}
const konec = stavy();
for (const x of konec) { staty[x.st].kf = x.f; staty[x.st].kc = x.c; }

// šestiúhelníková síť se stejnou celkovou plochou
const pev = pevS;
const N48 = pev.reduce((a, s) => a + s.k, 0);
const R = Math.sqrt(A0 / (N48 * 2.598076)), W = Math.sqrt(3) * R, Hh = 1.5 * R;
const xy = (q, r) => [W * (q + r / 2), Hh * r];
const naHex = (x, y) => {
  const rf = y / Hh, qf = x / W - rf / 2;
  let rq = Math.round(qf), rr = Math.round(rf), rs = Math.round(-qf - rf);
  const dq = Math.abs(rq - qf), dr = Math.abs(rr - rf), ds = Math.abs(rs + qf + rf);
  if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
  return [rq, rr];
};
// bod v mnohoúhelníku (sudý-lichý přes všechny prstence)
const ringsOf = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flat();
const uvnitr = (rings, x, y) => { let c = false; for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
for (const s of pev) {
  s.rings = ringsOf(s.kf);
  const pts = s.rings.flat();
  s.bb = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
}
const obsazeno = new Map();
const pole = Object.fromEntries(seznam.map((s) => [s.st, []]));
const allPts = pev.flatMap((s) => [[s.bb[0], s.bb[1]], [s.bb[2], s.bb[3]]]);
const [, rA] = naHex(0, Math.min(...allPts.map((p) => p[1]))), [, rB] = naHex(0, Math.max(...allPts.map((p) => p[1])));
const xMin = Math.min(...allPts.map((p) => p[0])), xMax = Math.max(...allPts.map((p) => p[0]));
for (let r = rA - 1; r <= rB + 1; r++) {
  for (let q = Math.floor(xMin / W - r / 2) - 1; q <= Math.ceil(xMax / W - r / 2) + 1; q++) {
    const [x, y] = xy(q, r);
    for (const s of pev) {
      if (x < s.bb[0] || x > s.bb[2] || y < s.bb[1] || y > s.bb[3]) continue;
      if (uvnitr(s.rings, x, y)) { obsazeno.set(key(q, r), s.st); pole[s.st].push([q, r]); break; }
    }
  }
}
// dorovnání na přesné kvóty: přebytek odevzdá okrajová pole nejdál od těžiště, schodek přibere volná sousední pole nejblíž těžišti
const S = Object.fromEntries(pev.map((s) => [s.st, s]));
const dist = (q, r, s) => { const [x, y] = xy(q, r); return Math.hypot(x - s.kc[0], y - s.kc[1]); };
const okrajove = (st) => pole[st].filter(([q, r]) => SOUSEDE.some(([a, b]) => obsazeno.get(key(q + a, r + b)) !== st));
for (const s of pev) {
  while (pole[s.st].length > s.k) {
    // přednostně pole na vnějším okraji (soused je prázdný), aby uvnitř nevznikaly díry
    const okr = okrajove(s.st), vnejsi = okr.filter(([q, r]) => SOUSEDE.some(([a, b]) => !obsazeno.has(key(q + a, r + b))));
    const kand = (vnejsi.length ? vnejsi : okr).sort((A, B) => dist(B[0], B[1], s) - dist(A[0], A[1], s));
    const [q, r] = kand[0];
    obsazeno.delete(key(q, r)); pole[s.st] = pole[s.st].filter(([x, y]) => !(x === q && y === r));
  }
}
let kroky = 0;
while (pev.some((s) => pole[s.st].length < s.k)) {
  if (++kroky > 100000) throw new Error('kartogram: dorovnání nekonverguje');
  const s = pev.filter((x) => pole[x.st].length < x.k).sort((A, B) => pole[A.st].length / A.k - pole[B.st].length / B.k)[0];
  if (!pole[s.st].length) { // malý stát nedostal při převodu žádné pole: pole nejblíž jeho těžišti (volné, jinak od většího souseda)
    const [hq, hr0] = naHex(s.kc[0], s.kc[1]);
    let cil = null, cd = Infinity;
    for (let q = hq - 3; q <= hq + 3; q++) for (let r = hr0 - 3; r <= hr0 + 3; r++) {
      const t = obsazeno.get(key(q, r)); if (t && pole[t].length < 2) continue;
      const d = dist(q, r, s) + (t ? 0.5 * R : 0); if (d < cd) { cd = d; cil = [q, r, t]; }
    }
    const [q, r, t] = cil;
    if (t) { pole[t] = pole[t].filter(([x, y]) => !(x === q && y === r)); }
    obsazeno.set(key(q, r), s.st); pole[s.st].push([q, r]);
    continue;
  }
  let best = null, bd = Infinity;
  for (const [q, r] of pole[s.st]) for (const [a, b] of SOUSEDE) {
    const kk = key(q + a, r + b); if (obsazeno.has(kk)) continue;
    // díry (volné pole obklopené obsazenými) mají přednost
    const plnych = SOUSEDE.filter(([c, e]) => obsazeno.has(key(q + a + c, r + b + e))).length;
    const d = dist(q + a, r + b, s) - (plnych >= 4 ? 1e4 : 0); if (d < bd) { bd = d; best = [q + a, r + b]; }
  }
  if (!best) { // obklopený: vzít pole od souseda s největším přebytkem vůči kvótě
    let bs = -Infinity;
    for (const [q, r] of pole[s.st]) for (const [a, b] of SOUSEDE) {
      const t = obsazeno.get(key(q + a, r + b)); if (!t || t === s.st || pole[t].length < 2) continue;
      const sc = pole[t].length / S[t].k - dist(q + a, r + b, s) * 1e-4; if (sc > bs) { bs = sc; best = [q + a, r + b, t]; }
    }
    const [q, r, t] = best; pole[t] = pole[t].filter(([x, y]) => !(x === q && y === r)); obsazeno.delete(key(q, r));
    best = [q, r];
  }
  obsazeno.set(key(best[0], best[1]), s.st); pole[s.st].push([best[0], best[1]]);
}
for (const s of seznam) { s.cx = s.kc ? s.kc[0] : s.cx; s.cy = s.kc ? s.kc[1] : s.cy; }
console.log(`kartogram: ${pev.reduce((a, s) => a + pole[s.st].length, 0)} polí pevniny pro ${N48}`);

// ostrovy: kolem těžiště
for (const s of seznam.filter((x) => ostrovy.has(x.st))) {
  const [q0, r0] = naHex(s.cx, s.cy); const fronta = [[q0, r0]], videno = new Set([key(q0, r0)]);
  while (pole[s.st].length < s.k) {
    const [q, r] = fronta.shift();
    if (!obsazeno.has(key(q, r))) { obsazeno.set(key(q, r), s.st); pole[s.st].push([q, r]); }
    for (const [a, b] of SOUSEDE) { const kk = key(q + a, r + b); if (!videno.has(kk)) { videno.add(kk); fronta.push([q + a, r + b]); } }
  }
}
for (const s of seznam) if (pole[s.st].length !== s.k) throw new Error(`kartogram: ${s.st} má ${pole[s.st].length} z ${s.k}`);

// okresy uvnitř státu: okresy i pole státu seřadit po Hilbertově křivce (normalizované do obdélníku státu)
// a přidělovat po sobě jdoucí úseky – okres tak drží pohromadě a zhruba na svém místě
const hilbert = (x, y, n = 1024) => { // x, y v 0..1
  let X = Math.min(n - 1, Math.floor(x * n)), Y = Math.min(n - 1, Math.floor(y * n)), d = 0;
  for (let s2 = n / 2; s2 >= 1; s2 /= 2) {
    const rx = (X & s2) > 0 ? 1 : 0, ry = (Y & s2) > 0 ? 1 : 0;
    d += s2 * s2 * ((3 * rx) ^ ry);
    if (ry === 0) { if (rx === 1) { X = n - 1 - X; Y = n - 1 - Y; } const t = X; X = Y; Y = t; }
  }
  return d;
};
const norm01 = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), sz = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0) || 1;
  return pts.map(([x, y]) => [(x - x0) / sz, (y - y0) / sz]);
};
const hexy = [];
const okresyVen = [];
for (const s of seznam) {
  const units = s.units.filter((x) => x.k > 0);
  const un = norm01(units.map((u) => [u.cx, u.cy]));
  units.forEach((u, i) => (u.h = hilbert(un[i][0], un[i][1])));
  units.sort((x, y) => x.h - y.h);
  const hp = pole[s.st].map(([q, r]) => xy(q, r));
  const hn = norm01(hp);
  const poradi = pole[s.st].map((p, i) => [hilbert(hn[i][0], hn[i][1]), p]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  let j = 0;
  for (const u of units) {
    const ix = okresyVen.push([u.name, u.st, u.d, u.r, u.stat, u.c ?? null]) - 1;
    for (let n = 0; n < u.k; n++) { const [q, r] = poradi[j++]; hexy.push([q, r, ix, s.st]); }
  }
}

// hranice států: hrany šestiúhelníků mezi různými státy
const vrchol = (x, y, i) => { const a = (Math.PI / 180) * (60 * i - 30); return [x + R * Math.cos(a), y + R * Math.sin(a)]; };
// sousedé [1,0]=východ… pořadí hran odpovídá vrcholům (i, i+1) pro úhly -30..30 = východ atd.
const HRANA = { '1,0': [0, 1], '0,1': [1, 2], '-1,1': [2, 3], '-1,0': [3, 4], '0,-1': [4, 5], '1,-1': [5, 0] };
const kdo = new Map(hexy.map(([q, r, , st]) => [key(q, r), st]));
let hr = '';
for (const [q, r, , st] of hexy) {
  const [x, y] = xy(q, r);
  for (const [a, b] of SOUSEDE) {
    const n = kdo.get(key(q + a, r + b));
    if (n === st) continue;
    if (n && st > n) continue; // vnitřní hranu kreslit jednou
    const [i1, i2] = HRANA[a + ',' + b];
    const p1 = vrchol(x, y, i1), p2 = vrchol(x, y, i2);
    hr += `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}L${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
}
// zkratky států do těžiště jejich šestiúhelníků (jen státy s aspoň 12 poli)
const popisky = seznam.filter((s) => s.k >= (OBVODY ? 4 : 12)).map((s) => {
  const [x, y] = pole[s.st].reduce((a, [q, r]) => { const [px, py] = xy(q, r); return [a[0] + px / pole[s.st].length, a[1] + py / pole[s.st].length]; }, [0, 0]);
  return [s.st, +x.toFixed(1), +y.toFixed(1)];
});
const xs = hexy.map(([q, r]) => xy(q, r)[0]), ys = hexy.map(([q, r]) => xy(q, r)[1]);
const box = [Math.min(...xs) - R, Math.min(...ys) - R, Math.max(...xs) + R, Math.max(...ys) + R].map((v) => +v.toFixed(1));
const d = okresyVen.reduce((a, o) => a + o[2], 0), r = okresyVen.reduce((a, o) => a + o[3], 0);
const dHex = hexy.filter(([, , i]) => okresyVen[i][4] !== 2 && okresyVen[i][2] > okresyVen[i][3]).length;
const rHex = hexy.filter(([, , i]) => okresyVen[i][4] !== 2 && okresyVen[i][2] <= okresyVen[i][3]).length;
console.log(`šestiúhelníků ${hexy.length} (1 = ${OBVODY ? 'obvod' : UNIT + ' hlasů'}), R ${R.toFixed(2)} px; v okresech, kde vyhráli demokraté ${dHex}, republikáni ${rHex}`);
console.log(`hlasy D ${d}, R ${r}; okresů v kartogramu ${okresyVen.length}`);
const out = { unit: OBVODY ? 0 : UNIT, R: +R.toFixed(3), box, stav: mapa.stav, okresy: okresyVen, hexy: hexy.map(([q, r, i]) => { const [x, y] = xy(q, r); return [+x.toFixed(1), +y.toFixed(1), i]; }), hranice: hr, popisky };
const f = path.join(__dirname, '..', OBVODY ? 'kartogram-obvody.json' : 'kartogram.json');
fs.writeFileSync(f, JSON.stringify(out));
console.log(`${f} ${(fs.statSync(f).size / 1024).toFixed(0)} kB`);

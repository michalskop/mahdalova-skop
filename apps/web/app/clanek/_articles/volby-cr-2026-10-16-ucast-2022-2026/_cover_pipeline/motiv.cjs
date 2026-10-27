// Motiv coveru: tečková mapa ČR a šipka změny účasti 2022 → 2026 v každém okrese (stejný tvar a barvy jako
// šipky v interaktivní mapě článku). Vyrobí motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg').
// node motiv.cjs   (hodnoty z ../_data_pipeline/vystup.json, tečky mapy z článku predikce senátu)
const fs = require('fs');
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const dots = require(path.join(ZDROJ, 'senat-mapa.json')).dots;
const mesta = require(path.join(ZDROJ, 'obce-mapa.json'));
const okresy = require(path.join(__dirname, '..', '_data_pipeline', 'vystup.json')).okresy;

const UP = '#6ec53f'; // brandForestGreen.4
const DOWN = '#ff1a4a'; // brand.4
const TECKA = '#2f325c'; // brandNavy.8

// Okresy, jejichž sídlo není v obce-mapa.json: přibližná poloha (jen umístění šipky v ilustraci, ne data).
const POLOHA = {
  'Hlavní město Praha': [14.42, 50.08], 'Praha-východ': [14.74, 50.07], 'Praha-západ': [14.22, 49.93],
  'Brno-město': [16.61, 49.2], 'Brno-venkov': [16.36, 49.32], 'Ostrava-město': [18.29, 49.83],
  'Plzeň-město': [13.38, 49.75], 'Plzeň-jih': [13.4, 49.52], 'Plzeň-sever': [13.25, 49.9],
  Prachatice: [14.0, 49.01], Jeseník: [17.2, 50.23], Semily: [15.34, 50.6],
};
const poloha = (n) => POLOHA[n] ?? (({ lon, lat }) => [lon, lat])(mesta.find((m) => m.n === n));

// Stejné plochy mapy jako tools/cover-generator.cjs (FORMATY[].mapa, homepage podle mapaPozice v cover.config.cjs).
const MAPA = {
  homepage: [w(1500), h(1200), [140, 470, 1500, 1170]], og: [w(1200), h(630), [0, 0, 1200, 630]],
  square: [w(1080), h(1080), [20, 470, 1070, 1050]], instagram: [w(1080), h(1350), [20, 560, 1070, 1260]],
  story: [w(1080), h(1920), [0, 860, 1080, 1580]],
};
function w(x) { return x; }
function h(x) { return x; }

const lon = dots.map((d) => d[0]), lat = dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
const kx = Math.cos((49.8 * Math.PI) / 180);

for (const [klic, [W, H, [mx0, my0, mx1, my1]]] of Object.entries(MAPA)) {
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  const t = dots.map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${TECKA}"/>`; }).join('');
  // šipka: 65° od vodorovné, vzhůru doprava = nárůst, dolů doprava = pokles; délka ∝ změna (min. aby byl vidět směr)
  const lw = sc * 0.03, hrot = lw * 2.7, jed = sc * 0.05;
  const s = okresy.map((o) => {
    const [x, y] = P(...poloha(o.okres));
    const L = Math.max(Math.min(Math.abs(o.zmena), 6) * jed, hrot * 2.6);
    const a = (o.zmena > 0 ? -1 : 1) * Math.PI * 0.36, dx = Math.cos(a) * L, dy = Math.sin(a) * L;
    const x2 = x + dx, y2 = y + dy, ang = Math.atan2(dy, dx), c = o.zmena > 0 ? UP : DOWN;
    const p = (u, v) => `${u.toFixed(1)},${v.toFixed(1)}`;
    const hx = (k) => x2 - Math.cos(ang + k) * hrot * 1.45, hy = (k) => y2 - Math.sin(ang + k) * hrot * 1.45;
    return `<g fill="${c}" stroke="${c}"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x2 - Math.cos(ang) * hrot * 0.6).toFixed(1)}" y2="${(y2 - Math.sin(ang) * hrot * 0.6).toFixed(1)}" stroke-width="${lw.toFixed(1)}" stroke-linecap="round"/><polygon stroke="none" points="${p(x2, y2)} ${p(hx(-0.45), hy(-0.45))} ${p(hx(0.45), hy(0.45))}"/></g>`;
  }).join('');
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${t}${s}</svg>`);
}
console.log('motiv hotový,', okresy.length, 'okresů');

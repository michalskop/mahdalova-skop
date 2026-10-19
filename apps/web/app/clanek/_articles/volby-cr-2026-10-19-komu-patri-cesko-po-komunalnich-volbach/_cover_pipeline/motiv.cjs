// Motiv coveru: bublinová mapa obcí přes nenápadný modrý stín republiky (Kateřina 19. 10.: podkres z koleček jako stín).
// Každá obec = kolečko, plocha ∝ počet obyvatel; barva podle toho, kdo má v zastupitelstvu většinu křesel.
// Vyrobí motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg').
// node motiv.cjs   (body.json z body.py; obrys republiky = tečky mapy z článku o predikci senátu)
const fs = require('fs');
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const dots = require(path.join(ZDROJ, 'senat-mapa.json')).dots;
const data = require('./body.json');

const NK = '#8f9dc9'; // brandNavy.4
const STRANY = '#ffcf02'; // brandYellow.6
const STIN = '#383d82'; // brandRoyalBlue.7

// stejné plochy mapy jako tools/cover-generator.cjs (FORMATY[].mapa)
const MAPA = {
  homepage: [1500, 1200, [60, 400, 1480, 1150]], og: [1200, 630, [0, 0, 1200, 630]],
  square: [1080, 1080, [20, 470, 1070, 1050]], instagram: [1080, 1350, [20, 560, 1070, 1260]],
  story: [1080, 1920, [0, 860, 1080, 1580]],
};

const lon = dots.map((d) => d[0]), lat = dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
const kx = Math.cos((49.8 * Math.PI) / 180);
const PRAHA = Math.sqrt(Math.max(...data.map((b) => b.p)));
// plocha kolečka úměrná počtu obyvatel; Praha ≈ 11× poloměr tečky mapy, nejmenší obce aspoň drobná tečka
const body = data
  .map((b) => ({ ...b, k: Math.max(0.32, (Math.sqrt(b.p) / PRAHA) * 11) }))
  .sort((a, b) => a.k - b.k); // drobné obce dospod, města navrch

for (const [klic, [W, H, [mx0, my0, mx1, my1]]] of Object.entries(MAPA)) {
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  const c = (x, y, rr, fill, op) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;
  // stín: tečky mapy zvětšené tak, aby splynuly, a rozmazané
  const stin = dots.map(([lo, la]) => c(...P(lo, la), r * 2.6, STIN)).join('');
  const b = body.map((o) => c(...P(o.lon, o.lat), r * o.k, o.nk ? NK : STRANY, o.nk ? 0.9 : 0.92)).join('');
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><filter id="stin-${klic}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(r * 2.2).toFixed(1)}"/></filter></defs>` +
    `<g filter="url(#stin-${klic})" opacity="0.55">${stin}</g>${b}</svg>`);
}
console.log('motiv hotový,', body.length, 'obcí');

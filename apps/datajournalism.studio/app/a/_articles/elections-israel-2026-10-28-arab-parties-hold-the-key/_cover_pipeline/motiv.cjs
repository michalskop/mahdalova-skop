// Motiv coveru: bublinová mapa izraelských obcí (sourozenec coveru „Proč vyhrál Lula“).
// Kolečko = obec v souřadnicích CBS (ITM), plocha ∝ počet voličů 2026; zeleně arabské obce a beduínské kmeny
// (brandForestGreen.3), ostatní tlumeně (brandNavy.4). Data: _data_pipeline/mapa_obci.py → obce-mapa.json
// (jen území uvnitř zelené linie, bez Západního břehu a Golan – viz mapa_obci.py).
// node motiv.cjs → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

// jižně od ITM sever 520 000 (Dimona, Jerucham) leží jen pár obcí s Ejlatem na samém jihu; mapa by byla úzký pruh,
// proto ji ořezáváme – beduínské obce kolem Beerševy (sever 550–590 tis.) zůstávají
const JIH = 520000;
const OBCE = JSON.parse(fs.readFileSync(path.join(__dirname, 'obce-mapa.json'), 'utf8')).filter((o) => o[1] >= JIH);
const ARAB = '#8dd265', OSTATNI = '#8f9dc9'; // brandForestGreen.3 (Ra'am zelená, stejně jako arabské strany v predikci), brandNavy.4
// box mapy [x0, y0, x1, y1] a poloměr největšího kolečka (Jeruzalém) pro každý formát
const FORMATY = {
  homepage: [1500, 1200, [620, 150, 1490, 1199], 70, 545000], // homepage: jih oříznutý pod Beerševou, aby mapa mohla být větší
  og: [1200, 630, [700, 30, 1170, 610], 30],
  square: [1080, 1080, [600, 70, 1060, 1050], 40],
  instagram: [1080, 1350, [600, 120, 1060, 1250], 42],
  story: [1080, 1920, [240, 880, 840, 1570], 38],
};

const VSE = OBCE;
const xs = OBCE.map((o) => o[0]), ys = OBCE.map((o) => o[1]);
const [X0, X1, Y0, Y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const maxV = Math.max(...OBCE.map((o) => o[2]));
// nejdřív velké, pak malé (malé nezmizí pod velkými), arabské obce navrch
const poradi = [...OBCE].sort((a, b) => (a[3] === b[3] ? b[2] - a[2] : a[3] === 'A' ? 1 : -1));

for (const [klic, [W, H, [bx0, by0, bx1, by1], rMax, jih]] of Object.entries(FORMATY)) {
  const obce = jih ? VSE.filter((o) => o[1] >= jih) : VSE;
  const xs = obce.map((o) => o[0]), ys = obce.map((o) => o[1]);
  const [X0, X1, Y0, Y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sc = Math.min((bx1 - bx0) / (X1 - X0), (by1 - by0) / (Y1 - Y0));
  const ox = bx0 + (bx1 - bx0 - (X1 - X0) * sc) / 2, oy = by0 + (by1 - by0 - (Y1 - Y0) * sc) / 2;
  const kolecka = poradi.filter((o) => !jih || o[1] >= jih).map(([x, y, v, k]) => {
    const r = Math.max(rMax * 0.07, Math.sqrt(v / maxV) * rMax);
    return `<circle cx="${(ox + (x - X0) * sc).toFixed(1)}" cy="${(oy + (Y1 - y) * sc).toFixed(1)}" r="${r.toFixed(2)}" fill="${k === 'A' ? ARAB : OSTATNI}" opacity="${k === 'A' ? 0.92 : 0.5}"/>`;
  }).join('');
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${kolecka}</svg>`);
}
console.log('motiv hotový,', OBCE.length, 'obcí');

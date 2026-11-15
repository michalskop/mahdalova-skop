// Motiv coveru kapitoly Zdraví a délka života speciálu „Jací jsme byli, jací jsme – 1989 × 2026“:
// velké srdce složené z teček, 1 tečka = 1 000 lidí, kteří za rok zemřeli na nemoci oběhové soustavy (srdce a cév).
// Celé srdce = rok 1989 (72 teček), karmínově odspodu = 2024 (43 teček), prázdné kroužky nahoře = 29 tisíc úmrtí,
// která ubyla (srdce „se vyprázdnilo“), s karmínovou konturou (modrá byla vidět hůř – Kateřina 15. 11.).
// Data: _data_pipeline/cisla.json → obeh (ČSÚ Tab. 01.01: 1989 71 842, 2024 42 611; vystup.txt „oběhová: úbytek
// 1989→2024 o 29231 úmrtí“), v článku první odstavec.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const obeh = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json')).obeh;
const TEHDY = Math.round(obeh['1989'] / 1000), DNES = Math.round(obeh['2024'] / 1000);

const BARVA_TEHDY = '#6267a3', BARVA_DNES = '#de1743', ZARE = '#ff8099';
const f = (v) => v.toFixed(2);

// srdce: (x² + y² − 1)³ − x² y³ ≤ 0, x ∈ ⟨−1,14; 1,14⟩, y ∈ ⟨−1; 1,25⟩ (y nahoru)
const uvnitr = (x, y) => (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0;
// šestiúhelníková mřížka s roztečí s, souměrná podle svislé osy
function mrizka(s) {
  const h = (s * Math.sqrt(3)) / 2, body = [];
  for (let j = -40; j <= 40; j++) {
    const y = -1 + 0.04 + j * h;
    if (y < -1.05 || y > 1.3) continue;
    const off = (j % 2 === 0) ? 0 : s / 2;
    for (let i = -40; i <= 40; i++) {
      const x = i * s + off;
      if (uvnitr(x / 0.97, y / 0.97)) body.push([x, y]);
    }
  }
  return body;
}
// největší rozteč, při které se vejde aspoň TEHDY teček; přebytek uberou body nejdál od středu po dvojicích
let lo = 0.05, hi = 0.6;
for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (mrizka(mid).length >= TEHDY) lo = mid; else hi = mid; }
const S = lo;
let body = mrizka(S);
const stred = [0, 0.1];
body.sort((a, b) => Math.hypot(a[0] - stred[0], a[1] - stred[1]) - Math.hypot(b[0] - stred[0], b[1] - stred[1]));
body = body.slice(0, TEHDY);
// odspodu nahoru, v řádku od středu ven: prvních DNES teček = karmínová „hladina“
body.sort((a, b) => a[1] - b[1] || Math.abs(a[0]) - Math.abs(b[0]));
if (body.length !== TEHDY) throw new Error(`srdce: ${body.length} teček místo ${TEHDY}`);

const xs = body.map((p) => p[0]), ys = body.map((p) => p[1]);
const [bx0, bx1, by0, by1] = [Math.min(...xs) - S / 2, Math.max(...xs) + S / 2, Math.min(...ys) - S / 2, Math.max(...ys) + S / 2];
const r = S * 0.37;
function srdce() {
  // souřadnice v jednotkách srdce, osa y dolů
  let s = '';
  body.forEach(([x, y], i) => {
    const X = x - bx0, Y = by1 - y;
    s += i < DNES
      ? `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r)}" fill="${BARVA_DNES}" stroke="${ZARE}" stroke-width="${f(S * 0.05)}"/>`
      : `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r * 0.85)}" fill="none" stroke="${ZARE}" stroke-width="${f(S * 0.09)}"/>`;
  });
  return s;
}
const W0 = bx1 - bx0, H0 = by1 - by0;

// [šířka, výška formátu, plocha srdce x0, y0, x1, y1]
const POLOHA = {
  homepage: [1500, 1200, [730, 520, 1450, 1125]],
  og: [1200, 630, [610, 250, 905, 590]],
  square: [1080, 1080, [500, 540, 1050, 1050]],
  instagram: [1080, 1350, [200, 590, 920, 1150]],
  story: [1080, 1920, [140, 790, 940, 1440]],
};

for (const [k, [W, H, [x0, y0, x1, y1]]] of Object.entries(POLOHA)) {
  const sc = Math.min((x1 - x0) / W0, (y1 - y0) / H0);
  const tx = x0 + (x1 - x0 - W0 * sc) / 2, ty = y0 + (y1 - y0 - H0 * sc) / 2;
  const cx = tx + (W0 * sc) / 2, cy = ty + H0 * sc * 0.62;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity="0.32"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(W0 * sc * 0.62)}" ry="${f(H0 * sc * 0.5)}" fill="url(#zare)"/><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc)})">${srdce()}</g></svg>`);
}
console.log(`motiv hotový: srdce ${TEHDY} teček (1989), karmínových ${DNES} (2024), prázdných ${TEHDY - DNES}; rozteč ${S.toFixed(3)}`);

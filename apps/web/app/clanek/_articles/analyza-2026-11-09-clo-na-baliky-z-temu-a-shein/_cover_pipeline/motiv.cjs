// Cover key visual: 136 parcels = 13.6 million items in consignments up to 150 EUR in June 2026 (1 parcel = 100 000
// items). The 26 bright parcels are what was left in September 2026 (2.6 million), the other 110 are faint outlines.
// Numbers: ČTK 26. 10. 2026, data of Celní správa ČR (../_data_pipeline/vystup.txt).
// node motiv.cjs → motiv-<format>.svg for cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const ZARI = '#ff1a4a'; // brand.4 (same as cover.config.cjs legend)
const ZMIZELO = '#6267a3'; // same as the 'before duty' bars in chart 1
const CERVEN = 136, ZBYLO = 26;

// [width, height, box [x0, y0, x1, y1], columns]
const FORMATY = {
  homepage: [1500, 1200, [820, 440, 1430, 1100], 12],
  og: [1200, 630, [605, 290, 905, 600], 12],
  square: [1080, 1080, [430, 470, 1010, 1010], 12],
  instagram: [1080, 1350, [430, 650, 1010, 1250], 11],
  story: [1080, 1920, [100, 880, 980, 1450], 14],
};

const f = (v) => v.toFixed(1);
function balik(x, y, a, barva, plny) {
  // parcel seen from the front: box, lid line and a vertical tape strip
  const r = a * 0.12;
  if (plny) {
    return `<rect x="${f(x)}" y="${f(y)}" width="${f(a)}" height="${f(a)}" rx="${f(r)}" fill="${barva}"/>` +
      `<rect x="${f(x + a * 0.42)}" y="${f(y)}" width="${f(a * 0.16)}" height="${f(a)}" fill="#f8f6f0" opacity="0.85"/>` +
      `<line x1="${f(x)}" y1="${f(y + a * 0.3)}" x2="${f(x + a)}" y2="${f(y + a * 0.3)}" stroke="#101432" stroke-opacity="0.35" stroke-width="${f(a * 0.05)}"/>`;
  }
  return `<rect x="${f(x + a * 0.03)}" y="${f(y + a * 0.03)}" width="${f(a * 0.94)}" height="${f(a * 0.94)}" rx="${f(r)}" fill="none" stroke="${barva}" stroke-width="${f(a * 0.06)}"/>` +
    `<line x1="${f(x + a * 0.5)}" y1="${f(y + a * 0.03)}" x2="${f(x + a * 0.5)}" y2="${f(y + a * 0.97)}" stroke="${barva}" stroke-width="${f(a * 0.06)}"/>`;
}
for (const [klic, [W, H, [x0, y0, x1, y1], sl]] of Object.entries(FORMATY)) {
  const radku = Math.ceil(CERVEN / sl);
  const krok = Math.min((x1 - x0) / sl, (y1 - y0) / radku);
  const a = krok * 0.8;
  const ox = x0 + (x1 - x0 - sl * krok) / 2, dno = y1;
  let s = '';
  for (let k = 0; k < CERVEN; k++) {
    // fill from the bottom-left row by row; the first ZBYLO parcels stay (September)
    const x = ox + (k % sl) * krok + (krok - a) / 2;
    const y = dno - (Math.floor(k / sl) + 1) * krok + (krok - a) / 2;
    s += k < ZBYLO ? balik(x, y, a, ZARI, true) : balik(x, y, a, ZMIZELO, false);
  }
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`);
}
console.log('motiv hotový:', CERVEN, 'balíků v červnu,', ZBYLO, 'v září');

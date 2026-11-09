// Cover key visual (Xenia's brief, 9. 11. 2026): three dot columns CZ / SK / HU, 1 dot = 1 % of mothers of children
// under three. Solid dots at the bottom = actually working, hatched dots on top = on parental leave but counted
// as employed. Numbers from OECD Family Database LMF1.2.F, 2021 (../_data_pipeline/vystup.txt), rounded.
// node motiv.cjs → motiv-<format>.svg for cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const PRACUJE = '#ff1a4a'; // brand.4 (same as cover.config.cjs legend)
const VEDENE = '#8f9dc9'; // brandNavy.4
const TEXT = '#f8f6f0';
const ZEME = [
  { nazev: 'Česko', prac: 11, rod: 0 },
  { nazev: 'Slovensko', prac: 9, rod: 44 },
  { nazev: 'Maďarsko', prac: 16, rod: 53 },
];
const SLOUPEC = 5; // dots per row
const RADKU = Math.ceil(Math.max(...ZEME.map((z) => z.prac + z.rod)) / SLOUPEC);

// [width, height, box [x0, y0, x1, y1] for columns incl. labels, label font size]
const FORMATY = {
  homepage: [1500, 1200, [800, 330, 1430, 1110], 34],
  og: [1200, 630, [590, 285, 895, 600], 19],
  square: [1080, 1080, [400, 470, 1010, 1010], 30],
  instagram: [1080, 1350, [430, 640, 1010, 1250], 30],
  story: [1080, 1920, [120, 900, 980, 1440], 36],
};

const f = (v) => v.toFixed(1);
for (const [klic, [W, H, [x0, y0, x1, y1], fs0]] of Object.entries(FORMATY)) {
  const popisek = fs0 * 2.7; // two label lines under each column
  const mezeraSloupcu = 1.8; // gap between columns in dot pitches
  const krok = Math.min((x1 - x0) / (ZEME.length * SLOUPEC + (ZEME.length - 1) * mezeraSloupcu), (y1 - y0 - popisek) / RADKU);
  const r = krok * 0.4;
  const sirka = ZEME.length * SLOUPEC * krok + (ZEME.length - 1) * mezeraSloupcu * krok;
  const ox = x0 + (x1 - x0 - sirka) / 2;
  const dno = y0 + RADKU * krok + (y1 - y0 - popisek - RADKU * krok); // bottom of dot area
  let s = `<defs><pattern id="sraf-${klic}" patternUnits="userSpaceOnUse" width="${f(r * 0.5)}" height="${f(r * 0.5)}" patternTransform="rotate(45)">` +
    `<rect width="${f(r * 0.5)}" height="${f(r * 0.5)}" fill="#101432"/><line x1="0" y1="0" x2="0" y2="${f(r * 0.5)}" stroke="${VEDENE}" stroke-width="${f(r * 0.2)}"/></pattern></defs>`;
  ZEME.forEach((z, i) => {
    const cx0 = ox + i * (SLOUPEC + mezeraSloupcu) * krok;
    for (let k = 0; k < z.prac + z.rod; k++) {
      const x = cx0 + (k % SLOUPEC) * krok + krok / 2;
      const y = dno - Math.floor(k / SLOUPEC) * krok - krok / 2;
      s += k < z.prac
        ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${PRACUJE}"/>`
        : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#sraf-${klic})" stroke="${VEDENE}" stroke-width="${f(r * 0.22)}"/>`;
    }
    const lx = cx0 + (SLOUPEC * krok) / 2;
    s += `<text x="${f(lx)}" y="${f(dno + fs0 * 1.15)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${fs0}" fill="${TEXT}">${z.nazev}</text>`;
    s += `<text x="${f(lx)}" y="${f(dno + fs0 * 2.35)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${fs0}" fill="${PRACUJE}">${z.prac} %</text>`;
  });
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`);
}
console.log('motiv hotový:', ZEME.map((z) => `${z.nazev} ${z.prac}+${z.rod}`).join(', '));

// Motiv coveru: tečkové řady jako v grafu článku – 27 teček = 27 nově zvolených, barva = odpověď v Volební kalkulačce.
// node motiv.cjs  (data ../tecky.json z _data_pipeline/kalkulacka_index.py) -> motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'tecky.json'));
// na tmavém pozadí světlejší odstíny týchž škál: pro brandTeal.4, proti brandOrange.6, nevím béžová, nevyplnil obrys
const BARVA = { p: '#33b9d9', v: '#bcb6a4', n: '#f76800', x: '#3d4175' };  // x = kalkulačku nevyplnil/a (na coveru plná tlumená tečka, ať sedí s legendou)
const RADY = [[2, 'obecní byty'], [16, 'Istanbulská úmluva'], [23, 'manželství pro všechny'], [6, 'vyšší daně pro bohaté'], [9, 'zrušit poplatky ČT a ČRo']];
const PORADI = ['p', 'v', 'n', 'x'];
// plochy motivu: stejné jako FORMATY[].mapa v tools/cover-generator.cjs, dole místo pro logo a legendu
const PLOCHA = {
  homepage: [1500, 1200, [180, 520, 1320, 930]], og: [1200, 630, [60, 70, 1140, 600]],
  square: [1080, 1080, [70, 470, 1010, 870]], instagram: [1080, 1350, [70, 600, 1010, 1090]], story: [1080, 1920, [80, 900, 1000, 1400]],
};
for (const [klic, [W, H, [x0, y0, x1, y1]]] of Object.entries(PLOCHA)) {
  const radek = (y1 - y0) / RADY.length, krok = (x1 - x0) / 27, r = Math.min(krok * 0.4, radek * 0.22);
  const fsz = Math.max(14, radek * 0.2);
  let out = '';
  RADY.forEach(([q, nazev], i) => {
    const kody = PORADI.flatMap((k) => data.senatori.filter((s) => s.odpovedi[String(q)] === k).map(() => k));
    const cy = y0 + radek * (i + 0.62);
    out += `<text x="${x0 + krok / 2 - r}" y="${(cy - r - fsz * 0.45).toFixed(1)}" font-family="IBM Plex Sans, Arial, sans-serif" font-size="${fsz.toFixed(1)}" font-weight="600" fill="#d2d8e9">${nazev}</text>`;
    kody.forEach((k, j) => {
      const cx = x0 + krok * (j + 0.5);
      out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${BARVA[k]}"/>`;
    });
  });
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`);
}
console.log('motiv hotový');

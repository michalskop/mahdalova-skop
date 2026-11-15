// Motiv coveru kapitoly Duševní zdraví speciálu „Jací jsme byli, jací jsme – 1989 × 2026“:
// tečkové sloupce spotřeby antidepresiv po pěti letech 1989–2024, 1 tečka = 1 denní dávka (DDD) na 1 000 obyvatel
// a den, čtyři tečky v řádku. Sloupec 2024 karmínově (dnes), starší roky v barvě „tehdy“. Schody ukazují růst
// z 3 na 79 dávek (25krát). Žádné pilulky ani jiné předměty – u tématu se sebevraždami jen abstraktní tečky
// (COVER-VIZUALNI-IDENTITA.md, kap. 6).
// Data: _data_pipeline/cisla.json → antidepresiva (OECD, N06A, DDD na 1 000 obyvatel a den); vystup.txt „N06A 1989 3.1 …
// 2024 78.8 | násobek 1989→2024 25.4“, v článku první odstavec.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const ad = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json')).antidepresiva;
const ROKY = [1989, 1994, 1999, 2004, 2009, 2014, 2019, 2024];
const SLOUPCE = ROKY.map((r) => ({ rok: r, n: Math.round(ad[String(r)]) }));

const TEHDY = '#6267a3', DNES = '#de1743', ZARE = '#ff8099', TEXT = '#d2d8e9';
const f = (v) => v.toFixed(2);
const RAD = 4, MEZ = 1.3, FS = 1.6; // teček v řádku, mezera mezi sloupci, popisek roku (v roztečích)
const MAXR = Math.ceil(Math.max(...SLOUPCE.map((s) => s.n)) / RAD);
const W0 = ROKY.length * (RAD + MEZ) - MEZ, H0 = MAXR + FS * 1.7;

function sloupce() {
  let s = '';
  SLOUPCE.forEach(({ rok, n }, c) => {
    const dnes = rok === 2024, x0 = c * (RAD + MEZ);
    if (dnes) s += `<ellipse cx="${f(x0 + RAD / 2)}" cy="${f(MAXR - Math.ceil(n / RAD) / 2)}" rx="${f(RAD * 1.5)}" ry="${f(MAXR * 0.7)}" fill="url(#zare)"/>`;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i % RAD) + 0.5, y = MAXR - Math.floor(i / RAD) - 0.5;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="0.38" fill="${dnes ? DNES : TEHDY}"${dnes ? ` stroke="${ZARE}" stroke-width="0.06"` : ''}/>`;
    }
    s += `<text x="${f(x0 + RAD / 2)}" y="${f(MAXR + FS * 1.25)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="${dnes ? 700 : 600}" font-size="${FS}" fill="${dnes ? ZARE : TEXT}">${rok}</text>`;
  });
  return s;
}

// [šířka, výška formátu, plocha grafu x0, y0, x1, y1] – sloupce rostou doprava, text sedí v prázdném levém horním rohu
const POLOHA = {
  homepage: [1500, 1200, [640, 330, 1450, 1080]],
  og: [1200, 630, [330, 150, 885, 590]],
  square: [1080, 1080, [70, 380, 1030, 845]],
  instagram: [1080, 1350, [70, 520, 1030, 1070]],
  story: [1080, 1920, [80, 820, 1000, 1400]],
};

for (const [k, [W, H, [x0, y0, x1, y1]]] of Object.entries(POLOHA)) {
  const sc = Math.min((x1 - x0) / W0, (y1 - y0) / H0);
  const tx = x0 + (x1 - x0 - W0 * sc) / 2, ty = y1 - H0 * sc; // graf stojí na spodní hraně plochy
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity="0.35"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc)})">${sloupce()}</g></svg>`);
}
console.log('motiv hotový:', SLOUPCE.map((s) => `${s.rok} ${s.n}`).join(', '), `| násobek ${(ad['2024'] / ad['1989']).toFixed(1)}`);

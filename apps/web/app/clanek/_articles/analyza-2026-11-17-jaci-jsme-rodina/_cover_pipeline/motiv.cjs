// Motiv coveru kapitoly Rodina speciálu „Jací jsme byli, jací jsme – 1989 × 2026“:
// seřazená tečková mřížka, 1 tečka = 1 000 živě narozených dětí za rok. Mřížka má tolik pozic, kolik dětí se narodilo
// v roce 1989 (128). Plní se po řádcích odspodu zleva: karmínové tečky = dnes (2025, 78), prázdná kolečka s karmínovou
// konturou = děti, které ubyly proti roku 1989 (50). Přerušovaná čára = dno 90. let (1999, 89 teček), dnešní blok
// končí pod ní. Stejný jazyk jako srdce u kapitoly Zdraví (plné = dnes, prázdné = ubylo); slunečnice Kateřina
// zamítla (15. 11. 2026: neukazuje dost, chce motiv seřazený, aby bylo vidět, že dětí je opravdu málo).
// Data: _data_pipeline/cisla.json → narozeni (ČSÚ Tab. 01.01: 1989 128 356, 1999 89 471, 2025 77 636);
// vystup.txt „narození 2025 = 77636; 2025 je minimum celé řady 1989–2025: True“, v článku první odstavec.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const narozeni = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json')).narozeni;
const TEHDY = Math.round(narozeni['1989'] / 1000); // 128 pozic
const DNO = Math.round(narozeni['1999'] / 1000); // 89, dno 90. let
const DNES = Math.round(narozeni['2025'] / 1000); // 78
if (!(DNES < DNO && DNO < TEHDY)) throw new Error('čekané pořadí 2025 < 1999 < 1989 neplatí');

const BARVA_DNES = '#de1743', ZARE = '#ff8099', TLUMENY = '#d2d8e9';
const f = (v) => v.toFixed(2);

// mřížka v jednotkách rozteče (1 = vzdálenost středů), osa y dolů; i-tá tečka odspodu zleva
function mriz(sl, popisek = 'vpravo') {
  const radky = Math.ceil(TEHDY / sl);
  const bod = (i) => [i % sl + 0.5, radky - 1 - Math.floor(i / sl) + 0.5];
  const r = 0.37;
  let s = '';
  // měkká záře za dnešním blokem
  const hDnes = Math.ceil(DNES / sl);
  s += `<ellipse cx="${f(sl / 2)}" cy="${f(radky - hDnes / 2)}" rx="${f(sl * 0.62)}" ry="${f(hDnes * 0.75)}" fill="url(#zare)"/>`;
  for (let i = 0; i < TEHDY; i++) {
    const [x, y] = bod(i);
    s += i < DNES
      ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${BARVA_DNES}" stroke="${ZARE}" stroke-width="0.05"/>`
      : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.85)}" fill="none" stroke="${ZARE}" stroke-width="0.09"/>`;
  }
  // přerušovaná schodová čára nad DNO tečkami: nad úplnými řádky a nad zbytkem posledního řádku
  const plne = Math.floor(DNO / sl), zbytek = DNO % sl;
  const yA = radky - plne, yB = radky - plne - 1; // horní hrana úplných řádků / částečného řádku
  const pres = 0.35;
  const d = zbytek
    ? `M ${f(-pres)} ${f(yB)} H ${f(zbytek)} V ${f(yA)} H ${f(sl + pres)}`
    : `M ${f(-pres)} ${f(yA)} H ${f(sl + pres)}`;
  s += `<path d="${d}" fill="none" stroke="${TLUMENY}" stroke-width="0.08" stroke-dasharray="0.28 0.2" stroke-linecap="round"/>`;
  // popisek čáry vpravo od mřížky, nebo vlevo (OG: vpravo by vyšel mimo střední čtverec)
  const FS = 0.62, sirka = FS * 3.3;
  let w = sl + pres + 0.25 + sirka, x0 = 0;
  const tx = popisek === 'vlevo' ? -pres - 0.25 : sl + pres + 0.25, anchor = popisek === 'vlevo' ? 'end' : 'start';
  if (popisek === 'vlevo') x0 = -(pres + 0.25 + sirka);
  s += `<text x="${f(tx)}" y="${f(yA - 0.3)}" text-anchor="${anchor}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${FS}" fill="${TLUMENY}">dno</text>`;
  s += `<text x="${f(tx)}" y="${f(yA + FS * 0.95)}" text-anchor="${anchor}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="500" font-size="${FS}" fill="${TLUMENY}">90. let</text>`;
  return { w, h: radky, x0, svg: s };
}

// [šířka, výška, sloupců, plocha motivu x0, y0, x1, y1, svislé zarovnání: 0 nahoru, 0.5 střed, 1 dolů, popisek čáry]
const POLOHA = {
  homepage: [1500, 1200, 10, [860, 300, 1450, 1110], 0.5, 'vpravo'],
  og: [1200, 630, 10, [500, 205, 875, 600], 0.5, 'vlevo'],
  square: [1080, 1080, 16, [70, 560, 1040, 890], 0.5, 'vpravo'],
  instagram: [1080, 1350, 16, [70, 580, 1040, 1080], 0.5, 'vpravo'],
  story: [1080, 1920, 12, [70, 770, 1040, 1395], 0.5, 'vpravo'],
};

for (const [k, [W, H, sl, [x0, y0, x1, y1], zar, popisek]] of Object.entries(POLOHA)) {
  const m = mriz(sl, popisek);
  const sc = Math.min((x1 - x0) / m.w, (y1 - y0) / m.h);
  const tx = x0 + (x1 - x0 - m.w * sc) / 2, ty = y0 + (y1 - y0 - m.h * sc) * zar;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity="0.28"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs><g transform="translate(${f(tx - m.x0 * sc)} ${f(ty)}) scale(${f(sc)})">${m.svg}</g></svg>`);
}
console.log(`motiv hotový: ${TEHDY} pozic (1989), plných ${DNES} (2025), prázdných ${TEHDY - DNES}, dno 90. let ${DNO}`);

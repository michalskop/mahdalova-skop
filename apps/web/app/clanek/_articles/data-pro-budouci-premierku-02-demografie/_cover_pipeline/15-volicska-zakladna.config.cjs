// Sada coverů článku speciálu „Kdo bude volit příští Sněmovnu“ (_content/01-demografie/articles/15-volicska-zakladna.mdx)
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// 26. 10. 2026 (Kateřina): článek spadá do rubriky Volby i do speciálu Data pro budoucí premiérku, dosud měl jen
// poutač speciálu. Motiv: dvě mřížky 10 × 10 voličů, 1 postava = 1 % voličů; karmínově voliči starší 50 let –
// 44 % ve volbách 2017, 53 % v roce 2029 (projekce ČSÚ, čísla z textu článku).
const path = require('path');
const { vrstva, mrizka } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const KARMIN = '#de1743'; // brand.6 – voliči 50+
const RING = '#8f9dc9'; // brandNavy.4 – mladší
const KREM = '#f8f6f0';
const NAVY = '#101432';
const ROKY = [['2017', 44], ['2029', 53]];

// [x0, y0, krok, mezera mezi mřížkami] – OG vpravo mimo text (široké rozvržení)
const PLOCHA = {
  homepage: [600, 600, 36, 70],
  square: [390, 640, 28, 50], // vpravo od legendy, logo vlevo pod ní
  instagram: [110, 760, 40, 60],
  story: [90, 1000, 42, 60],
  og: [900, 120, 14, 22],
};

function mrizky(k) {
  const [x0, y0, krok, mezera] = PLOCHA[k];
  const svisle = k === 'og'; // OG: mřížky pod sebou vpravo od textu
  const fs = Math.max(14, krok * 0.85);
  return ROKY.map(([rok, pct], j) => {
    const x = svisle ? x0 : x0 + j * (10 * krok + mezera);
    const y = svisle ? y0 + j * (10 * krok + mezera + fs * 1.6) : y0;
    const popis = `<text x="${x}" y="${(y - fs * 0.6).toFixed(1)}" font-family="IBM Plex Sans, Arial, sans-serif" font-size="${fs.toFixed(1)}" font-weight="600" fill="${KREM}" stroke="${NAVY}" stroke-width="${(fs * 0.25).toFixed(1)}" paint-order="stroke">${rok}: ${pct} % nad 50 let</text>`;
    return popis + mrizka({ x: x + krok / 2, y: y + krok / 2, sloupcu: 10, n: 100, krok, styl: (i) => (i < pct ? { ikona: 'osoba', fill: KARMIN } : { ikona: 'osoba', ring: RING }) });
  }).join('');
}

module.exports = {
  vystup: path.join(__dirname, '..', 'images', 'cover-15-volicska-zakladna'),
  kicker: { cervene: 'Volby', dal: 'Data pro budoucí premiérku' },
  titulek: 'Kdo bude volit<br>příští Sněmovnu',
  pod: 'V roce 2029 bude většina voličů<br>starší padesáti let',
  legenda: [[KARMIN, 'voliči nad 50 let'], [`${RING};opacity:.45`, 'mladší'], ['transparent', '1 postava = 1 %']],
  legendaPodTextem: true,
  logo: 'vlevo',
  og: 'siroky',
  // brand.9 / brandNavy.8 záře
  barvy: { glowA: '#8b0e2b', glowB: '#272a59', kick: '#ffcec6', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, svg: vrstva((k) => mrizky(k)) },
};

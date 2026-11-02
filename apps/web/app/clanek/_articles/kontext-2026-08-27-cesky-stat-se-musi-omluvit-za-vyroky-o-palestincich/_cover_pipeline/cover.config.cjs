// Sada pěti coverů (27. 10. 2026). Původní cover byl jen fotka s logem bez textu; fotka zůstává
// (trosky v Gaze pohledem přes díru ve zdi), doplněn štítek, titulek článku a podtitulek z perexu.
// Zdroj: images/gaza-nenavist-soudy-datatimes.jpg (1200 × 960, má dole zapečené logo DataTimes.cz,
// čistší verze se nenašla) – bere se jen pás nad logem (y ≤ 770). Fotka nahoře, text pod ní na navy.
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
const path = require('path');
const vrstva = require('./foto.cjs');

const IMG = path.join(__dirname, '..', 'images');
const FOTO = path.join(IMG, 'gaza-nenavist-soudy-datatimes.jpg');
// fotka v pásu [x, y, w, h], spodní okraj (a u story i horní) přechází do navy
const pas = (H, [, y, , h], { shora = false } = {}) => [
  { smer: 'v', body: [[(y + h - 220) / H, 0], [(y + h - 20) / H, 1]] },
  ...(shora ? [{ smer: 'v', body: [[y / H, 1], [(y + 160) / H, 0]] }] : []),
];
const L = {
  homepage: { W: 1500, H: 1200, oblast: [0, 0, 1500, 700], vyrez: [0, 120, 1200] },
  square: { W: 1080, H: 1080, oblast: [0, 0, 1080, 560], vyrez: [60, 140, 1080] },
  instagram: { W: 1080, H: 1350, oblast: [0, 0, 1080, 770], vyrez: [80, 0, 1080] },
  story: { W: 1080, H: 1920, oblast: [0, 230, 1080, 960], vyrez: [230, 0, 866], shora: true },
};
const svg = (k) => {
  const { W, H, oblast, vyrez, shora } = L[k];
  return vrstva({ W, H, src: FOTO, rozmer: [1200, 960], vyrez, oblast, prechody: pas(H, oblast, { shora }) });
};

module.exports = {
  vystup: IMG,
  kicker: { cervene: 'Kontext', dal: 'Rozsudek' },
  titulek: 'Soud nařídil státu omluvu<br>za&nbsp;výroky ministra<br>o&nbsp;Palestincích',
  pod: 'Výrok o&nbsp;„genetické výbavě“ Palestinců byl protiprávní',
  format: {
    homepage: { box: [180, 555, 1320, 1080], t: 84, sub: 38 },
    square: { box: [70, 460, 1010, 1010], t: 70, sub: 30 },
    instagram: { box: [70, 700, 1010, 1240], t: 68, sub: 32 },
    story: { box: [80, 1110, 1000, 1570], t: 70, sub: 34 },
  },
  barvy: { glowA: '#2f325c', glowB: '#2f325c', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

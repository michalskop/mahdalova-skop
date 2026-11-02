// Sada pěti coverů (27. 10. 2026). Původní cover = fotka demonstrace „Stop assassinating journalists
// in Gaza“ ve fialovém rámu bez textu; fotka zůstává (bez rámu), doplněn štítek a titulek článku.
// Zdroj: images/killing-journalist-gaza-2025.webp (1080 × 1350), fotka v něm x 30–1050, y 337–1014.
// Fotka nahoře, text pod ní na navy (tváře demonstrujících nikdy pod textem ani logem).
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
const path = require('path');
const vrstva = require('./foto.cjs');

const IMG = path.join(__dirname, '..', 'images');
const FOTO = path.join(IMG, 'killing-journalist-gaza-2025.webp');
const pas = (H, [, y, , h], { shora = false } = {}) => [
  { smer: 'v', body: [[(y + h - 200) / H, 0], [(y + h - 10) / H, 1]] },
  ...(shora ? [{ smer: 'v', body: [[y / H, 1], [(y + 140) / H, 0]] }] : []),
];
const L = {
  homepage: { W: 1500, H: 1200, oblast: [0, 0, 1500, 760], vyrez: [30, 470, 1020] },
  square: { W: 1080, H: 1080, oblast: [0, 0, 1080, 600], vyrez: [30, 440, 1020] },
  instagram: { W: 1080, H: 1350, oblast: [0, 0, 1080, 780], vyrez: [71, 337, 938] },
  story: { W: 1080, H: 1920, oblast: [0, 300, 1080, 820], vyrez: [150, 337, 812], shora: true },
};
const svg = (k) => {
  const { W, H, oblast, vyrez, shora } = L[k];
  return vrstva({ W, H, src: FOTO, rozmer: [1080, 1350], vyrez, oblast, prechody: pas(H, oblast, { shora }) });
};

module.exports = {
  vystup: IMG,
  kicker: { cervene: 'Explainer', dal: 'Svoboda tisku' },
  titulek: 'Proč jsme se připojili<br>k&nbsp;výzvě na&nbsp;ochranu<br>novinářů v&nbsp;Gaze',
  format: {
    homepage: { box: [180, 720, 1320, 1080], t: 84 },
    square: { box: [70, 570, 1010, 1010], t: 70 },
    instagram: { box: [70, 760, 1010, 1240], t: 72 },
    story: { box: [80, 1090, 1000, 1570], t: 76 },
  },
  barvy: { glowA: '#2f325c', glowB: '#2f325c', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

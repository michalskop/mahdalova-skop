// Sada pěti coverů (27. 10. 2026) – původní cover článku (split satelitních snímků Tall as-Sultán
// před/po, štítek, titulek a podtitulek beze změny), jen přesazený do formátů z tools/COVER-EDITOR.md.
// Zdroj: images/gaza-01-tel-al-sultan-pred.webp a -po.webp (Google Maps / Airbus, jako v článku).
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
const path = require('path');
const vrstva = require('./foto.cjs');

const IMG = path.join(__dirname, '..', 'images');
const PRED = path.join(IMG, 'gaza-01-tel-al-sultan-pred.webp');
const PO = path.join(IMG, 'gaza-01-tel-al-sultan-po.webp');
// shora navy pod text (štítek, titulek, podtitulek); horní pás plně kryje datový štítek „únor 2026“ zapečený ve snímku; dole jemně pod logo
const nahore = (do_) => ({ smer: 'v', body: [[0, 1], [0.15, 1], [do_ * 0.6, 0.85], [do_, 0]] });
const dole = { smer: 'v', body: [[0.78, 0], [1, 0.75]] };
const L = {
  homepage: { W: 1500, H: 1200, vyrez: [0, 0, 757], split: 750, do_: 0.62 },
  square: { W: 1080, H: 1080, vyrez: [0, 0, 757], split: 540, do_: 0.58 },
  instagram: { W: 1080, H: 1350, vyrez: [0, 0, 757], split: 540, do_: 0.5 },
  // story: snímek jako vycentrovaný pás pod textem na ink blue, logo pod ním (Kateřina 27. 10.)
  // celá šířka snímků (víc mapy), výřez pod zapečeným štítkem „únor 2026“, pás končí nad logem
  story: { W: 1080, H: 1920, vyrez: [0, 120, 757], split: 540, oblast: [0, 620, 1080, 900],
    prechody: [{ smer: 'v', body: [[0, 1], [0.323, 1], [0.37, 0]] }, { smer: 'v', body: [[0.75, 0], [0.792, 1]] }] },
};
const svg = (k) => {
  const { W, H, vyrez, split, do_, oblast, prechody } = L[k];
  return vrstva({ W, H, src: PRED, src2: PO, split, rozmer: [757, 1049], vyrez, oblast, prechody: prechody ?? [nahore(do_), dole] });
};

module.exports = {
  vystup: IMG,
  kicker: { cervene: 'Satelitní snímky' },
  titulek: 'Gaza: ničení pokračuje<br>i&nbsp;po&nbsp;příměří',
  pod: 'Zničených staveb od té doby přibylo o&nbsp;9&nbsp;%',
  format: {
    homepage: { box: [180, 300, 1320, 1080], t: 92 },
    square: { t: 80 },
    instagram: { t: 80 },
    story: { box: [80, 300, 1000, 1570], t: 78 },
  },
  barvy: { glowA: '#2f325c', glowB: '#2f325c', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

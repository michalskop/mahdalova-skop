// Sada pěti coverů (27. 10. 2026). Původní cover = koláž (BBC „Gaza genocide warning“, titulek Guardianu,
// tweet Jakuba Szántó) na červeném podkladu bez textu; koláž zůstává, místo mimopaletové červené je navy
// a doplněn štítek, titulek „Nebezpečná izolace“ a podtitulek z titulku článku (bez emoji).
// Zdroj: images/palestine-gaza-israel-news.jpg (1080 × 1080), koláž v něm x 6–1074, y 241–838.
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
const path = require('path');
const vrstva = require('./foto.cjs');

const IMG = path.join(__dirname, '..', 'images');
const FOTO = path.join(IMG, 'palestine-gaza-israel-news.jpg');
// Koláž celá včetně tweetu Jakuba Szántó (ve zdroji x 638–1067, y 736–926), v původním rozložení: nic nepřekrývá
// titulek BBC ani výstřižek Guardianu (ten je zapečený ve fotce BBC, posunout nejde). Kateřina 27. 10.: zvětšený tweet
// přes roh zakrýval „warning“, useknutý tweet byl nečitelný. Výřez y 241–930, výška = 689 × měřítko.
const VYREZ = [6, 241, 1068];
const L = {
  homepage: { W: 1500, H: 1200, oblast: [205, 30, 1090, 703] },
  square: { W: 1080, H: 1080, oblast: [75, 30, 930, 600] },
  instagram: { W: 1080, H: 1350, oblast: [0, 90, 1080, 697] },
  story: { W: 1080, H: 1920, oblast: [0, 330, 1080, 697] },
};
// pod kartou BBC (y > 841) a vpravo od tweetu je ve zdroji mimopaletová červená → zakrýt ink blue
const NAVY = '#101432';
function maska([ox, oy, ow], k) {
  const [vx, vy] = VYREZ;
  const r = (x0, y0, x1, y1) => `<rect x="${(ox + (x0 - vx) * k).toFixed(1)}" y="${(oy + (y0 - vy) * k).toFixed(1)}" width="${((x1 - x0) * k).toFixed(1)}" height="${((y1 - y0) * k).toFixed(1)}" fill="${NAVY}"/>`;
  return r(0, 841, 636, 931) + r(1068, 841, 1080, 931);
}
const svg = (k) => {
  const { W, H, oblast } = L[k];
  const m = oblast[2] / VYREZ[2];
  return vrstva({ W, H, src: FOTO, rozmer: [1080, 1080], vyrez: VYREZ, oblast, extra: maska(oblast, m) });
};

module.exports = {
  vystup: IMG,
  kicker: { cervene: 'Kontext', dal: 'Česko a Izrael' },
  titulek: 'Nebezpečná izolace',
  pod: 'Proč česká bezpodmínečná podpora Izraele<br>poškozuje naši bezpečnost',
  format: {
    homepage: { box: [180, 775, 1320, 1080], t: 88, sub: 34 },
    square: { box: [70, 675, 1010, 1010], t: 92, sub: 34 },
    instagram: { box: [70, 830, 1010, 1240], t: 92, sub: 34 },
    story: { box: [80, 1080, 1000, 1570], t: 92, sub: 36 },
  },
  barvy: { glowA: '#2f325c', glowB: '#2f325c', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

// Sada coverů – motiv kreslí motiv.cjs (dlaždicová mapa USA, výsledky voleb do Senátu 3. 11. 2026 podle AP),
// pak node tools/cover-generator.cjs <tento soubor>. Titulek a podtitulek bere generátor z frontmatteru článku.
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;USA' },
  legenda: [['#4a51ab', 'Senát: demokraté získali'], ['#a9b5f0', 'demokraté udrželi'], ['#a03250', 'republikáni udrželi']],
  // brandRoyalBlue.8 / brandDeepRed.7 záře, background.2 a brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#272a59', glowB: '#812840', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: MAPA,
  logoPodLegendou: true,
  motiv: { typ: 'svg', opacityOg: 0.6, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

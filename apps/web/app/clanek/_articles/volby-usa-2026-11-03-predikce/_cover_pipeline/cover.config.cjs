// Sada coverů – motiv kreslí motiv.cjs (dlaždicová mapa USA, barva = šance demokrata na senátorské křeslo
// podle predikce DataTimes, snapshot 4. 11. 2026 0:23 SEČ), pak node tools/cover-generator.cjs <tento soubor>.
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Predikce', dal: 'Volby v&nbsp;USA' },
  legenda: [['#4a51ab', 'Senát: vede demokrat'], ['#ece6d3', 'vyrovnané'], ['#a03250', 'vede republikán']],
  // brandRoyalBlue.8 / brandDeepRed.7 záře, background.2 a brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#272a59', glowB: '#812840', kick: '#f8f6f0', sub: '#d2d8e9', stitek: '#de1743' },
  mapaPozice: MAPA,
  logoPodLegendou: true,
  motiv: { typ: 'svg', opacityOg: 0.6, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

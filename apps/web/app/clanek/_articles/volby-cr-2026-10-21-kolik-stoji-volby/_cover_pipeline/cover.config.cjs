// Sada coverů – python body.py, node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): tečková mapa obcí přes nenápadný modrý stín republiky. Oranžově 1 153 obcí, kde okrsková komise
// stojí přes 100 Kč na voliče (nejmenší okrsky), ostatní obce světle modře.
const path = require('path');

const DRAHE = '#f76800'; // brandOrange.6
const OSTATNI = '#8f9dc9'; // brandNavy.4
const SVETLA = '#d2d8e9'; // brandNavy.1
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Miliarda<br>za volby',
  pod: 'Na voliče stojí reálně stejně jako v roce 2018,<br>nejdráž vycházejí nejmenší okrsky',
  legenda: [[DRAHE, 'komise přes 100 Kč na voliče'], [OSTATNI, 'ostatní obce']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandOrange.8 / brandNavy.7 záře, brandOrange.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#994800', glowB: '#4c4f8e', kick: '#ffe0c7', sub: SVETLA, stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

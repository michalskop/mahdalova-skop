// Sada coverů – python body.py, node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): tečková mapa obcí přes nenápadný modrý stín republiky. Oranžově 1 153 obcí, kde okrsková komise
// stojí přes 100 Kč na voliče (nejmenší okrsky), ostatní obce světle modře.
const path = require('path');

const DRAHE = '#f76800'; // brandOrange.6
const SVETLA = '#d2d8e9'; // brandNavy.1
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Miliarda<br>za volby',
  pod: 'Na voliče stojí reálně stejně jako v roce 2018,<br>nejdráž vycházejí nejmenší okrsky',
  // jen jedna položka: druhá skupina je zřejmá (Kateřina 28. 10.: „ostatní obce“ nepsat)
  legenda: [[DRAHE, 'malé obce, kde volby<br>stojí přes 100&nbsp;Kč na&nbsp;voliče']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandOrange.8 / brandNavy.7 záře, brandOrange.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#994800', glowB: '#4c4f8e', kick: '#ffe0c7', sub: SVETLA, stitek: '#de1743' },
// legenda v OG není: podtitulek říká, že nejdráž jsou nejmenší okrsky
  // OG naležato (Kateřina 28. 10.): motiv uprostřed, texty kolem něj, všechny v bezpečném středním čtverci x 285–915
  // (vidět i v ořezu WhatsApp/Signal), text odsazený 35 px od hran čtverce (x 320–880), ať v ořezu nesedí na okraji;
  // rozložení podle tvaru motivu, ne jednotný vzor
  og: 'siroky', ogScrim: false,
  rozlozeni: { og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 48 }, { prvky: ['pod'], x: 880, y: 100, vpravo: true }, { prvky: ['logo'], x: 320, y: 584, dole: true }] },
  pro: { og: { pod: 'Na voliče stojí reálně stejně<br>jako v&nbsp;roce 2018, nejdráž<br>vycházejí nejmenší okrsky' } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

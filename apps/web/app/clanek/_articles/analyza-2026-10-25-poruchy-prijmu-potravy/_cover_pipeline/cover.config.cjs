// Sada coverů – node motiv.cjs, pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// a kontrolní arch: PW_PATH=… node kontaktni-arch.cjs
// Motiv: tečková „slunečnice“, 1 tečka = 10 dívek do 18 let s poruchou příjmu potravy; vnitřek = 2010 (120 teček,
// tlumeně), celý disk = 2025 (386 teček), přírůstek oranžově (brandOrange.6 = dívky). Viz motiv.cjs.
const path = require('path');
const ORANZ = '#f76800'; // brandOrange.6
const TLUM = '#994800'; // brandOrange.8
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Poruchy příjmu potravy' },
  titulek: 'Dívek s&nbsp;poruchou<br>příjmu potravy<br>je třikrát víc',
  pod: 'V&nbsp;roce 2010 se léčilo 1&nbsp;199 dívek<br>do&nbsp;18&nbsp;let, loni 3&nbsp;858',
  legenda: [[TLUM, 'dívky léčené v&nbsp;roce 2010'], [ORANZ, 'přibylo do roku 2025'], ['transparent', '1 tečka = 10 dívek']],
  legendaPodTextem: true,
  logo: 'vlevo', // disk vpravo dole, vlevo dole je klid
  // homepage: kicker níž kvůli štítku rubriky v malých kartách (nic textového nad ~200 z 800)
  format: { homepage: { box: [180, 300, 1320, 1080] } },
  // brandOrange.9 / brandDeepRed.9 záře, brandOrange.1 podtitulek
  barvy: { glowA: '#663200', glowB: '#431320', glowPosA: '0% 0%', sub: '#ffe0c7', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

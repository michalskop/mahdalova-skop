// Sada coverů – node _cover_pipeline/motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečkové řady (tečka = nově zvolený senátor/ka, barva = odpověď v naší Volební kalkulačce), viz motiv.cjs.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Senátní volby 2026' },
  titulek: 'Jak smýšlejí<br>noví senátoři',
  pod: 'Odpovědi 27 nově zvolených v&nbsp;naší Volební kalkulačce',
  legenda: [['#33b9d9', 'pro'], ['#f76800', 'proti'], ['#bcb6a4', 'nevím'], ['#3d4175', 'bez odpovědi']],
  logo: 'vlevo',
  // brandRoyalBlue.6 / brandTeal.8 záře (stejný rodinný vzhled jako ostatní volební covery)
  barvy: { glowA: '#4a51ab', glowB: '#044d5e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

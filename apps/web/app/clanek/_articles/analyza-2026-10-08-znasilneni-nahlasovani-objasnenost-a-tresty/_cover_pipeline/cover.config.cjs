// Sada coverů – node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node ../../../../../../tools/cover-generator.cjs cover.config.cjs
// Motiv: slunečnice ze 100 teček, 11 karmínových = oběti, které šly na policii (viz motiv.cjs). Nahrazuje cover
// „STOP s rukama“, který se tloukl s coverem analýzy bingo (21. 10.).
const path = require('path');
const { barvy } = require('./motiv.cjs');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Sexuální násilí' },
  titulek: 'Na policii jde jen<br>zhruba každá desátá<br>oběť znásilnění',
  pod: 'Policii oznámí násilí 11 obětí ze sta',
  legenda: [[barvy.KARMIN, 'oznámily policii'], [barvy.TLUM, 'neoznámily'], ['transparent', '1 tečka = 1 oběť ze sta']],
  legendaPodTextem: true,
  logo: 'vlevo', // disk vpravo dole, vlevo dole je klid
  format: { homepage: { box: [180, 300, 1320, 1080], t: 84 }, square: { t: 72 }, instagram: { t: 76 }, story: { t: 84 } },
  barvy: { glowA: '#431320', glowB: '#101432', glowPosA: '0% 0%', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

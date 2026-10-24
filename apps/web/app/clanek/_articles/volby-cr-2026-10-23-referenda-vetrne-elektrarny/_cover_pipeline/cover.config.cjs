// Sada coverů – python ../_data_pipeline/build.py, node motiv.cjs, pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR, v každé z 21 obcí s referendem větrná turbína (oranžová = odmítla, tyrkysová = podpořila).
const path = require('path');
const PROTI = '#f76800'; // brandOrange.6
const PRO = '#33b9d9'; // brandTeal.4
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Referenda o větrnících' },
  titulek: 'Větrníky odmítlo<br>20 z&nbsp;21 obcí',
  pod: 'Jen Dětřichov na Svitavsku řekl v&nbsp;referendu ano, o&nbsp;osm hlasů',
  mapaPozice: { homepage: [140, 470, 1500, 1170] },
  legenda: [[PROTI, 'obec větrníky odmítla'], [PRO, 'obec je podpořila']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandOrange.9 / brandTeal.9 záře, brandOrange.1 podtitulek
  barvy: { glowA: '#663200', glowB: '#023440', sub: '#ffe0c7', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.45, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

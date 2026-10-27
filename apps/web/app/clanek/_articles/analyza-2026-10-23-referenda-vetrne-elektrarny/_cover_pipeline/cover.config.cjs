// Sada coverů – python ../_data_pipeline/build.py, node motiv.cjs, pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR, v každé z 21 obcí s referendem větrná turbína (oranžová = odmítla, tyrkysová = podpořila).
const path = require('path');
const PROTI = '#bd9103'; // brandYellow.8 (stejně jako motiv.cjs)
const PRO = '#5fcce6'; // brandTeal.3
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Referenda o větrnících' },
  titulek: 'Větrníky odmítlo<br>20 z&nbsp;21 obcí',
  pod: 'Jen Dětřichov na Svitavsku řekl v&nbsp;referendu ano,<br>o&nbsp;osm hlasů', // ruční zlom: stejný ve všech formátech
  mapaPozice: { homepage: [140, 470, 1500, 1170] },
  legenda: [[PROTI, 'obec větrníky odmítla'], [PRO, 'obec je podpořila']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // pozadí: přechod z tyrkysové (brandTeal.7) do tmavě modré (brandTeal.9 → ink blue), brandYellow.1 podtitulek (Kateřina 25. 10.)
  barvy: { glowA: '#06677d', glowB: '#023440', sub: '#fff7d9', stitek: '#de1743', glowPosA: '0% 0%', glowDosah: 75 },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

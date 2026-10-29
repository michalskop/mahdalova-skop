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
  format: { og: { t: 54 } }, // OG: titulek o kousek menší, ať nenaráží do větrníku na Vysočině
  // nadpis legendy bez puntíku, pod ním dvě varianty (Kateřina 28. 10.)
  legenda: [[null, 'Obec větrníky'], [PROTI, 'odmítla'], [PRO, 'podpořila']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // pozadí: přechod z tyrkysové (brandTeal.7) do tmavě modré (brandTeal.9 → ink blue), brandYellow.1 podtitulek (Kateřina 25. 10.)
  barvy: { glowA: '#06677d', glowB: '#023440', sub: '#fff7d9', stitek: '#de1743', glowPosA: '0% 0%', glowDosah: 75 },
  // OG naležato (Kateřina 28. 10.): motiv uprostřed, texty kolem něj, všechny v bezpečném středním čtverci x 285–915
  // (vidět i v ořezu WhatsApp/Signal), text odsazený 35 px od hran čtverce (x 320–880), ať v ořezu nesedí na okraji;
  // rozložení podle tvaru motivu, ne jednotný vzor
  // titulek dole přes jižní Čechy a Moravu (tam se o větrnících nehlasovalo), legenda vlevo nahoře nad Krušnými horami,
  // logo vlevo nahoře nad štítkem (dole by se tlačilo vedle titulku, vpravo nahoře se nevejde vedle štítku)
  og: 'siroky', ogScrim: false,
  rozlozeni: { og: [{ prvky: ['logo', 'kicker', 'legenda'], x: 320, y: 48 }, { prvky: ['pod'], x: 880, y: 140, vpravo: true }, { prvky: ['titulek'], x: 320, y: 576, dole: true }] },
  pro: { og: { pod: 'Jen Dětřichov na&nbsp;Svitavsku řekl<br>v&nbsp;referendu ano, o&nbsp;osm hlasů' } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};

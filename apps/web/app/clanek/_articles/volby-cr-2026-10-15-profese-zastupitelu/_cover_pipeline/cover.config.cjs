// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR (z článku o predikci) a v ní obce, kde se do zastupitelstva z nevolitelného místa
// dostal lékař či veterinář (tyrkysově) nebo ředitel školy či knihovnice (žlutě). Body z body.py → cover-body.json.
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const skoky = require(path.join(__dirname, 'cover-body.json'));

const LEKAR = '#5fcce6'; // brandTeal.3
const SKOLA = '#ffcf02'; // brandYellow
const body = [
  ...skoky.filter((s) => s.klic === 'reditel_skoly' || s.klic === 'knihovnik').map((s) => ({ lon: s.lon, lat: s.lat, k: 1.5, barva: SKOLA, op: 0.95 })),
  ...skoky.filter((s) => s.klic === 'lekar' || s.klic === 'veterinar').map((s) => ({ lon: s.lon, lat: s.lat, k: 1.5, barva: LEKAR, op: 0.95 })),
];

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'Komu voliči<br>věří',
  pod: 'Lékaři se z&nbsp;nevolitelných míst dostávají<br>do zastupitelstva třikrát častěji',
  legenda: [[LEKAR, 'zvolen lékař či veterinář z nevolitelného místa'], [SKOLA, 'zvolena ředitelka školy či knihovnice']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandTeal.9 / brandNavy.8 záře, brandTeal.2 podtitulek, brand.6 štítek
  barvy: { glowA: '#023440', glowB: '#2f325c', sub: '#b8eff6', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#2f325c', barvaTecka: '#2f325c', barvaBod: LEKAR, obrysBod: '#101432' },
};

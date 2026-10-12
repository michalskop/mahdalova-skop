// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (z článku o predikci), zvýrazněný senátní obvod 51 Žďár nad Sázavou
// a místa, kde v okrskových zápisech zřejmě chybějí hlasy.
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const mista = [
  { nazev: 'Ostrava-Jih', lat: 49.78, lon: 18.25 },
  { nazev: 'Kladno', lat: 50.143, lon: 14.137 },
  { nazev: 'Brno-střed', lat: 49.192, lon: 16.605 },
  { nazev: 'Praha 2', lat: 50.076, lon: 14.428 },
  { nazev: 'Praha 3', lat: 50.084, lon: 14.476 },
  { nazev: 'Praha 15', lat: 50.05, lon: 14.55 },
  { nazev: 'Milešín', lat: 49.366, lon: 16.201 },
];
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Hlasy, které<br>se ztratily',
  pod: 'Jeden hlas rozhodl o Senátu.<br>V zápisech zřejmě chybějí tisíce dalších',
  legenda: [['#ff4970', 'okrsky, kde nesedí zápis'], ['#ffcf02', 'senátní obvod Žďár nad Sázavou']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brand.8 / brandNavy.8 záře, brand.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#a81134', glowB: '#2f325c', kick: '#ffb3c0', sub: '#d2d8e9', stitek: '#de1743' },
  // obvod brandYellow.6, ostatní tečky brandNavy.8, místa brand.3 s obrysem brandNavy.9
  // velký tečkovaný otazník přes mapu (brand.3), čte se jako tvar, ne plocha
  znak: {
    text: '?', barva: '#ff4970', opacity: 0.5, opacityOg: 0.5,
    pozice: {
      homepage: [1130, 1010, 980], og: [600, 590, 700], square: [800, 960, 760],
      instagram: [800, 1180, 820], story: [790, 1520, 900],
    },
  },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [51], body: mista, barvaObvod: '#ffcf02', barvaTecka: '#2f325c', barvaBod: '#ff4970', obrysBod: '#101432' },
};

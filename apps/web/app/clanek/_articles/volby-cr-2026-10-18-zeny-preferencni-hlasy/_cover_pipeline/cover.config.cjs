// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR (z článku o predikci) a v ní obce, kde se do zastupitelstva z nevolitelného místa
// dostala žena (oranžově) nebo muž (petrolejově). Body z body.py → cover-body.json, jedna tečka za obec a pohlaví.
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const skoky = require(path.join(__dirname, 'cover-body.json'));

// Na tmavém pozadí světlejší odstíny stejných škál jako v grafech (ženy brandOrange, muži brandTeal)
const ZENA = '#ff934d'; // brandOrange.4
const MUZ = '#5fcce6'; // brandTeal.3
const jednou = (g) => {
  const videno = new Set();
  return skoky.filter((s) => s.g === g && !videno.has(s.lon + ',' + s.lat) && videno.add(s.lon + ',' + s.lat));
};
// Obě tečky jedné obce odsunuté od sebe (žena na západ, muž na východ), aby se nepřekrývaly a byly
// vidět všechny – počet barevných teček pak odpovídá počtu obcí, kde se zpod čáry prosadila žena / muž.
const body = [
  ...jednou('M').map((s) => ({ lon: s.lon + 0.03, lat: s.lat, k: 1.3, barva: MUZ, op: 0.95 })),
  ...jednou('Z').map((s) => ({ lon: s.lon - 0.03, lat: s.lat, k: 1.3, barva: ZENA, op: 0.95 })),
];

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'Ženy, muži<br>a křížky voličů',
  pod: 'Ženy dostávají o&nbsp;dvě procenta méně hlasů.<br>O&nbsp;zastupitelkách ale rozhoduje pořadí',
  legenda: [[ZENA, 'z nevolitelného místa zvolena žena'], [MUZ, 'z nevolitelného místa zvolen muž']],
  mapaPozice: { homepage: [230, 650, 1500, 1170], square: [60, 570, 1080, 1060] },
  legendaPodTextem: true,
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou
  // brandTeal.9 / brandNavy.8 záře, brandTeal.2 podtitulek, brand.6 štítek
  barvy: { glowA: '#023440', glowB: '#2f325c', sub: '#b8eff6', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#2f325c', barvaTecka: '#2f325c', barvaBod: ZENA, obrysBod: '#101432' },
};

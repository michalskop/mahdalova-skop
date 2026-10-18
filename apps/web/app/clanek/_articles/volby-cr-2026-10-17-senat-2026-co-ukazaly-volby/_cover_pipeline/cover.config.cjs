// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (senátní obvody z predikce 1. kola), zvýrazněno všech 27 obvodů letošních voleb – v žádném nevyhrála vládní strana.
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const OBVODY = Array.from({ length: 27 }, (_, i) => 3 * (i + 1));
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Senátní volby 2026' },
  titulek: 'Vláda v Senátu:<br>0 z 27',
  pod: 'V&nbsp;letošních senátních volbách vládní strany nezískaly ani jedno křeslo, protivládní blok má nyní jistých 65&nbsp;z&nbsp;81&nbsp;hlasů',
  legenda: [['#de1743', 'letošních 27 obvodů']],
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: OBVODY, body: [], ...NAVY_DOTS },
};

// Sada coverů – node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (senátní obvody z predikce 1. kola), zvýrazněno 22 obvodů 2. kola.
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const KOLO2 = [3, 6, 9, 15, 18, 21, 24, 27, 30, 36, 42, 45, 51, 54, 60, 63, 66, 69, 72, 75, 78, 81];
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Predikce', dal: 'Senátní volby 2026, 2. kolo' },
  titulek: 'Senátní volby<br>2. kolo',
  pod: 'Kdo vyhrál ve 22&nbsp;obvodech a&nbsp;jak silné jsou kluby',
  ikona: path.join(__dirname, 'ikona-predikce.svg'),
  legenda: [['#de1743', '22 obvodů ve 2. kole']],
  format: { story: { t: 88 }, instagram: { t: 86 } }, // titulek nesmí narazit na ikonu PREDIKCE
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: KOLO2, body: [], ...NAVY_DOTS },
};

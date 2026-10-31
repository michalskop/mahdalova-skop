// English cover set (datatimes.org). Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (senátní obvody z predikce 1. kola), zvýrazněno 13 obvodů, kde byl ve 2. kole kandidát ANO (prohrál ve všech).
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', 'web', 'app', 'clanek', '_articles', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const OBVODY = [3, 6, 9, 15, 18, 36, 42, 54, 63, 66, 72, 75, 81];  // obvody s finalistou ANO (ucast_okrsky.py)
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Senate elections 2026' },
  titulek: "Rivals won over<br>ANO's voters",
  pod: "ANO's candidates lost a&nbsp;third of their votes between the two rounds of the Senate election, their rivals only a&nbsp;tenth",
  legenda: [['#de1743', '13 districts with ANO in round 2']],
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: OBVODY, body: [], ...NAVY_DOTS },
};

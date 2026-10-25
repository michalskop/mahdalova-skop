// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (senátní obvody z predikce 1. kola), zvýrazněno 13 obvodů s kandidátem ANO ve 2. kole (prohrál ve všech);
// světlý bod = Karviná, jediný obvod, kde by hlasy SPD z 1. kola stačily (vypocet.py). Sourozenec coveru ze 17. 10.
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const OBVODY = [3, 6, 9, 15, 18, 36, 42, 54, 63, 66, 72, 75, 81];  // obvody s finalistou ANO (vypocet.py)
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#f8f6f0' /* papír */, obrysBod: '#de1743' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Senátní volby 2026' },
  titulek: 'Hlasy SPD by ANO<br>nezachránily',
  pod: 'Kandidátům ANO chybělo ve 2.&nbsp;kole v&nbsp;11 ze 13 obvodů víc hlasů, než kolik měla v&nbsp;1.&nbsp;kole SPD',
  legenda: [['#de1743', '13 obvodů, kde ANO prohrálo 2. kolo'], ['#f8f6f0', 'Karviná: stačilo by 22 % voličů SPD']],
  logo: 'vlevo',
  format: { story: { t: 90 } },  // stejné zalomení titulku jako ostatní formáty (COVER-EDITOR.md, 16. 10.)
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: OBVODY, body: [{ lon: 18.54, lat: 49.85, k: 4 }], ...NAVY_DOTS },
};

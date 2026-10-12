// Sada coverů – node tools/cover-generator.cjs <tento soubor>
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const { mesta } = require(path.join(__dirname, '..', 'kalkulacky-mapa.json'));
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volební kalkulačka', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Volební kalkulačka<br>pro 73&nbsp;měst a&nbsp;Senát',
  pod: 'Slavíme 20 let · od roku 2006',
  ikona: path.join(__dirname, 'ikona-kalkulacka-20-let.png'),
  legenda: [['#697fe6', '73 měst – komunální volby'], ['#de1743', 'senátní obvody']],
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body: mesta, ...NAVY_DOTS },
};

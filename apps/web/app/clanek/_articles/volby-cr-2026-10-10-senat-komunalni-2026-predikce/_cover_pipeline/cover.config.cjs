// Sada coverů – node tools/cover-generator.cjs <tento soubor>
const path = require('path');
const mapa = require(path.join(__dirname, '..', 'senat-mapa.json'));
const obce = require(path.join(__dirname, '..', 'obce-mapa.json'));
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Predikce', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Volby 2026 –<br>predikce',
  pod: 'Průběžný odhad: 140 měst a&nbsp;27 senátních obvodů',
  ikona: path.join(__dirname, 'ikona-predikce.svg'),
  legenda: [['#697fe6', '140 měst – komunální volby'], ['#de1743', '27 senátních obvodů']],
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body: obce, ...NAVY_DOTS },
};

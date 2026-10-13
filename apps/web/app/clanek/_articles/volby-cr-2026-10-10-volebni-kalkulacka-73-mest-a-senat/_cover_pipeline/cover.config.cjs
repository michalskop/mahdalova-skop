// Sada coverů – node tools/cover-generator.cjs <tento soubor>
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const { mesta } = require(path.join(__dirname, '..', 'kalkulacky-mapa.json'));
const NAVY_DOTS = { barvaObvod: '#de1743' /* brand.6 */, barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#697fe6' /* brandRoyalBlue.4 */, obrysBod: '#ffffff' };
// Odlišeno od sesterského coveru predikce: záře zrcadlově (petrolejová vpravo nahoře, ametystová vlevo dole), jiný tón podtitulku.
const BARVY = { glowA: '#06677d' /* brandTeal.7 */, glowPosA: '100% 0%', glowB: '#6e227d' /* brandAmethyst.7 */, glowPosB: '0% 100%', glowDosah: 60, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#8cdfef' /* brandTeal.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volební kalkulačka', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Volební kalkulačka<br>pro 73&nbsp;měst a&nbsp;Senát',
  pod: 'Slavíme 20 let · od roku 2006',
  ikona: path.join(__dirname, 'ikona-kalkulacka-20-let.png'),
  ikonaCtverec: [59, 41, 307], // čtverec piktogramu ve vyříznutém PNG (bez odznaku 20 let a stínu)
  legenda: [['#697fe6', '73 měst – komunální volby'], ['#de1743', 'senátní obvody']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body: mesta, ...NAVY_DOTS },
};

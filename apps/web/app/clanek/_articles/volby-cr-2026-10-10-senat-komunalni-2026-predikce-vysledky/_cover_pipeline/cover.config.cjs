// Sada coverů – node tools/cover-generator.cjs <tento soubor>  (nahrazuje cover.cjs, který zůstává jako původní vzor)
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const obce = require(path.join(ZDROJ, 'obce-mapa.json'));
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Výsledky', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Volby 2026 –<br>výsledky predikce',
  pod: 'Jak brzy jsme věděli, jak to dopadne',
  ikona: path.join(__dirname, 'ikona-vysledky.svg'),
  legenda: [['#ffcf02', '140 měst'], ['#4fd6b4', '27 senátních obvodů']],
  // brandEmeraldMint.7 / brandTeal.7 záře, brandEmeraldMint.1 / .2 texty
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  barvy: { glowA: '#0b6b4e', glowB: '#06677d', kick: '#c2f0e4', sub: '#9be8d4', stitek: '#12b886' },
  // body brandYellow.6, obvody brandEmeraldMint.4, ostatní tečky brandNavy.8
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body: obce, barvaObvod: '#4fd6b4', barvaTecka: '#2f325c', barvaBod: '#ffcf02', obrysBod: '#101432' },
};

// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR, zvýrazněné Mariánské Lázně; přes mapu velká tečkovaná sedmička (7 celých lístků
// rozhodlo o druhém mandátu Našeho Česka – _data_pipeline/build.py). Sourozenec volebních coverů z 20.–23. 10.
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const BARVY = { glowA: '#4a51ab' /* brandRoyalBlue.6 */, glowB: '#812840' /* brandDeepRed.7 */, kick: '#d2d8e9' /* brandNavy.1 */, sub: '#a9b5f0' /* brandRoyalBlue.2 */, stitek: '#de1743' };
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Komunální volby 2026', dal: 'Podezření na kupování hlasů' },
  titulek: 'Druhý mandát<br>visel na sedmi<br>voličích',
  pod: 'Bez 7 celých lístků by Naše Česko mělo v&nbsp;zastupitelstvu jedno křeslo místo dvou, bez 83 žádné',
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body: [{ lon: 12.70, lat: 49.965, k: 4.5, popisek: 'Mariánské Lázně' }],
    barvaObvod: '#de1743', barvaTecka: '#2f325c' /* brandNavy.8 */, barvaBod: '#f8f6f0', obrysBod: '#de1743' },
  znak: { text: '7', barva: '#de1743', opacity: 0.85, opacityOg: 0.35,
    pozice: { homepage: [1180, 1090, 600], og: [1020, 580, 520], square: [840, 1010, 540], instagram: [840, 1250, 600], story: [800, 1560, 740] } },
};

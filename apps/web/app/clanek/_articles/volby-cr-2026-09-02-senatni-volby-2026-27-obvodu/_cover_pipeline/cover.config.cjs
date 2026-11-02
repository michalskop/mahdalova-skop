// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Motiv: tečková mapa ČR (článek o predikci), karmínově 27 obvodů, kde se v roce 2026 volí (senat-mapa.json → vol).
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));

const KARMIN = '#de1743'; // brand.6

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Senátní volby 2026' },
  titulek: 'Koalice většinu<br>v&nbsp;Senátu nezíská',
  pod: 'Ani kdyby ANO vyhrálo ve všech 24 obvodech,<br>kde kandiduje',
  legenda: [[KARMIN, '27 obvodů, kde se volí v&nbsp;roce 2026']],
  logo: 'vlevo',
  // brand.9 / brandNavy.7 záře, brand.1 štítek coveru
  barvy: { glowA: '#431320', glowB: '#4c4f8e', kick: '#f5c4c9', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body: [], barvaObvod: KARMIN, barvaTecka: '#2f325c', barvaBod: KARMIN, obrysBod: '#101432' },
};

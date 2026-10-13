// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (z článku o predikci), náhodně rozházené body a otazníčky a velký tečkovaný otazník.
// Záměrně bez zvýraznění konkrétního místa (Žďár by svedl k závěru, že se hlasy ztratily tam).
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
// Otazníčky jsou ilustrační: vybrané tečky mapy rovnoměrně po republice, přebarvené na červeno, s dokresleným
// obloukem otazníku. Nemají ukazovat konkrétní místa ani senátní obvod – chybějící hlasy mohou být kdekoli.
// Pevný seznam (souřadnice přesně z mapy) pro všechny formáty; prvních 7 je hlavní kompozice (13. 10. 2026:
// Aš → Kladno, sever → Klatovy), zbytek jsou náhradníci, když ve formátu otazníček koliduje s textem nebo logem.
const otaznicky = [
  [15.3906, 50.17], [16.2272, 48.8128], [14.461, 49.648], [14.6934, 48.9694], [15.9948, 49.8046],
  [14.0892, 50.17], [13.299, 49.387],
  [15.6694, 49.4392], [14.2751, 48.9172], [16.9708, 48.8128], [18.3187, 49.909], [13.7173, 49.648],
];

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Hlasy, které<br>se ztratily',
  pod: 'Jeden hlas rozhodl o Senátu.<br>V zápisech zřejmě chybějí tisíce dalších',
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, vpravo velký otazník
  // brand.8 / brandNavy.8 záře, brand.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#a81134', glowB: '#2f325c', kick: '#ffb3c0', sub: '#d2d8e9', stitek: '#de1743' },
  // tečky mapy brandNavy.8, otazníčky brand.3 bez obrysu
  // velký tečkovaný otazník (brand.3) z celých koleček; pozice ručně podle kompozice každého formátu
  znak: {
    text: '?', barva: '#ff4970', opacity: 0.55, opacityOg: 0.5,
    pozice: {
      homepage: [1150, 1000, 760], og: [1035, 540, 560], square: [860, 990, 600],
      instagram: [830, 1235, 640], story: [800, 1560, 720],
    },
  },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body: [], otaznicky, pocetOtazniku: 7, barvaObvod: '#ffcf02', barvaTecka: '#2f325c', barvaBod: '#ff4970', obrysBod: '#101432' },
};

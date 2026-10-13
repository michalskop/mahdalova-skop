// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (z článku o predikci), náhodně rozházené body a otazníčky a velký tečkovaný otazník.
// Záměrně bez zvýraznění konkrétního místa (Žďár by svedl k závěru, že se hlasy ztratily tam).
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
// Body jsou ilustrační, rozházené náhodně (pevné semínko) po celé republice – nemají ukazovat konkrétní
// místa ani senátní obvod, jen že chybějící hlasy mohou být kdekoli. Proto bez legendy.
function nahodneBody(pocet, otazniku, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const vybrane = [];
  while (vybrane.length < pocet) {
    const [lon, lat] = mapa.dots[Math.floor(rnd() * mapa.dots.length)];
    if (vybrane.every((b) => Math.hypot((b.lon - lon) * 0.64, b.lat - lat) > 0.42)) vybrane.push({ lon, lat });
  }
  return vybrane.map((b, i) => (i < otazniku ? { ...b, znak: '?', k: 3.3 } : b));
}
const mista = nahodneBody(16, 6, 20261012);
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální a senátní volby 2026' },
  titulek: 'Hlasy, které<br>se ztratily',
  pod: 'Jeden hlas rozhodl o Senátu.<br>V zápisech zřejmě chybějí tisíce dalších',
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, vpravo velký otazník
  // brand.8 / brandNavy.8 záře, brand.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#a81134', glowB: '#2f325c', kick: '#ffb3c0', sub: '#d2d8e9', stitek: '#de1743' },
  // tečky mapy brandNavy.8, body a otazníčky brand.3 s obrysem brandNavy.9
  // velký tečkovaný otazník (brand.3) z celých koleček; pozice ručně podle kompozice každého formátu
  znak: {
    text: '?', barva: '#ff4970', opacity: 0.55, opacityOg: 0.5,
    pozice: {
      homepage: [1150, 1000, 760], og: [1035, 540, 560], square: [860, 990, 600],
      instagram: [830, 1235, 640], story: [800, 1560, 720],
    },
  },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body: mista, barvaObvod: '#ffcf02', barvaTecka: '#2f325c', barvaBod: '#ff4970', obrysBod: '#101432' },
};

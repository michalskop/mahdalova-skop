// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (z článku o predikci) a přes ni obce ze skutečných dat článku (body.json z body.py):
//   SPD (brandYellow.6): obce, kde měla zastupitele po volbách 2022 – plná tečka = má je i teď, kroužek = vypadla
//   Motoristé (brandTeal.4): obce, kde letos kandidovali – plná tečka = zvolení, kroužek = nikdo neprošel
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const data = require('./body.json');

const NAVY = '#101432';
const BARVA = { spd: '#ffcf02', aut: '#33b9d9' };   // brandYellow.6, brandTeal.4
const spdObce = new Set(data.filter((b) => b.strana === 'spd').map((b) => b.n));
const body = data.map((b) => ({
  // kde má tečku i SPD, posune se tečka Motoristů kousek na východ, aby byly vidět obě
  lon: b.strana === 'aut' && spdObce.has(b.n) ? b.lon + 0.09 : b.lon,
  lat: b.lat,
  barva: b.plna ? BARVA[b.strana] : NAVY,
  obrys: BARVA[b.strana],
  k: b.plna ? 1.5 : 1.25,
}));
// prázdné kroužky dospod, plné tečky navrch
body.sort((a, b) => Number(a.barva !== NAVY) - Number(b.barva !== NAVY));

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'SPD vypadla<br>ze 121 zastupitelstev',
  pod: 'Motoristé prosadili 20 z 1 116 kandidátů.<br>KSČM a Stačilo! ztratily tři čtvrtiny zastupitelů',
  legenda: [[BARVA.spd, 'SPD'], [BARVA.aut, 'Motoristé']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandYellow.8 / brandTeal.7 záře (barvy obou stran), brandYellow.2 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#bd9103', glowB: '#06677d', kick: '#fff0b3', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#ffcf02', barvaTecka: '#2f325c', barvaBod: '#ffcf02', obrysBod: NAVY },
};

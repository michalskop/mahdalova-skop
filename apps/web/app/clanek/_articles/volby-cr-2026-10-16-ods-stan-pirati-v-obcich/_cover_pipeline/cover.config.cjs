// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Tečková mapa ČR (z článku o predikci) a přes ni obce ze skutečných dat článku (body.json z body.py):
//   ODS (brandRoyalBlue.4) a Piráti (background.2): obce, kde měli zastupitele po volbách 2022 –
//   plná tečka = mají je i teď, kroužek = vypadli
// Sourozenec coveru článku volby-cr-2026-10-14-spd-ano-motoriste-v-obcich.
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const data = require('./body.json');

const NAVY = '#101432';
const BARVA = { ods: '#697fe6', pir: '#f8f6f0' };   // brandRoyalBlue.4, background.2 (Piráti, v článku černí)
const odsObce = new Set(data.filter((b) => b.strana === 'ods').map((b) => b.n));
const body = data.map((b) => ({
  // kde má tečku i ODS, posune se tečka Pirátů kousek na východ, aby byly vidět obě
  lon: b.strana === 'pir' && odsObce.has(b.n) ? b.lon + 0.09 : b.lon,
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
  titulek: 'ODS přišla o 573<br>zastupitelů, Piráti o 74',  // pevné mezery: předložka ani číslo nezůstanou samy
  pod: 'STAN přibral ve městech, na vesnicích ubyl.<br>KDU-ČSL ztratila šestinu, Zelení drží počet',
  legenda: [[BARVA.ods, 'ODS'], [BARVA.pir, 'Piráti']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandRoyalBlue.6 / brandNavy.7 záře, brandRoyalBlue.1 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#4a51ab', glowB: '#4c4f8e', kick: '#c9d0f5', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#697fe6', barvaTecka: '#2f325c', barvaBod: '#697fe6', obrysBod: NAVY },
};

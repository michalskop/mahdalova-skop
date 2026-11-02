// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Série Volební kalkulačka (ikona, záře, tečková mapa jako volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat):
// karmínově 27 senátních obvodů 2026, modře Praha a Brno (inventura hlasování zastupitelů).
const path = require('path');
const SERIE = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const obce = require(path.join(ZDROJ, 'obce-mapa.json'));

const MODRA = '#697fe6'; // brandRoyalBlue.4
const KARMIN = '#de1743'; // brand.6
const body = ['Praha', 'Brno'].map((n) => { const o = obce.find((x) => x.n === n); return { lon: o.lon, lat: o.lat, k: 3.4, popisek: n }; });
const BARVY = { glowA: '#07479d', glowPosA: '22% 30%', glowB: '#7a303d', glowPosB: '80% 72%', glowDosah: 48, kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' };

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Volební kalkulačka', dal: 'Senát a&nbsp;inventura 2026' },
  titulek: 'Volební kalkulačka<br>pro Senát',
  pod: 'a&nbsp;inventura hlasování zastupitelů<br>Prahy a&nbsp;Brna',
  ikona: path.join(SERIE, '_cover_pipeline', 'ikona-kalkulacka-20-let.png'),
  ikonaCtverec: [59, 41, 307],
  legenda: [[KARMIN, 'senátní obvody 2026'], [MODRA, 'inventura Praha a Brno']],
  logo: 'vlevo',
  barvy: BARVY,
  motiv: { typ: 'tecky', dots: mapa.dots, vol: mapa.vol, body, barvaObvod: KARMIN, barvaTecka: '#2f325c', barvaBod: MODRA, obrysBod: '#ffffff' },
};
// OG: popisky měst by narážely do loga uprostřed, body zůstanou bez jmen
module.exports.pro = { og: { motiv: { ...module.exports.motiv, body: body.map(({ popisek, ...b }) => b) } } };

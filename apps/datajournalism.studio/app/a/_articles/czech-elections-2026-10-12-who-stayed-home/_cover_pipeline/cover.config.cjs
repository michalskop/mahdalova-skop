// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR, ve 22 místech bublina = podíl loňských voličů ANO, kteří nepřišli (plocha ∝ podíl),
// uvnitř bublina voličů SPOLU. Hodnoty = střed obou metod (mid) z data/zustali_doma.json.
const path = require('path');
// English edition: map and municipality data (and Czech place names for lookup) come from the Czech source article.
const CZ = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'web', 'app', 'clanek', '_articles');
const ZDROJ = path.join(CZ, 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const obce = require(path.join(ZDROJ, 'obce-mapa.json'));
const data = require(path.join(CZ, 'volby-cr-2026-10-12-kdo-zustal-doma', 'data', 'zustali_doma.json')).data.values;

const ANO = '#f76800'; // brandOrange.6
const SPOLU = '#5fcce6'; // brandTeal.3
const K = 8; // poloměr bubliny při 100 % (v násobcích tečky mapy)

// Senátní obvod ve stejném městě jako komunální výsledek posuneme kousek k jihovýchodu, ať jsou vidět oba.
const mista = [...new Set(data.map((d) => d.unit))].map((unit) => {
  const senat = unit.includes('(Senát)');
  const mesto = unit.replace(' (Senát)', '').replace('-město', '');
  const o = obce.find((x) => x.n === mesto);
  const dvojice = senat && data.some((d) => d.unit === mesto);
  const mid = (g) => data.find((d) => d.unit === unit && d.group === g).mid;
  return { lon: o.lon + (dvojice ? 0.16 : 0), lat: o.lat - (dvojice ? 0.07 : 0), ano: mid('ANO'), spolu: mid('SPOLU') };
});
const k = (p) => K * Math.sqrt(p / 100);
const body = [
  ...[...mista].sort((a, b) => b.ano - a.ano).map((m) => ({ lon: m.lon, lat: m.lat, k: k(m.ano), barva: ANO, op: 0.88 })),
  ...mista.map((m) => ({ lon: m.lon, lat: m.lat, k: Math.max(k(m.spolu), 0.9), barva: SPOLU })),
];

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Czech municipal and Senate elections 2026' },
  titulek: 'Who stayed at home',
  pod: 'About half of last year’s ANO voters did not turn out, of&nbsp;SPOLU voters&nbsp;7%',
  // mapa o kus výš a doprava, ať bublina Českých Budějovic nekoliduje s logem vlevo dole
  mapaPozice: { homepage: [150, 370, 1500, 1100] },
  legenda: [[ANO, '2025 ANO voters who did not vote'], [SPOLU, '2025 SPOLU voters who did not vote']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandOrange.9 / brandTeal.9 záře, brandOrange.2 podtitulek
  barvy: { glowA: '#663200', glowB: '#023440', sub: '#ffc89f', stitek: '#f76800' },
  // ostatní tečky brandNavy.8, bubliny navy obrys
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#2f325c', barvaTecka: '#2f325c', barvaBod: ANO, obrysBod: '#101432' },
};

// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026); starší koláž = compose.cjs.
// Motiv: mapa obcí ČR, oranžově 1 830 obcí s jedinou kandidátkou 2026 (obce-data.json článku, poslední pole roku =
// počet kandidátních listin), ostatní obce tlumeně. Plocha kolečka ∝ počtu obyvatel.
const path = require('path');
const { obce, mapaObci } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-mapa-obci.cjs'));
const data = require(path.join(__dirname, '..', 'obce-data.json')).obce;

const ORANZ = '#f76800'; // brandOrange.6
const TLUM = '#4c4f8e'; // brandNavy.7
const listin = (kod) => { const r = data[kod]?.y.split(';').find((s) => s.startsWith('2026:')); return r ? +r.split(',')[3] : null; };
const PRAHA = Math.sqrt(Math.max(...obce().map((o) => o.p)));
const body = obce().map((o) => {
  const jedina = listin(o.kod) === 1;
  return { ...o, jedina, k: Math.max(jedina ? 0.55 : 0.32, (Math.sqrt(o.p) / PRAHA) * 11), barva: jedina ? ORANZ : TLUM, op: jedina ? 1 : 0.8 };
}).sort((a, b) => Number(a.jedina) - Number(b.jedina) || a.k - b.k);
// číslo v podtitulku drží data článku (5 drobných obcí nemá v mapě polohu, na coveru tedy chybí)
if (Object.keys(data).filter((kod) => listin(kod) === 1).length !== 1830) throw new Error('čekám 1 830 obcí s jedinou kandidátkou');

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'Ve třetině obcí<br>jediná kandidátka',
  pod: 'Bez výběru je 1&nbsp;830 obcí,<br>v&nbsp;roce 1994 jich bylo 645',
  legenda: [[ORANZ, 'jediná kandidátka 2026'], [TLUM, 'víc kandidátek']],
  logo: 'vlevo',
  // brandOrange.9 / brandAmethyst.9 záře
  barvy: { glowA: '#663200', glowB: '#351040', kick: '#ffe0c7', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, svg: mapaObci({ body }) },
};

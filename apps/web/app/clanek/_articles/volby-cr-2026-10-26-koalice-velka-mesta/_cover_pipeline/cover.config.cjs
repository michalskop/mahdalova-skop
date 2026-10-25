// Sada coverů – python _data_pipeline/vypocet.py (zapíše mesta.json), pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR (sourozenec volebních coverů), 26 statutárních měst a Praha jako body; velikost ∝ počet
// obyvatel, barva podle toho, zda je ANO v dohodnuté koalici (stav 25. 10. 2026, role z vypocet.py).
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const mesta = require('./mesta.json');

const ANO = '#ff1a4a'; // brand.4 – ANO v dohodnuté koalici
const BEZ = '#f8f6f0'; // papír – koalice bez ANO
const JEDNA = '#8f9dc9'; // brandNavy.4 – jedná se
const BARVA = { ano: ANO, bez: BEZ, jedna: JEDNA };
// poloha měst (střed města, zaokrouhleno na setiny stupně)
const LL = {
  'Praha hl.m.': [14.42, 50.09], Brno: [16.61, 49.2], Ostrava: [18.29, 49.83], 'Plzeň': [13.38, 49.75],
  Liberec: [15.06, 50.77], Olomouc: [17.25, 49.59], 'České Budějovice': [14.47, 48.97], 'Hradec Králové': [15.83, 50.21],
  'Ústí nad Labem': [14.03, 50.66], Pardubice: [15.78, 50.04], 'Zlín': [17.67, 49.23], 'Havířov': [18.43, 49.78],
  Kladno: [14.1, 50.15], Most: [13.64, 50.5], Opava: [17.9, 49.94], 'Frýdek-Místek': [18.35, 49.68], 'Karviná': [18.54, 49.85],
  Jihlava: [15.59, 49.4], Teplice: [13.82, 50.64], 'Děčín': [14.21, 50.78], 'Karlovy Vary': [12.87, 50.23],
  Chomutov: [13.42, 50.46], 'Jablonec nad Nisou': [15.17, 50.72], 'Mladá Boleslav': [14.9, 50.41],
  'Prostějov': [17.11, 49.47], 'Přerov': [17.45, 49.46], 'Třinec': [18.67, 49.68],
};
const body = mesta
  .sort((a, b) => b.obyv - a.obyv) // velká města dospod, malá navrch
  .map((m) => ({ lon: LL[m.nazev][0], lat: LL[m.nazev][1], k: 1.9 + 2.4 * Math.sqrt(m.obyv / 400000), barva: BARVA[m.role], obrys: '#101432' }));
if (body.length !== 27) throw new Error('čekám 27 měst');

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Komunální volby 2026' },
  titulek: 'ANO na radnicích<br>vládne s opozicí',
  pod: 'V&nbsp;osmi z&nbsp;devíti velkých měst, kde je ANO v&nbsp;koalici,<br>jsou jeho partnery strany sněmovní opozice', // schválila Kateřina 25. 10., zalomení za čárkou
  mapaPozice: { homepage: [330, 600, 1490, 1190], square: [150, 560, 1075, 940] }, // square: České Budějovice nad logem
  legendaPodTextem: true, // dolní pravý roh zabírá Morava s body měst
  legenda: [[ANO, 'ANO v koalici'], [BEZ, 'koalice bez ANO'], [JEDNA, 'jedná se']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  format: { story: { t: 90 } },
  // brand.9 / brandNavy.7 záře, brandNavy.1 nadtitulek, brandRoyalBlue.2 podtitulek
  barvy: { glowA: '#8b0e2b', glowB: '#4c4f8e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#de1743', barvaTecka: '#2f325c', barvaBod: BEZ, obrysBod: '#101432' },
};

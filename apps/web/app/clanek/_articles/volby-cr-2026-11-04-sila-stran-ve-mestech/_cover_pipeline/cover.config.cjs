// Sada coverů – python _cover_pipeline/mesta.py (zapíše mesta.json), pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečková mapa ČR (sourozenec volebních coverů) a 30 největších měst jako „siloměr“ STAN:
// světlý kruh = podíl STAN v roce 2026, tmavé jádro = 2022, plocha kruhu ∝ podílu (stejná metrika jako v článku,
// hlasy koalic rozdělené podle zvolených). Města, kde STAN nemá zastupitele ani v jednom roce, jen jako obrys.
const path = require('path');
const mapa = require(path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const mesta = require('./mesta.json');

const STAN26 = '#ff1a4a'; // brand.4 – barva STAN v grafech článku
const STAN22 = '#a81134'; // brand.8 – stejná škála, tlumeně
const NIC = '#101432'; // brandNavy.9 – bez zastupitelů STAN
const OBRYS = '#8f9dc9'; // brandNavy.4
// poloha měst (střed města, zaokrouhleno na setiny stupně)
const LL = {
  'Praha hl.m.': [14.42, 50.09], Brno: [16.61, 49.2], Ostrava: [18.29, 49.83], 'Plzeň': [13.38, 49.75],
  Liberec: [15.06, 50.77], Olomouc: [17.25, 49.59], 'České Budějovice': [14.47, 48.97], 'Hradec Králové': [15.83, 50.21],
  'Ústí nad Labem': [14.03, 50.66], Pardubice: [15.78, 50.04], 'Zlín': [17.67, 49.23], 'Havířov': [18.43, 49.78],
  Kladno: [14.1, 50.15], Most: [13.64, 50.5], Opava: [17.9, 49.94], 'Frýdek-Místek': [18.35, 49.68], 'Karviná': [18.54, 49.85],
  Jihlava: [15.59, 49.4], Teplice: [13.82, 50.64], 'Děčín': [14.21, 50.78], 'Karlovy Vary': [12.87, 50.23],
  Chomutov: [13.42, 50.46], 'Jablonec nad Nisou': [15.17, 50.72], 'Mladá Boleslav': [14.9, 50.41],
  'Prostějov': [17.11, 49.47], 'Přerov': [17.45, 49.46], 'Česká Lípa': [14.54, 50.69], 'Třebíč': [15.88, 49.22],
  'Tábor': [14.66, 49.41], 'Znojmo': [16.05, 48.86],
};
// plocha ∝ podílu: k = násobek poloměru tečky mapy; Praha (23,2 %) ≈ 9. Obrys (šířka 0,7 r) leží na hraně kruhu:
// tmavý obrys vnějšího kruhu z něj ubere 0,35 r, obrys jádra v jeho barvě jádro o 0,35 r zvětší. Proto ±0,35 –
// viditelná plocha světlého kruhu i jádra pak odpovídá podílu.
const K = 9 / Math.sqrt(23.17);
const k = (pct, obrysUbira) => K * Math.sqrt(pct) + (obrysUbira ? 0.35 : -0.35);
const body = [];
for (const m of [...mesta].sort((a, b) => b.stan26 - a.stan26)) { // velké kruhy dospod
  const ll = LL[m.nazev];
  if (!ll) throw new Error(`chybí poloha města ${m.nazev}`);
  const [lon, lat] = ll;
  if (!m.stan26 && !m.stan22) { body.push({ lon, lat, k: 1.3, barva: NIC, obrys: OBRYS }); continue; }
  body.push({ lon, lat, k: k(m.stan26, true), barva: STAN26, obrys: NIC });
  if (m.stan22) body.push({ lon, lat, k: k(m.stan22, false), barva: STAN22, obrys: STAN22 });
}
if (mesta.length !== 30) throw new Error('čekám 30 měst');

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Síla stran ve velkých městech' },
  // titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek)
  mapaPozice: { homepage: [330, 600, 1490, 1190], square: [150, 560, 1075, 940] },
  legendaPodTextem: true, // dolní pravý roh zabírá Morava s body měst
  legenda: [[null, 'Podíl STAN ve městě'], [STAN26, '2026'], [STAN22, '2022 (jádro kruhu)']],
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou
  format: { story: { t: 90 }, homepage: { t: 86 } },
  // brand.9 / brandNavy.7 záře, brandNavy.1 nadtitulek, brandRoyalBlue.2 podtitulek
  barvy: { glowA: '#8b0e2b', glowB: '#4c4f8e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: { typ: 'tecky', dots: mapa.dots, vol: [], body, barvaObvod: '#de1743', barvaTecka: '#4c4f8e', barvaBod: STAN26, obrysBod: NIC },
};

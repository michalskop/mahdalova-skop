// Instagram carousel k článku analyza-2026-10-28-statni-vyznamenani-komu (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md):
// 6 slidů 1080×1350: tip, ročníky, Havel, Klaus a Zeman (podle Moravec.cz v našem designu), spory.
// Kateřina 28. 10.: bez průměrů, oblastí, řádů, slidu Pavla a závěru; podrobnosti odkazuje patička na DataTimes.cz.
// Kateřina 28. 10.: bez průměrů za ročník, TGM a in memoriam; řády jako graf z článku na dvou slidech (grafy-z-clanku.cjs).
// Počty po letech a prezidentech z tecky.json (02_analyza.py), oblasti, řády a in memoriam z _data_pipeline/vystup.txt.
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → ../../analyza-2026-10-28-statni-vyznamenani-komu/social/carousel/01.png … 10.png
process.env.VARIANTA = 'prezidenti'; // motiv.cjs: tečky podle prezidentů (musí být před require)
const path = require('path');
const { medaile } = require('./motiv.cjs');
const cover = require('./cover.prezidenti.config.cjs');
const G = require('./carousel.grafy.cjs');
const { PREZ_BARVY, PORADI, svg, zaznamy } = G;

const ZDROJ = 'Zdroj: seznamy vyznamenaných, Kancelář prezidenta republiky; výpočet DataTimes';

// počty podle prezidentů a ročníků (vystup.txt: Havel 547 / 8 ročníků, Klaus 229 / 10, Zeman 420 / 10, Pavel 174 / 3)
const CELKEM = Object.fromEntries(PORADI.map((p) => [p, zaznamy.filter((z) => z[2] === p).length]));
const OCEKAVANO = { Havel: 547, Klaus: 229, Zeman: 420, Pavel: 174 };
for (const p of PORADI) if (CELKEM[p] !== OCEKAVANO[p]) throw new Error(`${p}: ${CELKEM[p]} nesedí s článkem`);

// --- slide 3: po letech, barva podle prezidenta ---
function grafRoky() {
  const roky = {};
  for (const [rok, , p] of zaznamy) { roky[rok] = roky[rok] || {}; roky[rok][p] = (roky[rok][p] || 0) + 1; }
  const s = G.sloupceRoky((r) => PORADI.map((p) => ({ n: roky[r][p] || 0, barva: PREZ_BARVY[p] })),
    { y0: 720, y1: 1150, max: 110, popisy: { 1998: 106, 2002: 91, 2011: 21, 2022: 78 } });
  return svg(s + G.legenda(PORADI.map((p) => [PREZ_BARVY[p], p]), 120, 660));
}

// --- slidy 3–5: Havel, Klaus a Zeman zvlášť (podle karuselu Moravec.cz, v našem designu); stejné měřítko 0–110 všude ---
const POCTY = {};
for (const [rok, , p] of zaznamy) { POCTY[p] = POCTY[p] || {}; POCTY[p][rok] = (POCTY[p][rok] || 0) + 1; }
const rokyPrezidenta = (p, popisky = {}) => Object.entries(POCTY[p]).map(([rok, n]) => ({ popis: popisky[rok] ?? rok, n }));
if (POCTY.Havel[1998] !== 106 || POCTY.Klaus[2008] !== 28 || POCTY.Zeman[2022] !== 78 || POCTY.Zeman[2023] !== 1 || POCTY.Pavel[2023] !== 64) throw new Error('ročníky prezidentů nesedí s článkem');
const ZDROJ_MIMO = 'Počítáme i vyznamenání předaná mimo 28. říjen, např. při státních návštěvách. ' + ZDROJ;
const prezSlide = (p, titulek, pod, popisky, volby) => ({
  titulek, pod, zdroj: ZDROJ_MIMO,
  svg: svg(G.sloupcePrezidenta(rokyPrezidenta(p, popisky), PREZ_BARVY[p], { y0: 640, y1: 1110, max: 110, ...volby })),
});

module.exports = {
  vystup: path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Který prezident rozdával nejvíc vyznamenání?', pod: 'Tipněte si.', format: { instagram: { t: 70, sub: 34 } } },
      svg: () => medaile('instagram'),
    },
    {
      titulek: 'Klaus vyznamenával nejméně, Havel a Pavel nejvíc',
      pod: 'Počet vyznamenání v ročníku. Rok 2003 si rozdělili Havel (leden) a Klaus (říjen).',
      svg: grafRoky(),
      zdroj: ZDROJ,
    },
    prezSlide('Havel', 'Václav Havel rozdával vyznamenání po desítkách', 'Vyznamenání v ročníku. V roce 1998 jich bylo 106, nejvíc za rok od roku 1995.', { 2003: '2003|leden' },
      { kruh: 3, poznamka: 'nejvíc za rok od roku 1995' }),
    prezSlide('Klaus', 'Václav Klaus nikdy nedal víc než 28 vyznamenání za rok', 'Vyznamenání v ročníku. Za deset let jich udělil 229.', { 2003: '2003|říjen' },
      { kruh: 5, poznamka: 'nejvíc za Klause' }),
    prezSlide('Zeman', 'Miloš Zeman začínal na 30 vyznamenáních ročně a skončil na 78', 'Poslední medaili udělil k 1. lednu 2023, in memoriam hasiči Janu Dvořákovi.', { 2023: '2023|1. 1.' },
      { kruh: 9, poznamka: 'nejvíc od roku 2002' }),
    {
      titulek: 'Kontroverze přibývaly se Zemanem',
      pod: 'Výběr sporů kolem státních vyznamenání',
      obsahOd: 450,
      html: `<style>.obsah .bod{font-size:30px;margin-bottom:.7em}.obsah .bod b{font-size:28px;width:84px;font-family:'IBM Plex Sans',Arial,sans-serif}</style>
        <div class="bod"><b>1998</b><div>Havel na poslední chvíli vyškrtl ze seznamu vídeňského exstarostu Helmuta Zilka kvůli podezření ze spolupráce s StB. Řád mu in memoriam udělil až Zeman v roce 2019.</div></div>
        <div class="bod"><b>2013</b><div>Malíř Pavel Brázda vrátil medaili Za zásluhy, kterou mu v roce 2008 udělil Klaus. Nesouhlasil s jeho postoji.</div></div>
        <div class="bod"><b>2013</b><div>Vladimír Mišík vyznamenání od Zemana odmítl kvůli rostoucí nevoli z prezidentových rozhodnutí.</div></div>
        <div class="bod"><b>2014</b><div>Zeman ocenil režiséra Filipa Renče, který natočil klip jeho kampaně. Režisér Jan Němec na protest vrátil medaili od Havla.</div></div>
        <div class="bod"><b>2016</b><div>Na seznamu nebyl přeživší holocaustu Jiří Brady, strýc ministra kultury Daniela Hermana. Řada politiků ceremonii bojkotovala.</div></div>
        <div class="bod"><b>2022</b><div>Hana Zagorová ocenění od úřadujícího prezidenta za života odmítla. Zeman jí ho udělil in memoriam.</div></div>`,
      zdroj: 'Detaily najdete na DataTimes.cz',
    },
  ],
};

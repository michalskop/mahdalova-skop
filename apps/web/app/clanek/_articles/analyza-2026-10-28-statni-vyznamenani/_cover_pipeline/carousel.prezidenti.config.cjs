// Instagram carousel k článku analyza-2026-10-28-statni-vyznamenani-komu (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md):
// 10 slidů 1080×1350. Slide 1 = tip (medaile v barvách prezidentů), pak zjištění v pořadí článku, spory, metoda, výzva.
// Počty po letech a prezidentech z tecky.json (02_analyza.py), oblasti, řády a in memoriam z _data_pipeline/vystup.txt.
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → ../../analyza-2026-10-28-statni-vyznamenani-komu/social/carousel/01.png … 10.png
process.env.VARIANTA = 'prezidenti'; // motiv.cjs: tečky podle prezidentů (musí být před require)
const path = require('path');
const { medaile } = require('./motiv.cjs');
const cover = require('./cover.prezidenti.config.cjs');
const G = require('./carousel.grafy.cjs');
const { KREM, POPIS, PREZ_BARVY, PORADI, svg, text, f1, zaznamy } = G;

const JMENO = { Havel: 'Václav Havel', Klaus: 'Václav Klaus', Zeman: 'Miloš Zeman', Pavel: 'Petr Pavel' };
const ZDROJ = 'Zdroj: seznamy vyznamenaných, Kancelář prezidenta republiky; výpočet DataTimes';
const ZDROJ_OBLAST = 'Oblast určila redakce podle životopisu vyznamenaného. Seznamy vyznamenaných, Kancelář prezidenta republiky; výpočet DataTimes';
const pct = (z, n) => (z === 0 ? '0' : z / n < 0.01 ? 'pod 1&#160;%' : `${Math.round((100 * z) / n)}&#160;%`);

// počty podle prezidentů a ročníků (vystup.txt: Havel 547 / 8 ročníků, Klaus 229 / 10, Zeman 420 / 10, Pavel 174 / 3)
const CELKEM = Object.fromEntries(PORADI.map((p) => [p, zaznamy.filter((z) => z[2] === p).length]));
const ROCNIKY = { Havel: 8, Klaus: 10, Zeman: 10, Pavel: 3 };
const OCEKAVANO = { Havel: 547, Klaus: 229, Zeman: 420, Pavel: 174 };
for (const p of PORADI) if (CELKEM[p] !== OCEKAVANO[p]) throw new Error(`${p}: ${CELKEM[p]} nesedí s článkem`);

// --- slide 2: průměr za ročník ---
function grafRocne() {
  return svg(G.pruhy(PORADI.map((p) => ({
    popis: JMENO[p],
    hodnota: CELKEM[p] / ROCNIKY[p],
    stitek: String(Math.round(CELKEM[p] / ROCNIKY[p])),
    male: `${CELKEM[p]} vyznamenání za ${ROCNIKY[p]} ${ROCNIKY[p] === 3 ? 'ročníky' : 'ročníků'}`,
    barva: PREZ_BARVY[p],
  })), { y0: 600, max: 80, x1: 660 }));
}

// --- slide 3: po letech, barva podle prezidenta ---
function grafRoky() {
  const roky = {};
  for (const [rok, , p] of zaznamy) { roky[rok] = roky[rok] || {}; roky[rok][p] = (roky[rok][p] || 0) + 1; }
  const s = G.sloupceRoky((r) => PORADI.map((p) => ({ n: roky[r][p] || 0, barva: PREZ_BARVY[p] })),
    { y0: 720, y1: 1150, max: 110, popisy: { 1998: 106, 2002: 91, 2011: 21, 2022: 78 } });
  return svg(s + G.legenda(PORADI.map((p) => [PREZ_BARVY[p], p]), 120, 660));
}

// skupiny vodorovných pruhů s popisem vlevo: [[nadpis, [[prezident, z, n], …]], …]
function skupiny(data, { y0 = 610, max, stitek }) {
  const [xb, xmax] = [330, 830];
  let s = '', y = y0;
  for (const [nadpis, radky] of data) {
    s += text(70, y, nadpis, { size: 32, w: 700, fill: KREM });
    y += 24;
    for (const [p, z, n] of radky) {
      const sirka = Math.max(3, (z / max) * (xmax - xb));
      s += text(xb - 20, y + 34, JMENO[p], { size: 28, w: 500, fill: KREM, anchor: 'end' });
      s += `<rect x="${xb}" y="${y + 6}" width="${f1(sirka)}" height="40" rx="4" fill="${PREZ_BARVY[p]}"/>`;
      s += text(xb + sirka + 14, y + 37, stitek(z, n), { size: 28, w: 700, fill: KREM });
      y += 56;
    }
    y += 52;
  }
  return svg(s);
}

// --- slide 4: oblasti (počty vyznamenání) ---
const grafOblasti = () => skupiny([
  ['Protikomunistický odboj a disent', [['Havel', 43, 547], ['Klaus', 32, 229], ['Zeman', 2, 420], ['Pavel', 7, 174]]],
  ['Podnikání', [['Havel', 1, 547], ['Klaus', 4, 229], ['Zeman', 33, 420], ['Pavel', 5, 174]]],
], { max: 45, stitek: (z, n) => `${z} <tspan font-weight="500" font-size="23" fill="${POPIS}">(${pct(z, n)})</tspan>` });

// --- slide 5: řády, podíl ze všech řádů daného prezidenta (skupiny() dostane podíl a do štítku počty) ---
const grafRadyPodil = () => skupiny([
  ['Odpor proti komunismu', [['Havel', 16, 180], ['Klaus', 30, 72], ['Zeman', 0, 86], ['Pavel', 6, 40]]],
  ['Zahraniční státníci', [['Havel', 30, 180], ['Klaus', 3, 72], ['Zeman', 26, 86], ['Pavel', 7, 40]]],
].map(([h, r]) => [h, r.map(([p, z, n]) => [p, z / n, { z, n }])]), {
  max: 0.45, stitek: (podil, { z, n }) => `${pct(z, n)} <tspan font-weight="500" font-size="23" fill="${POPIS}">(${z} ${n === 86 ? 'z' : 'ze'} ${n})</tspan>`,
});

// --- slide 6 a 7: podíl TGM a in memoriam (pruhy podle prezidenta) ---
const podilPruhy = (data, male) => svg(G.pruhy(PORADI.map((p) => ({
  popis: JMENO[p], hodnota: data[p][0] / data[p][1], stitek: pct(...data[p]), male: male(p, data[p]), barva: PREZ_BARVY[p],
})), { y0: 600, max: 0.3, x1: 800 }));
const TGM = { Havel: [116, 547], Klaus: [49, 229], Zeman: [29, 420], Pavel: [20, 174] };
const MEMORIAM = { Havel: [123, 547], Klaus: [20, 229], Zeman: [111, 420], Pavel: [32, 174] };
const ze = (n) => (n === 420 || n === 174 ? 'ze' : 'z'); // jmenovatele 547, 229, 420, 174

module.exports = {
  vystup: path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Který prezident rozdával nejvíc vyznamenání?', pod: 'Tipněte si.', format: { instagram: { t: 70, sub: 34 } } },
      svg: () => medaile('instagram'),
    },
    {
      titulek: 'Havel dával v&#160;průměru 68 vyznamenání ročně, Klaus 23',
      pod: 'Průměrný počet vyznamenání za ročník, 1995–2025',
      svg: grafRocne(),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Klaus vyznamenával nejméně, Havel a Pavel nejvíc',
      pod: 'Počet vyznamenání v ročníku. Rok 2003 si rozdělili Havel (leden) a Klaus (říjen).',
      svg: grafRoky(),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Klaus vyznamenával politické vězně, Zeman podnikatele',
      pod: 'Počet vyznamenání za danou oblast a podíl ze všech vyznamenání prezidenta',
      svg: grafOblasti(),
      zdroj: ZDROJ_OBLAST,
    },
    {
      titulek: 'Klaus dával řády politickým vězňům, Zeman zahraničním státníkům',
      pod: 'Podíl ze všech řádů Bílého lva a T. G. Masaryka, které prezident udělil',
      svg: grafRadyPodil(),
      zdroj: ZDROJ_OBLAST,
    },
    {
      titulek: 'Řád T. G. Masaryka tvořil u Zemana třikrát menší podíl než u Havla a Klause',
      pod: 'Řád za zásluhy o demokracii, humanitu a lidská práva: podíl na všech vyznamenáních prezidenta',
      svg: podilPruhy(TGM, (p, [z, n]) => `${z} ${ze(n)} ${n}`),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Zeman vyznamenával posmrtně častěji než ostatní',
      pod: 'Podíl vyznamenání in memoriam. U Zemana hlavně letci RAF, legionáři a odbojáři.',
      svg: podilPruhy(MEMORIAM, (p, [z, n]) => `${z} ${ze(n)} ${n}`),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Kontroverze přibývaly se Zemanem',
      obsahOd: 380,
      html: `<style>.obsah .bod{font-size:33px;margin-bottom:.8em}.obsah .bod b{font-size:30px;width:92px;font-family:'IBM Plex Sans',Arial,sans-serif}</style>
        <div class="bod"><b>1998</b><div>Havel na poslední chvíli vyškrtl ze seznamu vídeňského exstarostu Helmuta Zilka kvůli podezření ze spolupráce s StB. Řád mu in memoriam udělil až Zeman v roce 2019.</div></div>
        <div class="bod"><b>2013</b><div>Vladimír Mišík vyznamenání od Zemana odmítl kvůli rostoucí nevoli z prezidentových rozhodnutí.</div></div>
        <div class="bod"><b>2014</b><div>Zeman ocenil režiséra Filipa Renče, který natočil klip jeho kampaně. Režisér Jan Němec na protest vrátil medaili od Havla.</div></div>
        <div class="bod"><b>2016</b><div>Na seznamu nebyl přeživší holocaustu Jiří Brady, strýc ministra kultury Daniela Hermana. Řada politiků ceremonii bojkotovala.</div></div>
        <div class="bod"><b>2022</b><div>Hana Zagorová ocenění od úřadujícího prezidenta za života odmítla. Zeman jí ho udělil in memoriam.</div></div>`,
      zdroj: 'Podrobnosti a zdroje jsou v článku na DataTimes.cz',
    },
    {
      titulek: 'Jak jsme to počítali',
      obsahOd: 330,
      html: `<p class="velke">Prošli jsme všechny čtyři oficiální seznamy vyznamenaných na hrad.cz: 1&#160;370 vyznamenání z let 1995–2025. U každého jsme dohledali, kdo ho dostal a za co.</p>
        <p class="velke">Počítáme všechna vyznamenání roku, i ta udělená při státních návštěvách, ne jen 28. října. Proto jsou naše počty o něco vyšší než počty z říjnových ceremonií.</p>
        <p class="velke">Počítáme vyznamenání, ne lidi. Oblast, za kterou vyznamenání dostali, jsme určili podle životopisů.</p>`,
    },
    {
      titulek: 'Jaký přístup je vám bližší?',
      obsahOd: 400,
      html: `<p class="velke">Václav Havel rozdával vyznamenání po desítkách, Václav Klaus počty držel na minimu a Havlovy počty kritizoval. Co je vám bližší? Napište nám do komentářů.</p>
        <p class="velke">Dnes večer Petr Pavel předá vyznamenání počtvrté. Sledujte naše sítě.</p>
        <p class="velke" style="color:${POPIS}">Celý článek najdete na DataTimes.cz, odkaz je v biu.</p>`,
    },
  ],
};

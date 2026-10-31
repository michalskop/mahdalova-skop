// Instagram carousel k článku analyza-2026-10-28-statni-vyznamenani-komu (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md).
// Kateřina 30. 10. 2026: nový carousel o tom, KOMU prezidenti vyznamenání dávají (téma článku), jen z grafů článku
// (grafy-z-clanku.cjs → komu/social/grafy/*.png); po vzoru karuselů Moravec.cz jedno zjištění na slide, tip na začátku, názor na konci.
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
const OCEKAVANO = { Havel: 547, Klaus: 229, Zeman: 420, Pavel: 228 }; // Pavel vč. 28. 10. 2026
for (const p of PORADI) if (CELKEM[p] !== OCEKAVANO[p]) throw new Error(`${p}: ${CELKEM[p]} nesedí s článkem`);

const graf = (soubor, top) => svg(G.kartaGrafu(path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'social', 'grafy', soubor), top));
const KOMU = path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'data');

// --- kontrola čísel proti textu článku (graf_obory, graf_rady, graf_druhy) ---
const podle = (soubor) => {
  const o = {}, celkem = {};
  for (const r of require(path.join(KOMU, soubor)).data.values) {
    if (r.pohlaví !== 'muž') continue; // každý řádek je v datech dvakrát (ženy a muži), počet nese oba
    o[`${r.p}|${r.obor}`] = r.počet; celkem[r.p] = (celkem[r.p] || 0) + r.počet;
  }
  return [o, celkem];
};
const proc = (n, z) => Math.round((100 * n) / z);
const [OB, OB_CELKEM] = podle('graf_obory.json');
const [RA, RA_CELKEM] = podle('graf_rady.json');
const ODBOJ = 'protikomunistický odboj a disent';
const ocek = [
  [OB[`Klaus|${ODBOJ}`], 32], [proc(OB[`Klaus|${ODBOJ}`], OB_CELKEM.Klaus), 14], [OB[`Zeman|${ODBOJ}`], 2],
  [OB['Zeman|podnikání'], 33], [proc(OB['Zeman|podnikání'], OB_CELKEM.Zeman), 8], [OB['Havel|podnikání'], 1], [OB['Klaus|podnikání'], 4], [OB['Pavel|podnikání'], 8],
  [proc(OB['Pavel|kultura a umění'], OB_CELKEM.Pavel), 24], [proc(OB['Pavel|věda a vzdělávání'], OB_CELKEM.Pavel), 11], [proc(OB['Pavel|občanská společnost'], OB_CELKEM.Pavel), 11],
  [RA[`Klaus|${ODBOJ}`], 30], [RA_CELKEM.Klaus, 72], [RA['Zeman|zahraniční státníci'], 26], [RA_CELKEM.Zeman, 86], [RA['Pavel|zahraniční státníci'], 10], [RA_CELKEM.Pavel, 54],
];
ocek.forEach(([je, ma], i) => { if (je !== ma) throw new Error(`kontrola ${i}: ${je} ≠ ${ma} z článku`); });
const TGM = Object.fromEntries(require(path.join(KOMU, 'graf_druhy.json')).data.values.filter((r) => r.druh === 'Řád T. G. Masaryka').map((r) => [r.prezident.split(' ').pop(), Math.round(100 * r.podíl)]));
if (TGM.Havel !== 21 || TGM.Klaus !== 21 || TGM.Zeman !== 7 || TGM.Pavel !== 12) throw new Error('podíl Řádu T. G. Masaryka nesedí s článkem');

const ZDROJ_MIMO = 'Počítáme i vyznamenání předaná mimo 28. říjen, např. při státních návštěvách. ' + ZDROJ;
const ZDROJ_OBORY = 'Oblast určila redakce podle životopisu vyznamenaného. ' + ZDROJ.replace('Zdroj: s', 'S');
const ZENY_MUZI = 'Tyrkysově ženy, fialově muži.';
const BODY = `<style>.obsah .bod{font-size:36px;margin-bottom:.6em}.obsah .bod b{font-size:34px;width:36px}</style>`;

module.exports = {
  vystup: path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Který prezident nejčastěji vyznamenával podnikatele?', pod: 'Tipněte si. Odpověď najdete na dalších slidech.', format: { instagram: { t: 66, sub: 34 } } },
      svg: () => medaile('instagram'),
    },
    {
      titulek: 'Klaus vyznamenával nejméně, Havel a Pavel nejvíc',
      pod: `Vyznamenání v ročníku. Celkem Havel ${CELKEM.Havel}, Klaus ${CELKEM.Klaus}, Zeman ${CELKEM.Zeman}, Pavel zatím ${CELKEM.Pavel}.`,
      svg: graf('roky.png', 500),
      zdroj: ZDROJ_MIMO,
    },
    {
      titulek: 'Klaus oceňoval politické vězně, Zeman podnikatele',
      pod: `Podíl oblasti na všech vyznamenáních prezidenta. Klaus dal 32 vyznamenání za odboj proti komunismu, Zeman 2. Zeman ocenil 33 podnikatelů, Havel jednoho. ${ZENY_MUZI}`,
      svg: graf('obory-klaus-zeman.png', 500),
      zdroj: ZDROJ_OBORY,
    },
    {
      titulek: 'Mezi Zemanovými podnikateli jsou i lidé z jeho okolí',
      obsahOd: 450,
      html: `${BODY}<div class="bod"><b>●</b><div><strong>Majitelé firem:</strong> Preciosa, Madeta, Jablotron nebo Agrostroj</div></div>
        <div class="bod"><b>●</b><div><strong>František Čuba:</strong> exšéf JZD Slušovice, zastupitel za Zemanovu SPOZ a člen prezidentova poradního sboru</div></div>
        <div class="bod"><b>●</b><div><strong>Jaroslav Třešňák:</strong> jeden z největších sponzorů Zemanovy kampaně v roce 2018</div></div>
        <div class="bod"><b>●</b><div><strong>Miroslav Toman starší:</strong> ministr zemědělství v komunistické vládě</div></div>
        <div class="bod"><b>●</b><div><strong>Petr Kellner:</strong> zakladatel PPF, Řád Bílého lva in memoriam</div></div>`,
      zdroj: ZDROJ,
    },
    {
      titulek: 'Nejvíc vyznamenání dostávají lidé z kultury',
      pod: `Kultura a umění tvoří pětinu až čtvrtinu vyznamenání. Pavel po ní nejčastěji oceňuje vědce a pedagogy (11 %) a lidi z občanské společnosti (11 %). ${ZENY_MUZI}`,
      svg: graf('obory-nejcasteji.png', 540),
      zdroj: ZDROJ_OBORY,
    },
    {
      titulek: 'Klaus dával řády politickým vězňům, Zeman zahraničním státníkům',
      pod: `Podíl na všech řádech prezidenta (Bílého lva a T. G. Masaryka). Klaus dal 30 ze 72 řádů za odpor proti komunismu, Zeman 26 z 86 státníkům. ${ZENY_MUZI}`,
      svg: graf('rady.png', 560),
      zdroj: ZDROJ_OBORY,
    },
    {
      titulek: 'Zeman skoro přestal udělovat Řád T. G. Masaryka',
      pod: `Podíl druhů vyznamenání. Řád T. G. Masaryka je pro zásluhy o demokracii a lidská práva. U Havla a Klause tvořil ${TGM.Havel} %, u Zemana ${TGM.Zeman} %, u Pavla ${TGM.Pavel} %.`,
      svg: graf('druhy.png', 540),
      zdroj: ZDROJ,
    },
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
    {
      // názor na konci (kapitola 8.1, po vzoru Moravec.cz); stojí na doložených číslech z předchozích slidů
      titulek: 'Koho by měl prezident vyznamenávat?',
      obsahOd: 420,
      html: `<p class="velke">Klaus oceňoval hlavně politické vězně, Zeman podnikatele a zahraniční státníky, Pavel kulturu, vědu a občanskou společnost.</p>
        <p class="velke">Čí výběr je vám nejbližší? Napište nám do komentářů.</p>
        <p class="velke" style="color:${G.POPIS}">Celý článek najdete na DataTimes.cz</p>`,
    },
  ],
};

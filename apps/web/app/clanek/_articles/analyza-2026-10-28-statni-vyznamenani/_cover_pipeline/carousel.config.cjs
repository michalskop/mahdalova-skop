// Instagram carousel k článku o ženách (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md): 7 slidů 1080×1350 + poděkování s QR (generátor).
// Kateřina 30. 10. 2026: grafy jen ty z článku (grafy-z-clanku.cjs → social/grafy/*.png), žádné vlastní překreslené grafy.
// Slide 1 = tip (medaile z coveru), pak ročníky, druhy vyznamenání, jména nositelek řádů, oblasti (graf_obory na dvou slidech)
// a výzva do komentářů. Čísla v titulcích a podtitulcích kontroluje proti datům grafů a tecky.json (stejná čísla jako text článku).
// PW_PATH=<repo>/node_modules/playwright node grafy-z-clanku.cjs
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → social/carousel/01.png … 08.png, text pod carousel v carousel-caption.txt
const path = require('path');
const { medaile, ZENY: TECKA_ZENY, MUZI: TECKA_MUZI } = require('./motiv.cjs'); // barvy teček medaile (cover), ne grafů
const cover = require('./cover.config.cjs');
const G = require('./carousel.grafy.cjs');
const { POPIS, PORADI, svg, zaznamy } = G;

const ZDROJ = 'Zdroj: seznamy vyznamenaných, Kancelář prezidenta republiky; výpočet DataTimes';
const ZDROJ_OBORY = 'Oblast určila redakce podle životopisu vyznamenaného. ' + ZDROJ.replace('Zdroj: s', 'S');
const GRAFY = path.join(__dirname, '..', 'social', 'grafy');
const DATA = path.join(__dirname, '..', 'data');
const graf = (soubor, top) => svg(G.kartaGrafu(path.join(GRAFY, soubor), top));

// --- kontrola čísel proti datům (článek: Pavel 65 z 228, předchůdci 172 z 1 194; řády Pavla 17 z 54) ---
const pocty = Object.fromEntries(PORADI.map((p) => {
  const jeho = zaznamy.filter((z) => z[2] === p && z[1] !== '?');
  return [p, { z: jeho.filter((z) => z[1] === 'Z').length, n: jeho.length }];
}));
const pred = ['Havel', 'Klaus', 'Zeman'].reduce((a, p) => [a[0] + pocty[p].z, a[1] + pocty[p].n], [0, 0]);
if (pocty.Pavel.z !== 65 || pocty.Pavel.n !== 228 || pred[0] !== 172 || pred[1] !== 1194) throw new Error('podíl žen nesedí s článkem');
const rady = require(path.join(DATA, 'graf_druhy_zm.json')).data.values.filter((r) => r.pohlaví === 'žena' && r.p === 'Pavel' && r.druh.startsWith('Řád'));
if (rady.reduce((a, r) => a + r.ženy, 0) !== 17 || rady.reduce((a, r) => a + r.počet, 0) !== 54) throw new Error('řády Pavla nesedí s článkem');
const obory = {};
for (const r of require(path.join(DATA, 'graf_obory.json')).data.values) {
  if (r.pohlaví !== 'žena') continue;
  obory[r.obor] = obory[r.obor] || [0, 0];
  obory[r.obor][0] += r.ženy; obory[r.obor][1] += r.počet;
}
const OBORY_CLANEK = { 'občanská společnost': [35, 85], sport: [23, 68], 'protikomunistický odboj a disent': [24, 86], 'kultura a umění': [62, 299],
  'věda a vzdělávání': [26, 157], 'medicína': [14, 74], 'politika, stát a justice': [6, 70], 'podnikání': [3, 46], 'církev': [3, 56] };
for (const [o, [z, n]] of Object.entries(OBORY_CLANEK)) if (obory[o][0] !== z || obory[o][1] !== n) throw new Error(`${o}: ${obory[o]} nesedí s článkem`);
const valka = obory['válka a protinacistický odboj'], armada = obory['armáda, policie, záchranáři'];
if (valka[0] + armada[0] !== 12 || valka[1] + armada[1] !== 302 || valka[0] !== 11 || valka[1] !== 199) throw new Error('válka a armáda nesedí s článkem (12 z 302)');

const POD_OBORY = 'Podíl oblasti na všech vyznamenáních prezidenta, ženy vlevo, muži vpravo.';

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Za kterého prezidenta dostaly ženy největší podíl vyznamenání?', pod: 'Tipněte si. Odpověď najdete na dalších slidech.', legenda: [[TECKA_ZENY, 'žena'], [TECKA_MUZI, 'muž']], format: { instagram: { t: 64, sub: 34 } } },
      svg: () => medaile('instagram'),
    },
    {
      titulek: 'Za Pavla dostaly ženy 29&#160;% vyznamenání, dřív 14&#160;%',
      pod: 'Počet vyznamenání v ročníku, ženy vlevo, muži vpravo',
      svg: graf('zeny-roky.png', 400),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Nejvyšší řády dostávají skoro jen muži',
      pod: 'Počet vyznamenání podle druhu, 1995–2026, ženy vlevo, muži vpravo. Každá dlaždice má vlastní měřítko. Za Pavla dostaly ženy 17 z 54 řádů.',
      svg: graf('druhy-zm.png', 520),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Nejvyšší řády od Pavla dostaly mimo jiné',
      obsahOd: 380,
      html: `<style>.obsah .bod{font-size:42px}.obsah .bod b{font-size:40px;width:36px}</style><div class="bod"><b>●</b><div><strong>Letos Bílého lva:</strong> gymnastka Věra Čáslavská in memoriam, fyzioložka Helena Illnerová, herečka Iva Janžurová</div></div>
        <div class="bod"><b>●</b><div><strong>Dříve Bílého lva:</strong> architektka Eva Jiřičná, tenistka Martina Navrátilová, in memoriam jaderná inženýrka Dana Drábová</div></div>
        <div class="bod"><b>●</b><div><strong>Řád T. G. Masaryka:</strong> zpěvačka a mluvčí Charty 77 Marta Kubišová, disidentka a bývalá ombudsmanka Anna Šabatová, politická vězenkyně Jarmila Stibicová</div></div>
        <div class="bod"><b>●</b><div><strong>Ze zahraničí:</strong> slovenská prezidentka Zuzana Čaputová a nizozemská královna Máxima</div></div>`,
      zdroj: ZDROJ,
    },
    {
      titulek: 'Nejvíc žen je mezi oceněnými za občanskou společnost a sport',
      pod: `${POD_OBORY} Ženy: občanská společnost 35 z 85, sport 23 z 68, odboj a disent 24 z 86.`,
      svg: graf('obory-nejvic.png', 560),
      zdroj: ZDROJ_OBORY,
    },
    {
      titulek: 'Nejméně žen je mezi oceněnými za politiku, podnikání a církev',
      pod: `${POD_OBORY} Ženy: politika 6 ze 70, podnikání 3 ze 46, církev 3 z 56, válka a odboj 11 ze 199.`,
      svg: graf('obory-nejmene.png', 560),
      zdroj: ZDROJ_OBORY,
    },
    {
      titulek: 'Koho byste na státní vyznamenání navrhli vy?',
      obsahOd: 420,
      html: `<p class="velke">Napište nám do komentářů, kterou ženu by podle vás měl prezident ocenit.</p>
        <p class="velke">Letos Petr Pavel předal vyznamenání počtvrté.</p>
        <p class="velke" style="color:${POPIS}">Celý článek najdete na DataTimes.cz</p>`,
    },
  ],
};

// Instagram carousel k článku o ženách (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md): 7 slidů 1080×1350.
// Slide 1 = tip (medaile z coveru), pak po jednom zjištění v pořadí článku a výzva do komentářů (Kateřina 28. 10.: bez metody).
// Počty žen a vyznamenání počítá z tecky.json (02_analyza.py) a kontroluje proti číslům v textu článku;
// řády a oblasti jsou z _data_pipeline/vystup.txt, stejně jako v článku.
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → social/carousel/01.png … 07.png, text pod carousel v carousel-caption.txt
const path = require('path');
const { medaile, ZENY: TECKA_ZENY, MUZI: TECKA_MUZI } = require('./motiv.cjs'); // barvy teček medaile (cover), ne grafů
const cover = require('./cover.config.cjs');
const G = require('./carousel.grafy.cjs');
const { KREM, POPIS, ZENY, MUZI, PORADI, svg, text, f1, zaznamy } = G;

const JMENO = { Havel: 'Václav Havel', Klaus: 'Václav Klaus', Zeman: 'Miloš Zeman', Pavel: 'Petr Pavel' };
const ZDROJ = 'Zdroj: seznamy vyznamenaných, Kancelář prezidenta republiky; výpočet DataTimes';

// ženy / vyznamenání se známým pohlavím podle prezidenta
const pocty = Object.fromEntries(PORADI.map((p) => {
  const jeho = zaznamy.filter((z) => z[2] === p && z[1] !== '?');
  return [p, { z: jeho.filter((z) => z[1] === 'Z').length, n: jeho.length }];
}));
const OCEKAVANO = { Havel: [71, 546], Klaus: [37, 228], Zeman: [64, 420], Pavel: [65, 228] }; // vystup.txt, článek (vč. 28. 10. 2026)
for (const p of PORADI) if (pocty[p].z !== OCEKAVANO[p][0] || pocty[p].n !== OCEKAVANO[p][1]) throw new Error(`${p}: ${pocty[p].z} z ${pocty[p].n} nesedí s článkem`);
const procento = (z, n) => `${Math.round((100 * z) / n)}&#160;%`;

// --- slide 2: podíl žen podle prezidenta ---
function grafPodil() {
  return svg(G.pruhy(PORADI.map((p) => ({
    popis: JMENO[p],
    hodnota: pocty[p].z / pocty[p].n,
    stitek: procento(pocty[p].z, pocty[p].n),
    male: `${pocty[p].z} ${p === 'Zeman' ? 'ze' : 'z'} ${pocty[p].n}`,
    barva: p === 'Pavel' ? ZENY : '#1a9fbd', // brandTeal.5 tlumeněji u předchůdců
  })), { y0: 600, max: 0.4, x1: 800 }));
}

// --- slide 3: ženy a muži po letech ---
function grafRoky() {
  const roky = {};
  for (const [rok, poh] of zaznamy) {
    roky[rok] = roky[rok] || { Z: 0, M: 0 };
    if (poh !== '?') roky[rok][poh]++;
  }
  const kontrola = [[2023, 16, 65], [2024, 20, 59], [2025, 13, 51], [2026, 16, 54]]; // článek: 16 z 65, 20 z 59, 13 z 51, 16 z 54
  for (const [r, z, n] of kontrola) if (roky[r].Z !== z || roky[r].Z + roky[r].M !== n) throw new Error(`rok ${r} nesedí`);
  let s = G.sloupceRoky((r) => [{ n: roky[r].Z, barva: ZENY }, { n: roky[r].M, barva: MUZI }], { y0: 700, y1: 1150, max: 110 });
  s += G.legenda([[ZENY, 'ženy'], [MUZI, 'muži']], 120, 650);
  return svg(s);
}

// --- slide 4: ženy v nejvyšších řádech (Bílý lev + TGM), vystup.txt ---
const RADY = { Havel: [16, 180], Klaus: [11, 72], Zeman: [8, 86], Pavel: [17, 54] };
const RADY_ZE = { Havel: 'ze', Klaus: 'ze', Zeman: 'z', Pavel: 'z' };
function grafRady() {
  return svg(G.pruhy(PORADI.map((p) => ({
    popis: JMENO[p],
    hodnota: RADY[p][0] / RADY[p][1],
    stitek: procento(...RADY[p]),
    male: `${RADY[p][0]} ${RADY_ZE[p]} ${RADY[p][1]} řádů`,
    barva: p === 'Pavel' ? ZENY : '#1a9fbd',
  })), { y0: 600, max: 0.4, x1: 800 }));
}

// --- slide 6: podíl žen podle oblasti (text článku, vystup.txt) ---
const OBLASTI = [
  ['občanská společnost', 35, 85, 'z'],
  ['sport', 23, 68, 'z'],
  ['odpor proti komunismu', 24, 86, 'z'],
  ['kultura a umění', 62, 299, 'z'],
  ['medicína', 14, 74, 'ze'],
  ['věda a vzdělávání', 26, 157, 'ze'],
  ['politika, stát a justice', 6, 70, 'ze'],
  ['podnikání', 3, 46, 'ze'],
  ['církev', 3, 56, 'z'],
  ['válka, odboj, armáda', 12, 302, 'z'],
];
function grafOblasti() {
  const [xb, xmax] = [500, 860], y0 = 610, krok = 57;
  let s = '';
  OBLASTI.forEach(([nazev, z, n, pred], i) => {
    const y = y0 + i * krok, sirka = Math.max(4, (z / n / 0.45) * (xmax - xb));
    s += text(xb - 20, y + 30, nazev, { size: 27, w: 500, fill: KREM, anchor: 'end' });
    s += `<rect x="${xb}" y="${y + 6}" width="${f1(sirka)}" height="36" rx="4" fill="${ZENY}"/>`;
    s += text(xb + sirka + 14, y + 33, `${procento(z, n)}`, { size: 28, w: 700, fill: KREM });
    s += text(xb + sirka + 92, y + 33, `${z} ${pred} ${n}`, { size: 22, fill: POPIS, opacity: 0.85 });
  });
  return svg(s);
}

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Za kterého prezidenta dostaly ženy největší podíl vyznamenání?', pod: 'Tipněte si. Odpověď najdete na dalších slidech.', legenda: [[TECKA_ZENY, 'žena'], [TECKA_MUZI, 'muž']], format: { instagram: { t: 64, sub: 34 } } },
      svg: () => medaile('instagram'),
    },
    {
      titulek: 'Za Petra Pavla dostaly ženy 29&#160;% vyznamenání, za předchůdců 14&#160;%',
      pod: 'Podíl vyznamenání, která prezident udělil ženám, 1995–2026 (včetně 28. 10. 2026)',
      svg: grafPodil(),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Za Pavla dostávají ženy každý rok aspoň čtvrtinu vyznamenání',
      pod: 'Počet vyznamenání v ročníku. 2023: 16 z 65, 2024: 20 z 59, 2025: 13 z 51, 2026: 16 z 54',
      svg: grafRoky(),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Z 54 nejvyšších řádů, které udělil Pavel, dostaly ženy 17',
      pod: 'Řád Bílého lva a Řád T. G. Masaryka: podíl žen',
      svg: grafRady(),
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
      pod: 'Podíl žen podle oblasti, za kterou vyznamenání dostali, 1995–2026',
      svg: grafOblasti(),
      zdroj: 'Oblast určila redakce podle životopisu vyznamenaného. ' + ZDROJ.replace('Zdroj: s', 'S'),
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

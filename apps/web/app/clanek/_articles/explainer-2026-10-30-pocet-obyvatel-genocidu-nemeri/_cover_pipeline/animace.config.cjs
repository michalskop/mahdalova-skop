// Animace „křivky obyvatel“: pět křivek indexu počtu obyvatel (rok před začátkem genocidy = 100) se kreslí rok po roku
// od 5 let před do 6 let po začátku genocidy. Data a kresba z motiv.cjs (krivky.json ← _data_pipeline/krivky.py),
// štítek, barvy a pozadí z cover.config.cjs, titulek a podtitulek z frontmatteru článku (coverTitulek, coverPodtitulek).
// První i poslední snímek = plný stav (hlavní sdělení, náhled videa a GIFu); smyčka navazuje bez skoku.
// Logo nahoře (výstupy pro sítě, dole ho překrývá ovládání Instagramu).
// PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <tento soubor> [--nahledy <složka> [--jen-nahledy]]
// → social/animace/krivky-{story,instagram,square}.mp4 + krivky.gif (ze čtverce, šířka 800)
const fs = require('fs');
const path = require('path');
const { graf, FORMATY, T0, T1 } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');

// texty coveru přímo z frontmatteru článku (stejný zdroj jako cover-generator.cjs)
const fm = fs.readFileSync(path.join(__dirname, '..', 'index.md'), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
const pole = (k) => { const m = fm.match(new RegExp(`^${k}:\\s*"(.*)"\\s*$`, 'm')); if (!m) throw new Error(`frontmatter: chybí ${k}`); return m[1]; };

// Rozvržení grafu pro animace: logo je nahoře, dole je místo na popisky osy času a poznámku na jeden řádek
const POZN1 = ['Počet obyvatel země kolem začátku genocidy, rok před = 100', 'Zdroj: Světová banka'];
const L = {
  square: { ...FORMATY.square, plot: [110, 525, 790, 880], osa: true, pozn: [70, 1004, 20], poznRadky: POZN1 },
  instagram: { ...FORMATY.instagram, plot: [110, 600, 790, 1090], osa: true, pozn: [70, 1234, 21], poznRadky: POZN1 },
  story: { ...FORMATY.story, plot: [120, 790, 780, 1380], osa: true, pozn: [80, 1542, 24], poznRadky: POZN1 },
};

// Časová osa (s): PLNY drží plný stav, ZPET křivky stáhne na začátek, PAUZA, pak rok po roku (KROK s na rok), KONEC drží plný stav
const PLNY = 1.2, ZPET = 0.45, PAUZA = 0.35, KROK = 0.45, KONEC = 1.6;
const START = PLNY + ZPET + PAUZA;
const KRESBA = (T1 - T0) * KROK;
const TRVANI = +(START + KRESBA + KONEC).toFixed(2);
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

function stav(t) {
  if (t < PLNY) return { konec: T1, popisky: 1 };
  if (t < PLNY + ZPET) { const x = ease((t - PLNY) / ZPET); return { konec: T1 - x * (T1 - T0), popisky: Math.max(0, 1 - x * 2.5) }; }
  if (t < START) return { konec: T0, popisky: 0 };
  if (t < START + KRESBA) {
    // křivky tečou plynule celou dobou kresby, bez zastavení na jednotlivých letech (Kateřina 29. 10. 2026:
    // „ať není trhaný, nech to téct plynule“); jen rozjezd a dojezd jsou jemně zpomalené
    const x = (t - START) / KRESBA;
    const plynule = 0.75 * x + 0.25 * (0.5 - Math.cos(Math.PI * x) / 2);
    return { konec: T0 + plynule * (T1 - T0), popisky: 0 };
  }
  return { konec: T1, popisky: Math.min(1, (t - START - KRESBA) / 0.35) };
}

function snimek(t, klic) {
  const { konec, popisky } = stav(t);
  return graf(klic, { L: L[klic], konec, popisky });
}

module.exports = {
  nazev: 'krivky',
  cover: {
    ...cover,
    titulek: pole('coverTitulek'),
    pod: pole('coverPodtitulek'),
    legenda: null,
    logo: 'nahore',
  },
  vystup: path.join(__dirname, '..', 'social', 'animace'),
  fps: 30,
  trvani: TRVANI,
  formaty: ['story', 'instagram', 'square'],
  snimek,
  gif: { format: 'square', sirka: 800, fps: 25 },
  nahledy: [0, PLNY + ZPET * 0.5, START + 0.1, START + 5 * KROK + 0.2, START + KRESBA - 0.1, TRVANI - 0.04],
};

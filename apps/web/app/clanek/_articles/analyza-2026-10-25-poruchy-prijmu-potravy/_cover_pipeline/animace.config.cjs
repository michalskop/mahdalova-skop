// Animace „slunečnice“: disk z teček roste rok po roku 2010 → dnes (data 2025), 1 tečka = 10 dívek do 18 let
// s poruchou příjmu potravy. Počty jsou čtené přímo z _data_pipeline/vystup.txt (tabulka NZIP NR-04-25),
// barvy a zlatý úhel z motiv.cjs, štítek, pozadí a logo z cover.config.cjs.
// Jedno sdělení (Kateřina 25. 10.): „Dívek s poruchou příjmu potravy je dnes třikrát víc než v roce 2010“ –
// žádná přesná čísla v obraze, počítadlo ukazuje jen rok a na konci „dnes“; legenda pod slunečnicí,
// „1 tečka = 10 dívek“ svisle u pravého okraje.
// PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <tento soubor> [--nahledy <složka> [--jen-nahledy]]
// → social/animace/slunecnice-{story,instagram,square}.mp4 + slunecnice.gif
const fs = require('fs');
const path = require('path');
const { ZLATY, N0, barvy } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');

const { ORANZ, TLUM, ZARE, POPIS, NAVY } = barvy;
const NOVA = '#fda668'; // brandOrange.3 – tečky, které přibyly v právě ukazovaném roce
const KREM = '#f8f6f0'; // jako popisky na coverech
const W = { story: [1080, 1920], instagram: [1080, 1350], square: [1080, 1080], homepage: [1500, 1200] };

// rok | dívky | … z výstupu datové pipeline článku
const DIVKY = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8')
    .split('\n').map((r) => r.match(/^(20\d\d) \| (\d+) \|/)).filter(Boolean).map((m) => [+m[1], +m[2]]),
);
const ROKY = Object.keys(DIVKY).map(Number).sort((a, b) => a - b);
if (ROKY[0] !== 2010 || ROKY.at(-1) !== 2025 || ROKY.length !== 16) throw new Error('vystup.txt: čekám roky 2010–2025');
const TECKY = ROKY.map((r) => Math.round(DIVKY[r] / 10));
const NMAX = Math.max(...TECKY);

// Časová osa (s): začíná i končí stavem „dnes“ (první snímek = náhled videa i GIFu, smyčka navazuje).
// DNES drží plnou slunečnici, SBAL ji stáhne zvenku dovnitř na rok 2010, UVOD drží 2010, pak rok po roku, KONEC drží dnes.
const DNES = 0.9, SBAL = 0.35, UVOD = 0.5, KROK = 0.35, KONEC = 1.0;
const T2010 = DNES + SBAL + UVOD; // začátek růstu
const kroky = ROKY.slice(1).map((rok, k) => [rok, T2010 + k * KROK, T2010 + (k + 1) * KROK]);
const TRVANI = +(T2010 + kroky.length * KROK + KONEC).toFixed(2);

const rokV = (t) => (t < DNES ? ROKY.at(-1) : kroky.filter(([, a]) => t >= a).at(-1)?.[0] ?? 2010);
const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
function stavTecky(i, t) {
  // vrací [měřítko 0–1.1, barva]
  const zaklad = i < N0 ? TLUM : ORANZ;
  // úvod: plná dnešní slunečnice, pak se tečky navíc proti roku 2010 stáhnou zvenku dovnitř
  if (t < DNES + SBAL) {
    if (i >= TECKY.at(-1)) return [0, zaklad];
    if (i < TECKY[0] || t < DNES) return [1, zaklad];
    const start = DNES + SBAL * 0.6 * ((TECKY.at(-1) - 1 - i) / (TECKY.at(-1) - TECKY[0]));
    return [1 - Math.min(1, Math.max(0, (t - start) / 0.14)), zaklad];
  }
  let vid = i < TECKY[0] ? 1 : 0, barva = zaklad;
  for (let k = 0; k < kroky.length; k++) {
    const [, a, b] = kroky[k];
    const pred = i < TECKY[k], po = i < TECKY[k + 1];
    if (pred === po || t < a) continue;
    // změna se v rámci kroku rozloží podle pořadí tečky (zevnitř ven); v letech, kdy dívek ubylo, tečky zmizí
    const lo = Math.min(TECKY[k], TECKY[k + 1]), hi = Math.max(TECKY[k], TECKY[k + 1]);
    const start = a + (b - a) * 0.6 * ((i - lo) / Math.max(1, hi - lo));
    const x = Math.min(1, Math.max(0, (t - start) / 0.22));
    vid = po ? easeOutBack(x) : 1 - x;
    // přibylé tečky jsou světlé po celý svůj rok, u posledního kroku jen krátce
    barva = po && t < (kroky[k + 1]?.[1] ?? b + 0.45) ? NOVA : zaklad;
  }
  return [vid, barva];
}

// Rozvržení: disk [cx, cy, R] vpravo pod titulkem, rok vlevo [x, účaří, velikost] – lícuje vlevo s titulkem
// (Kateřina 25. 10.),
// legenda pod diskem [účaří, velikost], svislý popisek u pravého okraje [x].
const L = {
  instagram: { disk: [720, 895, 290], rok: [70, 830, 120], leg: [1232, 25], svisle: 1046 },
  square: { disk: [760, 728, 228], rok: [70, 700, 100], leg: [1004, 23], svisle: 1048 },
  story: { disk: [690, 1100, 310], rok: [80, 960, 124], leg: [1458, 28], svisle: 1046 },
  // homepage karta webu 5:4: disk vpravo dole, legenda pod letopočtem vlevo (pod diskem není místo),
  // pravý horní roh x ≥ 950, y ≤ 280 prázdný (štítek rubriky), logo dole vlevo jako na coveru
  homepage: { disk: [1170, 870, 275], rok: [180, 845, 110], leg: [0, 26], legVlevo: [180, 905], svisle: 1478 },
};
const f1 = (v) => v.toFixed(1);
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const sirka = (s, size) => s.length * size * 0.53; // odhad šířky Plex Sans 500

function snimek(t, klic) {
  const [FW, FH] = W[klic];
  const { disk: [cx, cy, R], rok: [px, py, fr], leg: [ly, fl], svisle } = L[klic];
  const c = R / Math.sqrt(TECKY.at(-1) + 0.5);
  const r = c * 0.56;
  let s = `<defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity=".5"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.45)}" fill="url(#zare)"/>`;
  for (let i = 0; i < NMAX; i++) {
    const [k, barva] = stavTecky(i, t);
    if (k <= 0.01) continue;
    const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
    s += `<circle cx="${f1(cx + rr * Math.cos(a))}" cy="${f1(cy + rr * Math.sin(a))}" r="${f1(r * k)}" fill="${barva}"/>`;
  }
  const halo = (size) => `stroke="${NAVY}" stroke-width="${f1(size * 0.14)}" stroke-linejoin="round" paint-order="stroke"`;
  // rok; po posledním kroku „dnes“
  const rok = rokV(t);
  const napis = rok === ROKY.at(-1) ? 'dnes' : rok;
  s += `<text x="${px}" y="${py}" font-family="${SANS}" font-weight="600" font-size="${fr}" fill="${KREM}" ${halo(fr)}>${napis}</text>`;
  // legenda pod diskem, na střed disku (homepage: pod sebou pod letopočtem)
  const polozky = [[TLUM, 'v léčbě v roce 2010'], [ORANZ, 'přibylo do dneška']];
  const mezera = fl * 1.4, kr = fl * 0.3;
  const legVlevo = L[klic].legVlevo;
  if (legVlevo) polozky.forEach(([barva, txt], j) => {
    const [lx, ly0] = legVlevo, yy = ly0 + j * fl * 1.6;
    s += `<circle cx="${f1(lx + kr)}" cy="${f1(yy - fl * 0.34)}" r="${f1(kr)}" fill="${barva}" stroke="${KREM}" stroke-width="1.5"/>`;
    s += `<text x="${f1(lx + kr * 2 + fl * 0.4)}" y="${f1(yy)}" font-family="${SANS}" font-weight="500" font-size="${fl}" fill="${POPIS}" ${halo(fl)}>${txt}</text>`;
  });
  else {
  const sirky = polozky.map(([, txt]) => kr * 2 + fl * 0.4 + sirka(txt, fl));
  let x = cx - (sirky.reduce((a, b) => a + b, 0) + mezera) / 2;
  polozky.forEach(([barva, txt], j) => {
    s += `<circle cx="${f1(x + kr)}" cy="${f1(ly - fl * 0.34)}" r="${f1(kr)}" fill="${barva}" stroke="${KREM}" stroke-width="1.5"/>`;
    s += `<text x="${f1(x + kr * 2 + fl * 0.4)}" y="${ly}" font-family="${SANS}" font-weight="500" font-size="${fl}" fill="${POPIS}" ${halo(fl)}>${txt}</text>`;
    x += sirky[j] + mezera;
  });
  }
  // „1 tečka = 10 dívek“ svisle u pravého okraje, na střed disku (čte se zdola nahoru)
  s += `<text transform="translate(${svisle} ${cy}) rotate(-90)" text-anchor="middle" font-family="${SANS}" font-weight="500" font-size="${f1(fl * 0.85)}" letter-spacing="1" fill="${POPIS}" opacity=".8">1 tečka = 10 dívek</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}">${s}</svg>`;
}

module.exports = {
  nazev: 'slunecnice',
  cover: {
    ...cover,
    titulek: 'Dívek s&nbsp;poruchou<br>příjmu potravy<br>je dnes třikrát víc',
    pod: 'než v&nbsp;roce 2010',
    legenda: null,
    logo: 'nahore', // dole ho překrývá ovládání Instagramu a Reels
  },
  vystup: path.join(__dirname, '..', 'social', 'animace'),
  fps: 30,
  trvani: TRVANI,
  formaty: ['story', 'instagram', 'square', 'homepage'],
  coverPro: { homepage: { logo: 'vlevo', format: { homepage: { ...cover.format.homepage, t: 86, sub: 36 } } } },
  snimek,
  gif: [
    { format: 'square', sirka: 800, fps: 15 },
    // homepage karta článku (frontmatter homepageImage); první snímek = stav „dnes“
    { format: 'homepage', sirka: 1000, fps: 15, cil: path.join(__dirname, '..', 'images', 'cover-homepage-animace.gif') },
  ],
  nahledy: [0, DNES + SBAL * 0.6, T2010, T2010 + 2.5, TRVANI - 0.05],
};

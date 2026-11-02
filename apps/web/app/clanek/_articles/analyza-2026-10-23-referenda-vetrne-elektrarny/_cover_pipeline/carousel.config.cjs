// Instagram carousel k článku (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md): 8 slidů 1080×1350.
// Slide 1 = cover s mapou turbín, pak po jednom zjištění v pořadí článku, jak jsme to počítali a odkaz na článek.
// Čísla jen z ../_data_pipeline/build.py (obce.json, roky.json, vystup.txt).
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů] [--story]
// → social/carousel/01.png … 08.png (s --story social/carousel-story/)
const path = require('path');
const { kresli, obce, barvy } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');
const { roky, kacice } = require('./roky.json');

const { PROTI, PRO } = barvy; // brandYellow.6, brandTeal.4
const SEDA = '#bcc4df'; // brandNavy.2 – neplatná referenda
const KREM = '#f8f6f0';
const POPIS = '#fff7d9'; // brandYellow.1, jako podtitulek coveru
const NAVY = '#101432';
const W = 1080, H = 1350;
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const f1 = (v) => v.toFixed(1);
const svg = (obsah) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${obsah}</svg>`;
const text = (x, y, obsah, { size = 26, w = 500, fill = POPIS, anchor = 'start', op = 1 } = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="${SANS}" font-weight="${w}" font-size="${size}" fill="${fill}" opacity="${op}">${obsah}</text>`;
const legenda = (x, y, polozky, size = 26) => {
  let s = '', xx = x;
  for (const [barva, popis] of polozky) {
    s += `<rect x="${xx}" y="${y - size * 0.75}" width="${size * 0.8}" height="${size * 0.8}" rx="4" fill="${barva}"/>`;
    s += text(xx + size * 1.15, y, popis, { size, fill: KREM });
    xx += size * 1.15 + popis.length * size * 0.53 + size * 1.3;
  }
  return s;
};

// --- slide 2: referenda podle roku, sloupce proti / pro / neplatná ---
function grafRoky() {
  const R = Object.entries(roky).map(([rok, d]) => ({ rok: +rok, ...d }));
  const [x0, x1, y0, y1] = [100, 1000, 700, 1150];
  const max = 35, krok = (x1 - x0) / R.length, sirka = krok * 0.72;
  const y = (v) => y1 - (v / max) * (y1 - y0);
  let s = legenda(x0, 640, [[PROTI, 'většina proti'], [PRO, 'většina pro'], [SEDA, 'neplatné']]);
  for (const v of [10, 20, 30]) s += `<line x1="${x0}" x2="${x1}" y1="${f1(y(v))}" y2="${f1(y(v))}" stroke="${KREM}" stroke-opacity=".12"/>` + text(x0 - 14, y(v) + 8, v, { size: 22, anchor: 'end', fill: KREM, op: 0.55 });
  for (const [i, d] of R.entries()) {
    const x = x0 + i * krok + (krok - sirka) / 2;
    let base = 0;
    for (const [k, barva] of [['proti', PROTI], ['pro', PRO], ['neplatné', SEDA]]) {
      const v = d[k];
      if (!v) continue;
      s += `<rect x="${f1(x)}" y="${f1(y(base + v))}" width="${f1(sirka)}" height="${f1(y(base) - y(base + v))}" fill="${barva}"/>`;
      base += v;
    }
    if (d.rok === 2025 || d.rok === 2026) s += text(x + sirka / 2, y(base) - 14, `${d.proti} : ${d.pro}`, { size: 26, w: 700, fill: KREM, anchor: 'middle' });
    if ([2006, 2010, 2015, 2020, 2026].includes(d.rok)) s += text(x + sirka / 2, y1 + 38, d.rok, { size: 24, anchor: 'middle', fill: KREM });
  }
  s += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${KREM}" stroke-opacity=".5"/>`;
  return svg(s);
}

// --- slide 3: Kačice, anketa 2024 × referendum 2026 ---
function grafKacice() {
  const [x0, x1] = [70, 880];
  const x = (v) => x0 + (v / 400) * (x1 - x0);
  let s = legenda(70, 640, [[PROTI, 'proti větrníkům'], [PRO, 'pro výstavbu']], 28), yy = 690;
  for (const [nazev, d] of [['Anketa 2024', kacice.anketa], ['Referendum 2026', kacice.referendum]]) {
    yy += 50;
    s += text(70, yy - 16, nazev, { size: 32, w: 600, fill: KREM });
    for (const [k, barva] of [['proti', PROTI], ['pro', PRO]]) {
      s += `<rect x="${x0}" y="${yy}" width="${f1(x(d[k]) - x0)}" height="56" rx="4" fill="${barva}"/>`;
      s += text(x(d[k]) + 16, yy + 41, d[k], { size: 38, w: 700, fill: KREM });
      yy += 66;
    }
    yy += 40;
  }
  return svg(s);
}

// --- slide 4: všech 21 obcí, podíl hlasů proti × pro ---
function grafObce() {
  const R = [...obce].map((o) => ({ ...o, podil: (o.proti / (o.proti + o.pro)) * 100 })).sort((a, b) => b.podil - a.podil);
  const [x0, x1, y0] = [330, 1010, 600];
  const radek = 29.5, vyska = 23;
  const x = (v) => x0 + (v / 100) * (x1 - x0);
  let s = legenda(70, 560, [[PROTI, 'hlasy proti'], [PRO, 'hlasy pro']], 26);
  R.forEach((o, i) => {
    const y = y0 + i * radek;
    s += text(x0 - 14, y + vyska - 4, o.obec, { size: 22, anchor: 'end', fill: KREM, w: o.vysledek === 'pro výstavbu' ? 700 : 500 });
    s += `<rect x="${x0}" y="${f1(y)}" width="${f1(x(o.podil) - x0)}" height="${vyska}" fill="${PROTI}"/>`;
    s += `<rect x="${f1(x(o.podil))}" y="${f1(y)}" width="${f1(x1 - x(o.podil))}" height="${vyska}" fill="${PRO}"/>`;
    s += text(x0 + 8, y + vyska - 4, `${Math.round(o.podil)} %`, { size: 18, w: 700, fill: NAVY });
  });
  s += `<line x1="${f1(x(50))}" x2="${f1(x(50))}" y1="${y0 - 8}" y2="${f1(y0 + R.length * radek)}" stroke="${NAVY}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  s += text(x(50), y0 + R.length * radek + 30, 'polovina hlasů', { size: 20, anchor: 'middle', fill: KREM, op: 0.7 });
  return svg(s);
}

const bod = (n, obsah) => `<div class="bod"><b style="color:${PROTI}">${n}</b><div>${obsah}</div></div>`;

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  slidy: [
    { cover, svg: (klic) => kresli(klic) },
    {
      titulek: 'Ještě loni dopadala referenda napůl, letos skoro všechna proti',
      pod: 'Místní referenda o&nbsp;větrnících podle roku a&nbsp;vítězné odpovědi. Rok 2026 do 10. října.',
      svg: grafRoky(),
      zdroj: 'Zdroj: MV ČR, místní referenda; zápisy komisí; výpočet DataTimes.cz',
    },
    {
      titulek: 'Referendum přivedlo k&nbsp;urnám hlavně odpůrce',
      pod: 'Kačice na Kladensku: anketa obce v&nbsp;roce 2024 a&nbsp;závazné referendum letos. Počet hlasů.',
      svg: grafKacice(),
      html: '<div class="male">Anketa a referendum nejsou totéž: v anketě hlasovalo 377 z 986 lidí, kteří dostali lístek, v referendu 661 z 1 008 oprávněných. Z čísel nejde vyčíst, že by lidé změnili názor.</div>',
      obsahOd: 1115,
      zdroj: 'Zdroj: obec Kačice – výsledky ankety a zápis o výsledku referenda',
    },
    {
      titulek: 'Odmítly skoro všechny obce, ale ne všude drtivě',
      pod: 'Podíl hlasů proti a&nbsp;pro výstavbu v&nbsp;21 referendech 9.–10. října',
      svg: grafObce(),
      zdroj: 'Zdroj: zápisy místních komisí; MV ČR; výpočet DataTimes.cz',
    },
    {
      titulek: 'Často se nehlasovalo o&nbsp;konkrétní stavbě',
      obsahOd: 420,
      html: bod('12', '<strong>obcí</strong> mělo konkrétní projekt se známým investorem, nejčastěji ČEZ.')
        + bod('9', '<strong>obcí</strong> žádný projekt nemělo. Hlasovaly o akcelerační oblasti, o nabídce firmy nebo obecně.')
        + `<div class="velke" style="margin-top:1.4em">Nejjednoznačněji odmítly akcelerační oblast Teplýšovice na Benešovsku: <strong style="color:${PROTI}">258</strong> hlasů proti, <strong style="color:${PRO}">19</strong> pro. Vláda oblast v červenci schválila.</div>`,
      zdroj: 'Zdroj: zápisy místních komisí; usnesení obcí; vláda ČR',
    },
    {
      titulek: 'Další obce budou hlasovat do konce listopadu',
      obsahOd: 400,
      html: `<div class="bod"><b style="color:${PROTI};width:250px;font-size:56px">30. 10.</b><div>Břidličná, Bruntálsko</div></div>
        <div class="bod"><b style="color:${PROTI};width:250px;font-size:56px">7. 11.</b><div>Úpice, Trutnovsko</div></div>
        <div class="bod"><b style="color:${PROTI};width:250px;font-size:56px">27. 11.</b><div>Tatce, Kolínsko</div></div>
        <div class="velke" style="margin-top:1.2em">Co si před hlasováním ohlídat: co v otázce znamená ANO, kdo na besedách mluví a za koho, a jestli se čísla z anket a slibů dají ověřit.</div>`,
      zdroj: 'Zdroj: MV ČR, oznámená místní referenda',
    },
    {
      titulek: 'Jak jsme to počítali',
      obsahOd: 330,
      html: `<p class="velke" style="font-size:40px">Výsledky všech 21 referend jsme opsali ze zápisů místních komisí na webech obcí a porovnali s tabulkou ministerstva vnitra.</p>
        <p class="velke" style="font-size:40px">Referenda od roku 2006 jsou z evidence ministerstva. U každé otázky jsme určili, jestli ANO znamená souhlas, nebo nesouhlas s větrníky.</p>
        <p class="velke" style="font-size:40px">Ruskou stopu v kampaních proti větrníkům zatím nikdo nedoložil. Prověřujeme ji obec po obci.</p>`,
    },
    {
      titulek: 'Celý rozbor najdete na DataTimes.cz',
      obsahOd: 470,
      html: `<p class="velke">Odkaz je v biu. V článku jsou výsledky všech 21 obcí, referenda od roku 2006, ankety proti referendům a co víme o kampaních.</p>`,
      svg: (klic) => kresli(klic, { plocha: klic === 'story' ? [40, 1000, 1040, 1560] : [60, 760, 1020, 1230] }),
    },
  ],
};

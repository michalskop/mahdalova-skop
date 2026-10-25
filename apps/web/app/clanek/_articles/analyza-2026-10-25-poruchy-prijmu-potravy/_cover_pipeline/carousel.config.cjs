// Instagram carousel k článku (kapitola 8 v tools/COVER-VIZUALNI-IDENTITA.md): 8 slidů 1080×1350.
// Slide 1 = první snímek animace slunečnice (stav „dnes“), pak po jednom zjištění na slide v pořadí článku,
// jak jsme to počítali, a na konci odkaz na článek a Linka Anabell (citlivé téma).
// Čísla: léčba z _data_pipeline/vystup.txt (čte se přímo), HBSC a Project EAT z textu článku a vystup.txt.
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → social/carousel/01.png … 08.png
const fs = require('fs');
const path = require('path');
const { ZLATY } = require('./motiv.cjs');
const animace = require('./animace.config.cjs');
const cover = require('./cover.config.cjs');

const ORANZ = '#f76800'; // brandOrange.6 – dívky
const TLUM = '#994800'; // brandOrange.8
const SVETLA = '#fda668'; // brandOrange.3
const TEAL = '#06677d'; // brandTeal.7 – chlapci (genderové barvy)
const TEAL_OBRYS = '#5fcce6'; // brandTeal.3 – obrys teček chlapců, aby byly na tmavém pozadí vidět
const KREM = '#f8f6f0';
const POPIS = '#ffe0c7'; // brandOrange.1
const NAVY = '#101432'; // brandNavy.9
const W = 1080, H = 1350;
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const f1 = (v) => v.toFixed(1);
const cislo = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const svg = (obsah) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${obsah}</svg>`;
const text = (x, y, obsah, { size = 26, w = 500, fill = POPIS, anchor = 'start' } = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="${SANS}" font-weight="${w}" font-size="${size}" fill="${fill}">${obsah}</text>`;

// rok | dívky | chlapci | … z výstupu datové pipeline
const radky = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8')
  .split('\n').map((r) => r.match(/^(20\d\d) \| (\d+) \| (\d+) \|/)).filter(Boolean).map((m) => ({ rok: +m[1], divky: +m[2], chlapci: +m[3] }));
const R = Object.fromEntries(radky.map((r) => [r.rok, r]));
if (radky.length !== 16) throw new Error('vystup.txt: čekám 16 let 2010–2025');

// --- slide 2: sloupce dívek 2010–2025 ---
function grafLecba() {
  const [x0, x1, y0, y1] = [90, 1000, 640, 1150]; // plocha grafu, y1 = základna
  const max = 4000, krok = (x1 - x0) / radky.length, sirka = krok * 0.7;
  const y = (v) => y1 - (v / max) * (y1 - y0);
  let s = '';
  for (const v of [1000, 2000, 3000, 4000]) s += `<line x1="${x0}" x2="${x1}" y1="${f1(y(v))}" y2="${f1(y(v))}" stroke="${KREM}" stroke-opacity=".12"/>` + text(x0 - 12, y(v) + 8, cislo(v), { size: 22, anchor: 'end', fill: KREM }).replace('<text', '<text opacity=".55"');
  const popsane = { 2010: 'start', 2019: 'middle', 2021: 'middle', 2025: 'end' };
  radky.forEach(({ rok, divky }, i) => {
    const x = x0 + i * krok + (krok - sirka) / 2;
    s += `<rect x="${f1(x)}" y="${f1(y(divky))}" width="${f1(sirka)}" height="${f1(y1 - y(divky))}" rx="3" fill="${rok >= 2021 ? ORANZ : TLUM}"/>`;
    if (popsane[rok]) {
      const a = popsane[rok], tx = a === 'start' ? x : a === 'end' ? x + sirka : x + sirka / 2;
      s += text(tx, y(divky) - 14, cislo(divky), { size: 28, w: 600, fill: KREM, anchor: a });
    }
    if (rok % 5 === 0) s += text(x + sirka / 2, y1 + 38, rok, { size: 24, anchor: 'middle', fill: KREM });
  });
  s += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${KREM}" stroke-opacity=".5"/>`;
  return svg(s);
}

// --- slide 3: dívky × chlapci loni, dva tečkové disky ve stejném měřítku (1 tečka = 10 dětí) ---
function diskyPohlavi() {
  const loni = R[2025];
  const nD = Math.round(loni.divky / 10), nCh = Math.round(loni.chlapci / 10);
  const RD = 250, c = RD / Math.sqrt(nD + 0.5), r = c * 0.56;
  const disk = (cx, cy, n, fill, obrys) => Array.from({ length: n }, (_, i) => {
    const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
    return `<circle cx="${f1(cx + rr * Math.cos(a))}" cy="${f1(cy + rr * Math.sin(a))}" r="${f1(r)}" fill="${fill}"${obrys ? ` stroke="${obrys}" stroke-width="1.5"` : ''}/>`;
  }).join('');
  const [cxD, cy] = [370, 790], cxCh = 830;
  const RCh = c * Math.sqrt(nCh + 0.5);
  let s = disk(cxD, cy, nD, ORANZ) + disk(cxCh, cy, nCh, TEAL, TEAL_OBRYS);
  s += text(cxD, cy + RD + 70, `${cislo(loni.divky)} dívek`, { size: 40, w: 600, fill: KREM, anchor: 'middle' });
  s += text(cxCh, cy + RCh + 70, `${cislo(loni.chlapci)} chlapců`, { size: 40, w: 600, fill: KREM, anchor: 'middle' });
  s += `<text transform="translate(1046 ${cy}) rotate(-90)" text-anchor="middle" font-family="${SANS}" font-weight="500" font-size="21" letter-spacing="1" fill="${POPIS}" opacity=".8">1 tečka = 10 dětí</text>`;
  return svg(s);
}

// --- slide 5: HBSC, dívky s normální nebo nižší váhou, které se cítí tlusté (%), 2002–2022 ---
const HBSC = { // vystup.txt → HBSC ČR (report Zdravá generace)
  '15 let': [33.0, 27.9, 27.4, 25.6, 18.7, 15.4],
  '13 let': [28.4, 20.8, 23.8, 22.6, 17.3, 16.6],
  '11 let': [18.3, 17.9, 17.2, 16.0, 11.9, 12.7],
};
const HBSC_ROKY = [2002, 2006, 2010, 2014, 2018, 2022];
function grafHbsc() {
  const [x0, x1, y0, y1] = [200, 880, 560, 1080];
  const x = (i) => x0 + (i / (HBSC_ROKY.length - 1)) * (x1 - x0);
  const y = (v) => y1 - (v / 40) * (y1 - y0);
  const barvy = { '15 let': ORANZ, '13 let': SVETLA, '11 let': TLUM };
  const posunKonec = { '15 let': 0, '13 let': -21, '11 let': 2 }; // koncové hodnoty jsou blízko – rozestoupit popisky
  let s = '';
  for (const v of [10, 20, 30, 40]) s += `<line x1="${x0}" x2="${x1}" y1="${f1(y(v))}" y2="${f1(y(v))}" stroke="${KREM}" stroke-opacity=".12"/>`;
  s += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${KREM}" stroke-opacity=".5"/>`;
  for (const [vek, hodnoty] of Object.entries(HBSC)) {
    const b = barvy[vek];
    s += `<polyline points="${hodnoty.map((v, i) => `${f1(x(i))},${f1(y(v))}`).join(' ')}" fill="none" stroke="${b}" stroke-width="${vek === '15 let' ? 6 : 4}" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += hodnoty.map((v, i) => `<circle cx="${f1(x(i))}" cy="${f1(y(v))}" r="${vek === '15 let' ? 8 : 6}" fill="${b}"/>`).join('');
    s += text(x0 - 22, y(hodnoty[0]) + 9, `${vek} ${Math.round(hodnoty[0])} %`, { size: 26, w: 600, fill: b, anchor: 'end' });
    s += text(x1 + 22, y(hodnoty.at(-1)) + 9 + posunKonec[vek], `${Math.round(hodnoty.at(-1))} %`, { size: 26, w: 600, fill: b });
  }
  HBSC_ROKY.forEach((r, i) => { s += text(x(i), y1 + 38, r, { size: 24, anchor: 'middle', fill: KREM }); });
  return svg(s);
}

// --- slide 6: Project EAT 2013, podíl dospívajících, kteří drží dietu (%) ---
function grafEat() {
  const skupiny = [['S nadváhou', 64, 40], ['Bez nadváhy', 35, 23]];
  const [x0, x1] = [70, 900];
  const x = (v) => x0 + (v / 70) * (x1 - x0);
  let s = '', yy = 600;
  for (const [nazev, vaha, jidlo] of skupiny) {
    s += text(x0, yy, nazev, { size: 32, w: 600, fill: KREM });
    for (const [v, b, popis] of [[vaha, ORANZ, 'matka mluví o váze'], [jidlo, TLUM, 'jen o zdravém jídle']]) {
      yy += 26;
      s += `<rect x="${x0}" y="${yy}" width="${f1(x(v) - x0)}" height="58" rx="4" fill="${b}"/>`;
      s += text(x(v) + 16, yy + 41, `${v} %`, { size: 34, w: 700, fill: KREM });
      s += text(x0 + 18, yy + 39, popis, { size: 26, w: 600, fill: b === ORANZ ? NAVY : KREM });
      yy += 58;
    }
    yy += 90;
  }
  return svg(s);
}

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  slidy: [
    { cover: animace.cover, svg: (klic) => animace.snimek(0, klic) },
    {
      titulek: 'Dívek v&nbsp;léčbě přibývalo už před covidem, v&nbsp;roce 2021 skokem o&nbsp;polovinu',
      pod: 'Dívky do 18 let s poruchou příjmu potravy v péči hrazené pojišťovnou',
      svg: grafLecba(),
      zdroj: 'Zdroj: ÚZIS, NZIP – datový souhrn Poruchy příjmu potravy',
    },
    {
      titulek: 'Dívky tvoří skoro devět desetin dětských pacientů',
      pod: `Loni se léčilo ${cislo(R[2025].divky)} dívek a ${cislo(R[2025].chlapci)} chlapců do 18 let. V roce 2010 to bylo ${cislo(R[2010].divky)} a ${cislo(R[2010].chlapci)}.`,
      svg: diskyPohlavi(),
      zdroj: 'Zdroj: ÚZIS, NZIP – datový souhrn Poruchy příjmu potravy',
    },
    {
      titulek: 'Data neukazují, proč léčených dívek přibývá',
      obsahOd: 400,
      html: `<div class="bod"><b>1</b><div><strong>Péče.</strong> O nemoci se víc mluví a víc lékařů ji pozná.</div></div>
        <div class="bod"><b>2</b><div><strong>Délka léčby.</strong> Nově zjištěných onemocnění přibylo o třetinu, léčených pacientů v ambulancích je dvakrát tolik.</div></div>
        <div class="bod"><b>3</b><div><strong>Covid.</strong> Skok v roce 2021 časově odpovídá zavřeným školám a izolaci.</div></div>
        <div class="bod"><b>4</b><div><strong>Rodiče.</strong> Jak se v českých rodinách mluví o jídle a postavě, žádný výzkum nesleduje.</div></div>`,
      zdroj: 'Zdroj: ÚZIS, NZIP – výkaz A013 Psychiatrie (ambulance, 2011 a 2025)',
    },
    {
      titulek: 'Dívek s&nbsp;normální váhou, které se cítí tlusté, je méně než před 20 lety',
      pod: 'Podíl dívek s normální nebo nižší váhou, které o sobě říkají, že jsou tlusté',
      svg: grafHbsc(),
      zdroj: 'Zdroj: HBSC ČR, Univerzita Palackého v Olomouci – report Zdravá generace',
    },
    {
      titulek: 'Když matka mluví o&nbsp;váze, drží dietu víc dospívajících',
      pod: 'Podíl dospívajících, kteří drží dietu. Americký Project EAT, 2&nbsp;348 dospívajících.',
      svg: grafEat(),
      html: '<div class="male">Studie ukazuje souvislost, ne důkaz příčiny. S otci to vyšlo podobně, u dívek i chlapců.</div>',
      obsahOd: 1075,
      zdroj: 'Zdroj: Project EAT, Minnesotská univerzita – JAMA Pediatrics 2013',
    },
    {
      titulek: 'Jak jsme to počítali',
      obsahOd: 330,
      html: `<p class="velke" style="font-size:44px">Počty dívek jsou z datového souhrnu ÚZIS: děti do 18 let, které měly v daném roce s poruchou příjmu potravy péči hrazenou pojišťovnou. Každé dítě se počítá jednou.</p>
        <p class="velke" style="font-size:44px">Data ukazují, kolik dětí se dostalo k lékaři. Neříkají, kolik dětí nemoc má, ani proč onemocněly.</p>
        <p class="velke" style="font-size:44px">Americké studie o rodičích ukazují souvislost, ne příčinu.</p>`,
    },
    {
      titulek: 'Mluvte s&nbsp;dětmi o&nbsp;tom, co jedí, ne kolik váží',
      obsahOd: 420,
      html: `<p class="velke">Celý článek najdete na DataTimes.cz, odkaz je v biu.</p>
        <div style="margin-top:70px;padding:36px 40px;border-radius:18px;background:rgba(247,104,0,.14);border:2px solid ${ORANZ}">
          <div class="male" style="font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${ORANZ}">Kde hledat pomoc</div>
          <div style="font-size:52px;font-weight:700;margin:.25em 0 .2em">Linka Anabell 774 467 293</div>
          <div class="male">Anonymní linka pro lidi s poruchami příjmu potravy a jejich blízké. Po, st, čt, pá 8–16 h, út 10–18 h, chat po a st 17–20 h. anabell.cz</div>
        </div>`,
    },
  ],
};

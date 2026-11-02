// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 25. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (Kateřina: socha zůstává, výstřižky učesat).
// Podkres: Iustitia (Emanuel Pendl), Justizpalast Wien – foto Hubertl, CC BY-SA 4.0, Wikimedia Commons
// (podklad-iustitia.jpg = výřez kolem sochy, zmenšený; originál v Desktop/Mahdalova & Skop/Justice).
// Výstřižky jsou nízké rozlišení (~400 px), proto se z nich bere jen text, vysázený jednotně jako tři proužky
// v časové ose případu: obvinění 1995 → cela smrti od 1996 → petice za milost 2026. Bez portrétů (citlivé téma).
// Socha je odbarvená a ztlumená závojem v navy; text vlevo/nahoře, proužky vpravo přes sochu, ne přes obličej.
const fs = require('fs');
const path = require('path');

const NAVY = '#101432'; // brandNavy.9
const NAVY8 = '#2f325c'; // brandNavy.8
const PAPIR = '#f8f6f0';
const KARMIN = '#de1743'; // štítek, akcent
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const SOCHA = `data:image/jpeg;base64,${fs.readFileSync(path.join(__dirname, 'podklad-iustitia.jpg')).toString('base64')}`;
const SOCHA_W = 1400, SOCHA_H = 1684; // obličej sochy v podkladu ≈ (685, 387)

// citace z výstřižků (původní znění) a zdroj
const PROUZKY = [
  ['3 teens charged in slaying', 'Knoxville News Sentinel, 15. 1. 1995'],
  ['On death row since 1996', 'MediaOne: Who is Christa Pike?'],
  ['Mercy for Christa Pike', 'petice za milost, 30. 9. 2026'],
];

// pro každý formát: socha [x, y, výška], závoj, scrim (gradient pod textem), proužky [x, y, šířka, velikost písma, rozestup]
const L = {
// Obličej sochy drží mimo zónu štítku rubriky (homepage x ≥ 950, y ≤ 280) a mimo proužky.
  homepage: { W: 1500, H: 1200, socha: [366, -2, 1560], zavoj: 0.42, scrim: 'h', prouzky: [1010, 600, 430, 33, 128] },
  og: { W: 1200, H: 630, socha: [234, -60, 900], zavoj: 0.62, scrim: null, prouzky: null },
  square: { W: 1080, H: 1080, socha: [213, 307, 1100], zavoj: 0.45, scrim: 'v', prouzky: [620, 690, 390, 28, 104] },
  instagram: { W: 1080, H: 1350, socha: [151, 341, 1300], zavoj: 0.45, scrim: 'v', prouzky: [620, 820, 400, 29, 112] },
  story: { W: 1080, H: 1920, socha: [-31, 469, 1700], zavoj: 0.45, scrim: 'v', prouzky: [560, 1090, 440, 32, 130] },
};

const f1 = (v) => v.toFixed(1);
function prouzky([x, y, sirka, fs_, krok]) {
  return PROUZKY.map(([citace, zdroj], i) => {
    const yy = y + i * krok, h = fs_ * 2.45, uhel = [-1.5, 1.2, -0.8][i];
    return `<g transform="rotate(${uhel} ${x + sirka / 2} ${yy + h / 2})" filter="url(#stin)">
      <rect x="${x}" y="${yy}" width="${sirka}" height="${f1(h)}" fill="${PAPIR}"/>
      <rect x="${x}" y="${yy}" width="${f1(fs_ * 0.18)}" height="${f1(h)}" fill="${KARMIN}"/>
      <text x="${f1(x + fs_ * 0.7)}" y="${f1(yy + fs_ * 1.22)}" font-family="${SANS}" font-weight="700" font-size="${fs_}" fill="${NAVY}">${citace}</text>
      <text x="${f1(x + fs_ * 0.7)}" y="${f1(yy + fs_ * 1.95)}" font-family="${SANS}" font-weight="500" font-size="${f1(fs_ * 0.52)}" fill="${NAVY8}">${zdroj}</text>
    </g>`;
  }).join('');
}

function svg(klic) {
  const { W, H, socha: [sx, sy, sh], zavoj, scrim, prouzky: p } = L[klic];
  const sw = (SOCHA_W * sh) / SOCHA_H;
  const scrimDef = scrim === 'h'
    ? `<linearGradient id="scrim" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${NAVY}" stop-opacity=".92"/><stop offset=".38" stop-color="${NAVY}" stop-opacity=".75"/><stop offset=".62" stop-color="${NAVY}" stop-opacity="0"/></linearGradient>`
    : `<linearGradient id="scrim" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${NAVY}" stop-opacity=".95"/><stop offset=".42" stop-color="${NAVY}" stop-opacity=".7"/><stop offset=".62" stop-color="${NAVY}" stop-opacity="0"/><stop offset=".9" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity=".6"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="seda"><feColorMatrix type="saturate" values="0.3"/></filter>
      <radialGradient id="mizi" cx=".5" cy=".4" r=".62"><stop offset=".6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
      <mask id="mk" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#mizi)"/></mask>
      <filter id="stin" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="6" dy="9" stdDeviation="9" flood-color="#000" flood-opacity=".55"/></filter>
      ${scrimDef}
    </defs>
    <image href="${SOCHA}" x="${sx}" y="${sy}" width="${f1(sw)}" height="${sh}" filter="url(#seda)" mask="url(#mk)"/>
    <rect width="${W}" height="${H}" fill="${NAVY}" opacity="${zavoj}"/>
    ${scrim ? `<rect width="${W}" height="${H}" fill="url(#scrim)"/>` : ''}
    ${p ? prouzky(p) : ''}
  </svg>`;
}

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Trest smrti' },
  titulek: 'Trest smrti<br>jako lidské<br>selhání',
  pod: 'Případ Christy Pike a&nbsp;trest smrti ve&nbsp;světě',
  logo: 'vlevo',
  format: { homepage: { box: [180, 300, 1320, 1080] } },
  // brandNavy.8 / brandDeepRed.9 záře, brandNavy.1 podtitulek
  barvy: { glowA: NAVY8, glowB: '#431320', glowPosA: '0% 0%', sub: '#d2d8e9', stitek: KARMIN },
  motiv: { typ: 'svg', opacityOg: 1, svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

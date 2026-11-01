// English cover set (translated from the Czech article volby-cr-2026-10-02-zeny-na-radnicich).
// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026); dřív fotka radnice.
// Motiv: čtyři řádky postav (tools/cover-tecky.cjs, piktogramy žena/muž), 1 postava = 5 % – oranžově ženy
// (genderová barva brandOrange.6), ztlumeně muži. Čím vyšší funkce, tím méně oranžových postav. Data/cim_vys.json.
const path = require('path');
const { vrstva, mrizka } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));
const data = require(path.join(__dirname, '..', 'data', 'cim_vys.json')).data.values;

const ORANZ = '#f76800'; // brandOrange.6 – ženy
const RING = '#8f9dc9'; // brandNavy.4
const KREM = '#f8f6f0';
const NAVY = '#101432';
const v = (zac) => Math.round(data.find((d) => d.k.startsWith(zac)).v);
const SLOUPCE = [['candidates', v('Candidates')], ['councillors', v('Municipal councillors')], ['mayors', v('Mayors')], ['regional governors', v('Regional governors')]];

// řádky postav (Kateřina 26. 10.: piktogramy, gender rozlišený tvarem i barvou): 1 postava = 5 %, 20 postav na funkci,
// oranžové ženy zleva, ztlumení muži. Plocha [x0, y0, šířka, postav v řádku] – OG vpravo mimo střední čtverec 2 řádky po 10.
// 30. 10. 2026: čtverec (a tím i OG „čtverec s ušima“) o kus výš a užší – logo leželo přes řádek hejtmanů
const PLOCHA = { homepage: [520, 610, 860, 20], square: [70, 615, 900, 20], instagram: [70, 760, 940, 20], story: [80, 1040, 920, 20], og: [930, 150, 250, 10] };

function radky(k) {
  const [x0, y0, w, vRadku] = PLOCHA[k];
  const krok = w / vRadku, fs = Math.max(13, krok * (vRadku === 10 ? 0.62 : 0.5)), radku = 20 / vRadku;
  return SLOUPCE.map(([popis, pct], j) => {
    const zen = Math.round(pct / 5);
    const y = y0 + j * (radku * krok + fs * 1.9);
    const text = `<text x="${x0}" y="${(y - fs * 0.45).toFixed(1)}" font-family="IBM Plex Sans, Arial, sans-serif" font-size="${fs.toFixed(1)}" font-weight="600" fill="${KREM}" stroke="${NAVY}" stroke-width="${(fs * 0.25).toFixed(1)}" paint-order="stroke">${popis} ${pct}%</text>`;
    return text + mrizka({ x: x0 + krok / 2, y: y + krok / 2, sloupcu: vRadku, n: 20, krok, styl: (i) => (i < zen ? { ikona: 'zena', fill: ORANZ } : { ikona: 'muz', ring: RING }) });
  }).join('');
}

module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analysis', dal: 'Czech municipal elections 2026' },
  titulek: 'The higher up,<br>the fewer women',
  pod: 'Women make up a third of municipal candidates,<br>but only a quarter of mayors',
  legenda: [[ORANZ, 'women'], [`${RING};opacity:.45`, 'men'], ['transparent', '1 figure = 5%']],
  legendaPodTextem: true,
  logo: 'vlevo',
  // brandTeal.8 / brandAmethyst.8 záře (Kateřina 26. 10.), brandTeal.1 štítek coveru
  barvy: { glowA: '#044d5e', glowB: '#522a7a', kick: '#b8eff6', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, svg: vrstva((k) => radky(k)) },
};

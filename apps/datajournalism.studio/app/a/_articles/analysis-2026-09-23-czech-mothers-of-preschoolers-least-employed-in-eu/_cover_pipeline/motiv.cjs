// English cover (datatimes.org) for the article on mothers of preschoolers – převod hotového českého coveru
// (COVER-EDITOR.md, bod 8: fotka i sdělení zůstávají, mění se sazba do formátů a jazyk).
// Motiv: koláž fotek z původního českého coveru images/cover-homepage.jpg, vyříznutá jen čistá plocha koláže
// (x 0–690, y 108–1112, bez jakéhokoli textu) → kolaz.jpg. Vedle koláže dva pruhy z dat článku:
// zaměstnaní otcové 97,6 % × matky 51,5 % (Eurostat lfst_hheredch, 2025; ../data/matky-otcove-zamestnanost.json).
// funkce svg(klic) vrací vrstvu motivu pro cover.config.cjs (motiv.typ 'svg').
const fs = require('fs');
const path = require('path');
const D = require(path.join(__dirname, '..', 'data', 'matky-otcove-zamestnanost.json'));

const CZ = D.data.values.find((v) => v.kod === 'CZ');
if (CZ.otcove !== 97.6 || CZ.matky !== 51.5) throw new Error('čísla Česka nesedí s textem coveru – zkontroluj data');

const KOLAZ = `data:image/jpeg;base64,${fs.readFileSync(path.join(__dirname, 'kolaz.jpg')).toString('base64')}`;
const KW = 690, KH = 1004; // rozměr výřezu koláže

// barvy z palety (packages/ui/DESIGN.md → rodiče: otcové brandTeal, matky brandOrange)
const OTEC = '#0e839e', OTEC_T = '#33b9d9';   // brandTeal.6 pruh, brandTeal.4 popisek
const MATKA = '#f76800', MATKA_T = '#ff934d'; // brandOrange.6 pruh, brandOrange.4 popisek
const DRAHA = '#2f325c';                      // brandNavy.8
const KREM = '#f8f6f0', ZDROJ = '#8f9dc9';    // background.2, brandNavy.4
const SANS = 'IBM Plex Sans, Arial, sans-serif';

// kolaz = [x, y, měřítko]; pruhy = { x, y, w, fs, krok, nad } (nad = popisek nad pruhem v úzkém sloupci);
// zdroj = [x, y, fs]
const FORMATY = {
  homepage: { W: 1500, H: 1200, kolaz: [0, 190, 1], pruhy: { x: 740, y: 820, w: 580, fs: 30, krok: 76 }, zdroj: [740, 960, 22] },
  og: { W: 1200, H: 630, kolaz: [0, 0, 630 / KH], pruhy: { x: 470, y: 380, w: 410, fs: 19, krok: 44 }, zdroj: [470, 480, 15] },
  square: { W: 1080, H: 1080, kolaz: [0, 500, 0.75], pruhy: { x: 580, y: 650, w: 430, fs: 26, krok: 112, nad: true }, zdroj: [580, 860, 20] },
  instagram: { W: 1080, H: 1350, kolaz: [0, 590, 0.94], pruhy: { x: 640, y: 820, w: 370, fs: 27, krok: 120, nad: true }, zdroj: [640, 1060, 21] },
  story: { W: 1080, H: 1920, kolaz: [0, 800, 1.05], pruhy: { x: 650, y: 1040, w: 350, fs: 30, krok: 135, nad: true }, zdroj: [650, 1320, 23] },
};

const f1 = (v) => v.toFixed(1);
const fmt = (v) => `${v.toFixed(1)}%`;

function svg(klic) {
  const F = FORMATY[klic];
  const [kx, ky, km] = F.kolaz;
  const P = F.pruhy;
  let s = `<image href="${KOLAZ}" x="${kx}" y="${ky}" width="${f1(KW * km)}" height="${f1(KH * km)}"/>`;
  const t = (x, y, txt, barva, fs, kotva = 'start', vaha = 600) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${kotva}" font-family="${SANS}" font-weight="${vaha}" font-size="${f1(fs)}" fill="${barva}">${txt}</text>`;
  const h = P.fs * 0.95; // tloušťka pruhu
  [['Fathers', CZ.otcove, OTEC, OTEC_T], ['Mothers', CZ.matky, MATKA, MATKA_T]].forEach(([jmeno, v, barva, popis], i) => {
    const y = P.y + i * P.krok; // střed pruhu
    const hodnotaW = P.fs * 3.4;
    const [bx, bw] = P.nad ? [P.x, P.w - hodnotaW] : [P.x + P.fs * 4.6, P.w - P.fs * 4.6 - hodnotaW];
    if (P.nad) s += t(P.x, y - h / 2 - P.fs * 0.45, jmeno, KREM, P.fs);
    else s += t(P.x, y + P.fs * 0.35, jmeno, KREM, P.fs);
    s += `<rect x="${f1(bx)}" y="${f1(y - h / 2)}" width="${f1(bw)}" height="${f1(h)}" rx="${f1(h / 2)}" fill="${DRAHA}"/>`;
    s += `<rect x="${f1(bx)}" y="${f1(y - h / 2)}" width="${f1(bw * v / 100)}" height="${f1(h)}" rx="${f1(h / 2)}" fill="${barva}"/>`;
    s += t(P.x + P.w, y + P.fs * 0.35, fmt(v), popis, P.fs * 1.05, 'end', 700);
  });
  const [zx, zy, zfs] = F.zdroj;
  s += t(zx, zy, 'Source: Eurostat, 2025', ZDROJ, zfs, 'start', 500);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${s}</svg>`;
}

module.exports = { svg, FORMATY };

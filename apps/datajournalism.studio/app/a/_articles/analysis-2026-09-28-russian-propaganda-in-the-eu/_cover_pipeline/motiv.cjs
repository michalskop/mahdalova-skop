// English cover (datatimes.org) for „Where Russian propaganda works“ – motif drawn from the article's own data.
// Motiv: „hantle“ (dumbbell) pro každou zemi EU – podpora sankcí proti Rusku × podpora financování zbraní pro
// Ukrajinu (Standard Eurobarometer 105, jaro 2026), seřazeno podle zbraní jako graf v článku. Zvýrazněné Česko
// (65 × 32, největší rozdíl v EU) a průměr EU (70 × 56). Čísla se berou přímo z ../data/sankce-a-zbrane.json
// (stejný soubor jako graf v článku), ručně se nepřepisují.
// Stejný vizuální nápad jako český cover (analyza-2026-09-28-ruska-propaganda-v-eu), ale na navy pozadí generátoru.
// funkce svg(klic) vrací vrstvu motivu pro cover.config.cjs (motiv.typ 'svg').
const path = require('path');
const D = require(path.join(__dirname, '..', 'data', 'sankce-a-zbrane.json'));

// barvy jen z palety (packages/ui/DESIGN.md); na tmavém pozadí světlejší odstíny barev grafu v článku
const SANKCE = '#33b9d9';  // brandTeal.4 (graf v článku brandTeal.7 #06677d)
const ZBRANE = '#c49ad8';  // brandAmethyst.3 (graf v článku brandAmethyst.6 #9f319e)
const SPOJ = '#4c4f8e';    // brandNavy.7 – spojnice
const MRIZKA = '#2f325c';  // brandNavy.8 – svislé čáry po 20 bodech
const CZ = '#ff4970';      // brand.3 – zvýraznění Česka (karmínová čitelná na navy)
const KREM = '#f8f6f0';    // background.2
const POPIS = '#d2d8e9';   // brandNavy.1
const NAVY = '#101432';    // brandNavy.9
const SANS = 'IBM Plex Sans, Arial, sans-serif';

// jedna řada na zemi (data mají dva záznamy na zemi), pořadí jako v článku (podle zbraní sestupně)
const RADY = [];
for (const v of D.data.values) if (!RADY.some((r) => r.zeme === v.zeme)) RADY.push({ zeme: v.zeme, s: v.sankce, z: v.zbrane, cz: v.cz, eu: v.eu });
const najdi = (z) => RADY.find((r) => r.zeme === z);
if (najdi('Czechia').s !== 65 || najdi('Czechia').z !== 32 || najdi('EU average').s !== 70 || najdi('EU average').z !== 56) throw new Error('čísla Česka / průměru EU nesedí s textem coveru – zkontroluj data');

// popsané země (kromě Česka a průměru EU, které mají i hodnoty)
const JMENA = { Sweden: 'Sweden', Finland: 'Finland', Poland: 'Poland', Germany: 'Germany', Romania: 'Romania', Slovakia: 'Slovakia', Cyprus: 'Cyprus' };

// rozvržení: x20 = x hodnoty 20 %, k = px na procentní bod, y0/y1 = první a poslední řada, r = poloměr tečky,
// fs = písmo popisků, jmena = které země popsat
const FORMATY = {
  // homepage: graf pod titulkem vpravo, Česko nad logem (logo vpravo dole, pod ním už jen krátké řady)
  homepage: { W: 1500, H: 1200, x20: 360, k: 11.2, y0: 345, y1: 990, r: 10, fs: 24, jmena: true },
  og: { W: 1200, H: 630, x20: 380, k: 9.6, y0: 46, y1: 590, r: 7, fs: 17, jmena: ['Sweden', 'Cyprus'] },
  // na výšku text → graf → logo; graf končí nad logem
  square: { W: 1080, H: 1080, x20: 140, k: 9.6, y0: 405, y1: 915, r: 7.5, fs: 19, jmena: true },
  instagram: { W: 1080, H: 1350, x20: 130, k: 9.6, y0: 440, y1: 1125, r: 9, fs: 21, jmena: true },
  story: { W: 1080, H: 1920, x20: 120, k: 10.6, y0: 690, y1: 1440, r: 10, fs: 24, jmena: true },
};

const f1 = (v) => v.toFixed(1);

function svg(klic) {
  const F = FORMATY[klic];
  const X = (v) => F.x20 + (v - 20) * F.k;
  const dy = (F.y1 - F.y0) / (RADY.length - 1);
  const popsat = (z) => F.jmena === true ? z in JMENA : F.jmena.includes(z);
  let s = '';
  // svislá mřížka po 20 bodech (20–80 %), tlumeně
  for (const v of [20, 40, 60, 80]) s += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${f1(F.y0 - dy)}" y2="${f1(F.y1 + dy * 0.6)}" stroke="${MRIZKA}" stroke-width="2"/>`;
  RADY.forEach((r, i) => {
    const y = F.y0 + i * dy;
    const hl = r.cz || r.eu;
    const R = hl ? F.r * 1.35 : F.r;
    const [a, b] = [Math.min(r.s, r.z), Math.max(r.s, r.z)];
    s += `<line x1="${f1(X(a))}" x2="${f1(X(b))}" y1="${f1(y)}" y2="${f1(y)}" stroke="${r.cz ? KREM : SPOJ}" stroke-width="${f1(r.cz ? F.r * 0.6 : F.r * 0.45)}" stroke-linecap="round"/>`;
    s += `<circle cx="${f1(X(r.z))}" cy="${f1(y)}" r="${f1(R)}" fill="${ZBRANE}"/>`;
    s += `<circle cx="${f1(X(r.s))}" cy="${f1(y)}" r="${f1(R)}" fill="${SANKCE}"/>`;
    const fs = hl ? F.fs * 1.12 : F.fs;
    const t = (x, txt, barva, kotva = 'start', vaha = 600) => `<text x="${f1(x)}" y="${f1(y + fs * 0.35)}" text-anchor="${kotva}" font-family="${SANS}" font-weight="${vaha}" font-size="${f1(fs)}" fill="${barva}" stroke="${NAVY}" stroke-width="${f1(fs * 0.25)}" stroke-linejoin="round" paint-order="stroke">${txt}</text>`;
    const vpravo = X(b) + R + fs * 0.45;
    if (hl) {
      // hodnoty u obou teček + název (Česko karmínově)
      s += t(X(a) - R - fs * 0.4, `${r.z}`, ZBRANE, 'end', 700);
      s += t(vpravo, `${r.s}`, SANKCE, 'start', 700);
      s += t(vpravo + fs * 1.55, r.cz ? 'Czechia' : 'EU average', r.cz ? CZ : KREM, 'start', 700);
    } else if (popsat(r.zeme)) s += t(vpravo, JMENA[r.zeme], POPIS);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${s}</svg>`;
}

module.exports = { svg, FORMATY, SANKCE, ZBRANE };

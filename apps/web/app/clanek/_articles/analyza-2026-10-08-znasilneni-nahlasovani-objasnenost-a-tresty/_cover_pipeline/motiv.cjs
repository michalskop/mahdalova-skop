// Motiv coveru: tečková „slunečnice“ ze 100 teček – 1 tečka = 1 oběť ze sta. Karmínových je 11: tolik obětí
// fyzického nebo sexuálního násilí v Česku čin oznámilo policii (Eurostat, šetření EU-GBV, gbv_any_rp, POLC, CZ = 11,0 %;
// v textu článku). Karmínové tečky leží rovnoměrně po celém disku: „zhruba každá desátá“. Ostatní tlumeně.
// Citlivé téma: záměrně jen abstraktní tečky. Vzor: analyza-2026-10-25-poruchy-prijmu-potravy/_cover_pipeline/motiv.cjs
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const N = 100;          // obětí
const POLICIE = 11;     // z nich oznámí policii (EU-GBV, Česko)
const KARMIN = '#de1743'; // brand.6
const TLUM = '#2f325c';   // brandNavy.8
const ZARE = '#431320';   // brandDeepRed.9
const ZLATY = Math.PI * (3 - Math.sqrt(5));
// rovnoměrně rozprostřené indexy karmínových teček
const VYBRANE = new Set(Array.from({ length: POLICIE }, (_, k) => Math.floor((k + 0.5) * N / POLICIE)));

// [střed x, střed y, poloměr disku] pro každý formát
const FORMATY = {
  homepage: { W: 1500, H: 1200, disk: [1150, 905, 295] },
  square: { W: 1080, H: 1080, disk: [800, 810, 245] },
  instagram: { W: 1080, H: 1350, disk: [740, 1010, 280] },
  story: { W: 1080, H: 1920, disk: [600, 1200, 320] },
  og: { W: 1200, H: 630, disk: [1075, 315, 118] },
};
const f1 = (v) => v.toFixed(1);

module.exports = { FORMATY, N, POLICIE, barvy: { KARMIN, TLUM, ZARE } };

if (require.main === module) {
  for (const [klic, F] of Object.entries(FORMATY)) {
    const [cx, cy, R] = F.disk;
    const c = R / Math.sqrt(N + 0.5), r = c * 0.62;
    let svg = `<defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity=".75"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.5)}" fill="url(#zare)"/>`;
    for (let i = 0; i < N; i++) {
      const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
      svg += `<circle cx="${f1(cx + rr * Math.cos(a))}" cy="${f1(cy + rr * Math.sin(a))}" r="${f1(r)}" fill="${VYBRANE.has(i) ? KARMIN : TLUM}"/>`;
    }
    fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${svg}</svg>`);
  }
  console.log(`motiv hotový: ${N} teček, karmínových ${POLICIE}`);
}

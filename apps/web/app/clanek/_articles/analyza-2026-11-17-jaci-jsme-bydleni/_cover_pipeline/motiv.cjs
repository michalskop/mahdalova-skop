// Motiv coveru kapitoly Bydlení (speciál Jací jsme byli, jací jsme – 1989 × 2026): dva paneláky po 100 oknech,
// 1 okno = 1 % obydlených bytů. Rozsvícená okna = byty, kde bydlí vlastník (byt ve vlastním domě + byt v osobním
// vlastnictví): sčítání 1991 37,7 % → 38 oken (tehdy #6267a3), sčítání 2021 60,6 % → 61 oken (karmínová #de1743;
// podíl ze všech obydlených bytů vč. 7,5 % nezjištěných). Rozsvícená okna jsou rozesetá po domě (pevné pořadí,
// ne náhoda při každém spuštění), jako svítící okna večer; okna 1991 jsou podmnožinou oken 2021.
// Čísla: _data_pipeline/vystup.txt (vlastnicke_1991, vlastnicke_2021; ČSÚ, sčítání 1991 a 2021; v textu článku
// „v 61 % obydlených bytů, v roce 1991 ve 38 %“). Rok 1989 se nesčítal, proto 1991.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const vystup = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8');
const hodnota = (klic) => {
  const m = vystup.match(new RegExp(`^${klic} = ([\\d.]+)`, 'm'));
  if (!m) throw new Error(`v vystup.txt chybí ${klic}`);
  return +m[1];
};
const DOMY = [
  { stitek: '1991', okna: Math.round(hodnota('vlastnicke_1991')), barva: '#6267a3', text: '#a6b0d4' }, // brandNavy.6 / .3
  { stitek: '2021', okna: Math.round(hodnota('vlastnicke_2021')), barva: '#de1743', text: '#ff8099' }, // brand.6 / .2
];
const FASADA = '#272a59', HRANA = '#383d82', TMA = '#101432'; // brandRoyalBlue.8, .7, brandNavy.9

// pevné rozesetí rozsvícených oken: zamíchání 0–99 generátorem s pevným semínkem (mulberry32), ať je výsledek
// při každém spuštění stejný
const nahoda = ((a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })(1989);
const PORADI = Array.from({ length: 100 }, (_, i) => i);
for (let i = 99; i > 0; i--) { const j = Math.floor(nahoda() * (i + 1)); [PORADI[i], PORADI[j]] = [PORADI[j], PORADI[i]]; }

// [šířka, výška, levý okraj prvního domu, horní hrana domů, krok oken, mezera mezi domy]
const POLOHA = {
  homepage: [1500, 1200, 622, 690, 35, 70],
  og: [1200, 630, 320, 250, 25.5, 40],
  square: [1080, 1080, 116, 566, 34, 60],
  instagram: [1080, 1350, 70, 655, 43, 56],
  story: [1080, 1920, 60, 900, 45, 40],
};

const f = (v) => v.toFixed(1);
for (const [k, [W, H, x0, y0, s, mezera]] of Object.entries(POLOHA)) {
  let g = `<defs><filter id="zar" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="${f(s * 0.22)}"/></filter></defs>`;
  const sirka = 10 * s + s * 0.6, vyska = 10 * s * 0.92 + s * 1.5;
  DOMY.forEach((d, j) => {
    const dx = x0 + j * (sirka + mezera);
    const fs0 = s * 0.62;
    g += `<text x="${f(dx)}" y="${f(y0 - s * 0.45)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${f(fs0)}" letter-spacing="${f(fs0 * 0.04)}" fill="${d.text}">${d.stitek}</text>`;
    // fasáda, atika a vchod
    g += `<rect x="${f(dx)}" y="${f(y0)}" width="${f(sirka)}" height="${f(vyska)}" fill="${FASADA}" stroke="${HRANA}" stroke-width="${f(s * 0.06)}"/>`;
    g += `<rect x="${f(dx - s * 0.15)}" y="${f(y0 - s * 0.18)}" width="${f(sirka + s * 0.3)}" height="${f(s * 0.24)}" fill="${HRANA}"/>`;
    g += `<rect x="${f(dx + sirka / 2 - s * 0.55)}" y="${f(y0 + vyska - s * 1.05)}" width="${f(s * 1.1)}" height="${f(s * 1.05)}" fill="${TMA}"/>`;
    const sviti = new Set(PORADI.slice(0, d.okna));
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), c = i % 10;
      const ox = dx + s * 0.3 + c * s + s * 0.18, oy = y0 + s * 0.35 + r * s * 0.92;
      const w = s * 0.64, h = s * 0.52;
      if (sviti.has(i)) {
        g += `<rect x="${f(ox - s * 0.1)}" y="${f(oy - s * 0.1)}" width="${f(w + s * 0.2)}" height="${f(h + s * 0.2)}" fill="${d.barva}" opacity="0.7" filter="url(#zar)"/>`;
        g += `<rect x="${f(ox)}" y="${f(oy)}" width="${f(w)}" height="${f(h)}" fill="${d.barva}"/>`;
      } else g += `<rect x="${f(ox)}" y="${f(oy)}" width="${f(w)}" height="${f(h)}" fill="${TMA}"/>`;
    }
  });
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
}
console.log(`motiv hotový: ${DOMY.map((d) => `${d.stitek} ${d.okna} oken ze 100`).join(', ')}`);

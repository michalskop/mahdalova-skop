// Motiv coveru kapitoly Peníze (speciál Jací jsme byli, jací jsme – 1989 × 2026): „košík z jedné výplaty“
// jako piktogramy, stejně jako graf v článku (data/kosik-zbozi.json, kosik-sluzby.json): 1 ikona = desetina toho,
// co průměrná čistá mzda koupila v prosinci 1989. Řádek 1989 = 10 ikon (tehdy #6267a3), dnes = kuře 64 ikon,
// pánské stříhání 3 ikony (karmínová #de1743). Počty ikon čte skript z _data_pipeline/vystup.txt (řádky „KOŠÍK“,
// „ikon N“ = round(10 × nákup 2025 / nákup 1989); grafy.py), ikony Tabler (meat, scissors) z _data_pipeline/ikony.py.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const DP = path.join(__dirname, '..', '_data_pipeline');
const vystup = fs.readFileSync(path.join(DP, 'vystup.txt'), 'utf8');
const ikon = (nazev) => {
  const m = vystup.match(new RegExp(`^\\s*${nazev}: .*\\| ikon (\\d+)\\s*$`, 'm'));
  if (!m) throw new Error(`v vystup.txt chybí řádek košíku: ${nazev}`);
  return +m[1];
};
const ikonyPy = fs.readFileSync(path.join(DP, 'ikony.py'), 'utf8');
const tabler = (nazev) => {
  const m = ikonyPy.match(new RegExp(`"${nazev}": '([^']+)'`));
  if (!m) throw new Error(`ikona ${nazev} chybí v ikony.py`);
  return m[1];
};

const POLOZKY = [
  { nazev: 'kuře', ikona: tabler('meat'), dnes: ikon('Kuře') },
  { nazev: 'kadeřník', ikona: tabler('scissors'), dnes: ikon('Pánský kadeřník') },
];
const TEHDY = '#6267a3', DNES = '#de1743'; // brandNavy.6, brand.6
const T_TEHDY = '#a6b0d4', T_DNES = '#ff8099', T_NAZEV = '#f8f6f0'; // brandNavy.3, brand.2, background.2

// [šířka, výška, x sloupce popisků, horní hrana bloku, krok ikon, mezera mezi položkami (v krocích),
//  sloupců dnešního kuřete]; řádek 1989 = blok 5 × 2 ikony, dnešní stříhání v 5 sloupcích
const POLOHA = {
  homepage: [1500, 1200, 180, 622, 44.5, 1.4, 13],
  og: [1200, 630, 302, 248, 28, 1.2, 13],
  square: [1080, 1080, 70, 572, 44, 1.2, 13],
  instagram: [1080, 1350, 70, 640, 49, 1.2, 11],
  story: [1080, 1920, 80, 872, 50, 1.6, 8],
};

const f = (v) => v.toFixed(1);
function ikona(d, cx, cy, s, barva) {
  const k = (s * 0.78) / 24;
  return `<path d="${d}" transform="translate(${f(cx - 12 * k)} ${f(cy - 12 * k)}) scale(${k.toFixed(4)})" fill="none" stroke="${barva}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const text = (x, y, fs, barva, t, vaha = 700) => `<text x="${f(x)}" y="${f(y)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="${vaha}" font-size="${f(fs)}" letter-spacing="${f(fs * 0.03)}" fill="${barva}">${t}</text>`;

for (const [k, [W, H, x0, y0, s, mezera, sloupcuKure]] of Object.entries(POLOHA)) {
  const fs0 = s * 0.5;
  const xi = x0 + s * 2.1; // začátek ikon za sloupcem popisků
  const yTehdy = y0 + s * 1.35, yDnes = yTehdy + s * 2.3;
  let g = text(x0, yTehdy + s * 0.5 + fs0 * 0.35, fs0, T_TEHDY, '1989') + text(x0, yDnes + fs0 * 0.35, fs0, T_DNES, 'dnes');
  let x = xi;
  POLOZKY.forEach((p, j) => {
    const sl = j === 0 ? sloupcuKure : 5;
    g += text(x + s * 0.1, y0 + s * 0.45, fs0 * 1.15, T_NAZEV, p.nazev, 600);
    for (let i = 0; i < 10; i++) g += ikona(p.ikona, x + ((i % 5) + 0.5) * s, yTehdy + Math.floor(i / 5) * s, s, TEHDY);
    for (let i = 0; i < p.dnes; i++) g += ikona(p.ikona, x + ((i % sl) + 0.5) * s, yDnes + Math.floor(i / sl) * s, s, DNES);
    x += sl * s + mezera * s;
  });
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
}
console.log(`motiv hotový: ${POLOZKY.map((p) => `${p.nazev} 10 → ${p.dnes} ikon`).join(', ')}`);

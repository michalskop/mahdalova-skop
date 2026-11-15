// Motiv coveru kapitoly Svoboda (speciál Jací jsme byli, jací jsme – 1989 × 2026): dvě skupiny po 100 postavách
// („2019“ a „2024“), 1 postava = 1 % dotázaných. Otázka CVVM: je možnost vyjádřit svůj názor lepší, nebo horší
// než před rokem 1989? „lepší“ = plné postavy brandNavy.6 #6267a3, „horší“ = karmínové brand.6 #de1743 (zpráva coveru:
// přibylo jich z 10 na 21 %), „stejná / neví“ = prázdný obrys brandNavy.7 #4c4f8e. Postavy v blocích po řádcích:
// nahoře lepší, pak stejná / neví, dole horší (karmínový blok roste odspodu).
// Kateřina 15. 11. 2026: bublinám řeči z teček nerozuměla → piktogramy lidí jako u kapitoly Vzdělávání (bez čepce).
// Čísla: _data_pipeline/vystup.txt (grafy.py, CVVM tab. 4):
//   „GRAF CVVM svobody Vyjádřit svůj názor 2019 (74, 10) 2024 (57, 21)“; v článku 1. odstavec.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const vystup = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8');
const m = vystup.match(/GRAF CVVM svobody Vyjádřit svůj názor 2019 \((\d+), (\d+)\) 2024 \((\d+), (\d+)\)/);
if (!m) throw new Error('V vystup.txt chybí řádek „GRAF CVVM svobody Vyjádřit svůj názor“');
const ROKY = [
  { rok: '2019', lepsi: +m[1], horsi: +m[2] },
  { rok: '2024', lepsi: +m[3], horsi: +m[4] },
];
const LEPSI = '#6267a3', HORSI = '#de1743', STEJNE = '#4c4f8e', TEXT = '#f8f6f0'; // brandNavy.6, brand.6, brandNavy.7
const f = (v) => v.toFixed(2);

// postava (tvar z motivu kapitoly Vzdělávání, bez čepce), střed (x, y), krok mřížky 1
function postava(x, y, barva, prazdna) {
  const r = 0.17, hy = y - 0.12;
  const telo = `M ${f(x - 0.3)} ${f(y + 0.4)} Q ${f(x - 0.3)} ${f(y + 0.1)} ${f(x)} ${f(y + 0.1)} Q ${f(x + 0.3)} ${f(y + 0.1)} ${f(x + 0.3)} ${f(y + 0.4)} Z`;
  const styl = prazdna ? `fill="none" stroke="${barva}" stroke-width="0.075"` : `fill="${barva}"`;
  return `<circle cx="${f(x)}" cy="${f(hy)}" r="${f(prazdna ? r - 0.03 : r)}" ${styl}/><path d="${telo}" ${styl} stroke-linejoin="round"/>`;
}

// skupina 10 × 10 v jednotkách kroku; vrací SVG s popiskem roku nad mřížkou
const FS = 0.85, POPIS = FS + 0.2; // výška popisku roku
function skupina(x0, y0, { rok, lepsi, horsi }) {
  let s = `<text x="${f(x0 + 0.2)}" y="${f(y0 + FS * 0.82)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${FS}" letter-spacing="${f(FS * 0.04)}" fill="${TEXT}">${rok}</text>`;
  for (let i = 0; i < 100; i++) {
    const x = x0 + (i % 10) + 0.5, y = y0 + POPIS + Math.floor(i / 10) + 0.5;
    if (i < lepsi) s += postava(x, y, LEPSI, false);
    else if (i >= 100 - horsi) s += postava(x, y, HORSI, false);
    else s += postava(x, y, STEJNE, true);
  }
  return s;
}

// uspořádání: 'vedle' (2019 vlevo, 2024 vpravo) nebo 'pod' (2019 nahoře)
const MEZERA = 1.3;
function motiv(usp) {
  if (usp === 'vedle') return { w: 20 + MEZERA, h: POPIS + 10, svg: skupina(0, 0, ROKY[0]) + skupina(10 + MEZERA, 0, ROKY[1]) };
  return { w: 10, h: 2 * (POPIS + 10) + MEZERA, svg: skupina(0, 0, ROKY[0]) + skupina(0, POPIS + 10 + MEZERA, ROKY[1]) };
}

// [šířka, výška, uspořádání, plocha motivu x0, y0, x1, y1, zarovnání vodorovně 0–1]
const POLOHA = {
  homepage: [1500, 1200, 'pod', [880, 300, 1320, 1090], 1],
  og: [1200, 630, 'vedle', [322, 262, 878, 584], 0.5],
  square: [1080, 1080, 'pod', [650, 70, 1010, 1010], 1],
  instagram: [1080, 1350, 'vedle', [70, 668, 1010, 1100], 0.5],
  story: [1080, 1920, 'vedle', [70, 815, 1010, 1415], 0.5],
};

for (const [k, [W, H, usp, [x0, y0, x1, y1], zar]] of Object.entries(POLOHA)) {
  const mm = motiv(usp);
  const sc = Math.min((x1 - x0) / mm.w, (y1 - y0) / mm.h);
  const tx = x0 + (x1 - x0 - mm.w * sc) * zar, ty = y0 + (y1 - y0 - mm.h * sc) / 2;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc)})">${mm.svg}</g></svg>`);
}
console.log(`motiv hotový (1 postava = 1 %): ${ROKY.map((r) => `${r.rok} lepší ${r.lepsi}, horší ${r.horsi}, stejná / neví ${100 - r.lepsi - r.horsi}`).join('; ')}`);

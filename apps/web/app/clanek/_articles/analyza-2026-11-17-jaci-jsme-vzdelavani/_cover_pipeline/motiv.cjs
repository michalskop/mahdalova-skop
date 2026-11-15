// Motiv coveru kapitoly Vzdělávání (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// Lidé starší 15 let s vysokou školou podle sčítání lidu 1991 a 2021, 1 postava s akademickým čepcem = 20 000 lidí.
// Dvě skupiny pod sebou („1991“, „2021“), v každé řádek žen (#f76800, brandOrange.6) a řádek mužů (#06677d,
// brandTeal.7) – barvy pohlaví nikdy růžová/modrá. Je vidět, že žen přibylo skoro čtyřikrát, mužů dvakrát.
// Čísla: _data_pipeline/cisla.json (sc_vs_ženy_1991_abs 217 687, sc_vs_muži_1991_abs 365 162, sc_vs_ženy_2021_abs
// 823 196, sc_vs_muži_2021_abs 729 211; SLDB 1991 a 2021, ČSÚ), zaokrouhlená na celé postavy: 11, 18, 41, 36.
// Kateřina 15. 11. 2026: titulek o tom, kolikrát vysokoškolaček a vysokoškoláků přibylo, ženy a muži zvlášť.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const cisla = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json'));
const NA_POSTAVU = 20000;
const ZENY = '#f76800', MUZI = '#06677d', OBRYS_MUZI = '#1a9fbd', TEXT = '#f8f6f0'; // brandOrange.6, brandTeal.7/.5
const n = (k) => Math.round(cisla[k] / NA_POSTAVU);
const ROKY = [
  { rok: '1991', zeny: n('sc_vs_ženy_1991_abs'), muzi: n('sc_vs_muži_1991_abs') },
  { rok: '2021', zeny: n('sc_vs_ženy_2021_abs'), muzi: n('sc_vs_muži_2021_abs') },
];
const f = (v) => v.toFixed(2);

// postava s akademickým čepcem (tvar z původního motivu), střed (x, y), krok mřížky s
function postava(x, y, s, barva, obrys) {
  const r = s * 0.17, hy = y - s * 0.1;
  const st = obrys ? ` stroke="${obrys}" stroke-width="${f(s * 0.03)}"` : '';
  const telo = `M ${f(x - s * 0.3)} ${f(y + s * 0.4)} Q ${f(x - s * 0.3)} ${f(y + s * 0.12)} ${f(x)} ${f(y + s * 0.12)} Q ${f(x + s * 0.3)} ${f(y + s * 0.12)} ${f(x + s * 0.3)} ${f(y + s * 0.4)} Z`;
  let g = `<circle cx="${f(x)}" cy="${f(hy)}" r="${f(r)}" fill="${barva}"${st}/><path d="${telo}" fill="${barva}"${st}/>`;
  const cy = hy - r * 0.95, w = s * 0.3, v = s * 0.085;
  g += `<path d="M ${f(x - w)} ${f(cy)} L ${f(x)} ${f(cy - v)} L ${f(x + w)} ${f(cy)} L ${f(x)} ${f(cy + v)} Z" fill="${barva}" stroke="#101432" stroke-width="${f(s * 0.03)}"/>`;
  g += `<path d="M ${f(x + w * 0.7)} ${f(cy + v * 0.2)} L ${f(x + w * 0.78)} ${f(cy + s * 0.2)}" stroke="${barva}" stroke-width="${f(s * 0.035)}" stroke-linecap="round"/>`;
  return g;
}

// motiv v jednotkách kroku (1 = jedna postava), K postav v řádku; vrací šířku, výšku a SVG
function motiv(K) {
  const FS = 0.62; // popisek roku
  let y = 0, s = '';
  ROKY.forEach((r, j) => {
    if (j) y += 0.55; // mezera mezi skupinami
    s += `<text x="0.2" y="${f(y + FS)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${FS}" letter-spacing="${f(FS * 0.04)}" fill="${TEXT}">${r.rok}</text>`;
    y += FS + 0.45;
    for (const [pocet, barva, obrys] of [[r.zeny, ZENY, null], [r.muzi, MUZI, OBRYS_MUZI]]) {
      for (let i = 0; i < pocet; i++) {
        const sl = i % K, rad = Math.floor(i / K);
        s += postava(sl + 0.5, y + rad + 0.5, 1, barva, obrys);
      }
      y += Math.ceil(pocet / K) + 0.12;
    }
  });
  return { w: K, h: y, svg: s };
}

// [šířka, výška, postav v řádku, plocha motivu x0, y0, x1, y1]
const POLOHA = {
  homepage: [1500, 1200, 21, [180, 575, 1320, 990]],
  og: [1200, 630, 21, [320, 258, 880, 528]],
  square: [1080, 1080, 21, [70, 525, 1010, 915]],
  instagram: [1080, 1350, 18, [70, 575, 1010, 1070]],
  story: [1080, 1920, 18, [70, 790, 1010, 1420]],
};

for (const [k, [W, H, K, [x0, y0, x1, y1]]] of Object.entries(POLOHA)) {
  const m = motiv(K);
  const sc = Math.min((x1 - x0) / m.w, (y1 - y0) / m.h);
  const tx = x0, ty = y0 + (y1 - y0 - m.h * sc) / 2;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc)})">${m.svg}</g></svg>`);
}
console.log(`motiv hotový (1 postava = ${NA_POSTAVU} lidí): ${ROKY.map((r) => `${r.rok} ženy ${r.zeny}, muži ${r.muzi}`).join('; ')}`);

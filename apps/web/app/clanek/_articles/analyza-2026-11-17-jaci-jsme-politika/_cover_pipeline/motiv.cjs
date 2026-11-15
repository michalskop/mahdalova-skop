// Motiv coveru kapitoly Politika (speciál Jací jsme byli, jací jsme – 1989 × 2026):
// dvě tečkové Sněmovny po 200 křeslech vedle sebe – poslanci zvolení v roce 1990 (Česká národní rada)
// a v roce 2025 (Poslanecká sněmovna). Ženy brandOrange.6 #f76800, muži brandTeal.7 #06677d
// (genderové barvy webu, nikdy růžová × modrá). Ženská křesla jdou souvisle zleva, ať je podíl vidět jako výseč.
// Čísla: _data_pipeline/vystup.txt (vypocet.py, ČSÚ zvolení poslanci):
//   „ČNR 1990: žen 13,0 % (26 z 200)“, „PS 2025: žen 33,5 % (67 z 200)“; v článku 1. odstavec.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const ZENY = '#f76800'; // brandOrange.6
const MUZI = '#06677d'; // brandTeal.7
const POPIS = '#f8f6f0'; // background.2
const SNEMOVNY = [
  { rok: '1990', zen: 26 }, // ČNR 1990: 26 z 200
  { rok: '2025', zen: 67 }, // PS 2025: 67 z 200
];
const KRESEL = 200;

// Půlkruh: 8 řad, počet křesel v řadě úměrný poloměru, součet 200
function snemovna(cx, cy, R, zen, rok) {
  const n = 8, r0 = 0.4;
  const rady = Array.from({ length: n }, (_, i) => R * (r0 + ((1 - r0) * i) / (n - 1)));
  const suma = rady.reduce((a, b) => a + b, 0);
  const pocty = rady.map((r) => Math.round((KRESEL * r) / suma));
  pocty[n - 1] += KRESEL - pocty.reduce((a, b) => a + b, 0);
  const kresla = [];
  rady.forEach((r, i) => {
    for (let j = 0; j < pocty[i]; j++) {
      const t = Math.PI - (Math.PI * (j + 0.5)) / pocty[i];
      kresla.push({ x: cx + r * Math.cos(t), y: cy - r * Math.sin(t), t, i });
    }
  });
  kresla.sort((a, b) => b.t - a.t || a.i - b.i);
  const krok = (R * (1 - r0)) / (n - 1);
  const rt = krok * 0.36;
  const tecky = kresla.map((k, idx) => `<circle cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="${rt.toFixed(1)}" fill="${idx < zen ? ZENY : MUZI}"/>`).join('');
  const fs_ = R * 0.2;
  const popisek = `<text x="${cx.toFixed(1)}" y="${(cy - R * 0.04).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${fs_.toFixed(1)}" fill="${POPIS}">${rok}</text>`;
  return tecky + popisek;
}

// formát: [šířka, výška, [[cx, cy (základna), R], [cx, cy, R]]]
const POLOHA = {
  homepage: [1500, 1200, [[500, 975, 300], [1140, 975, 300]]],
  og: [1200, 630, [[435, 530, 150], [765, 530, 150]]],
  square: [1080, 1080, [[300, 900, 238], [780, 900, 238]]],
  instagram: [1080, 1350, [[500, 885, 270], [500, 1175, 270]]],
  story: [1080, 1920, [[540, 1075, 330], [540, 1470, 330]]],
};

for (const [k, [W, H, pozice]] of Object.entries(POLOHA)) {
  const g = pozice.map(([cx, cy, R], i) => snemovna(cx, cy, R, SNEMOVNY[i].zen, SNEMOVNY[i].rok)).join('');
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
  console.log(`motiv-${k}.svg`);
}

// Motiv coveru: retro televize ze speciálu Svobodná média (apps/web/public/images/specials/svobodna-media.svg),
// ale bez vínového pozadí speciálu a bez nápisu „Freedom“ (Kateřina 3. 11. 2026: stejný motiv, jiné pozadí,
// vlastní wording). Rastrové tečky za televizí přebarvené z #161730 na brandNavy.7 #4c4f8e, aby byly na ink blue vidět.
// Obrazovka zůstává průhledná (prosvítá ink blue pozadí coveru), na ní donut DataTimes jako ve speciálu.
// node motiv.cjs → motiv-<formát>.svg (mimo git, viz .gitignore článku); pak node tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const ZDROJ = path.join(REPO, 'apps', 'web', 'public', 'images', 'specials', 'svobodna-media.svg');
const TECKY = '#4c4f8e'; // brandNavy.7

let s = fs.readFileSync(ZDROJ, 'utf8');
const vnitrek = s.slice(s.indexOf('>') + 1, s.lastIndexOf('</svg>'));
// 1) vínové pozadí speciálu (bílý + #812840 obdélník přes celý formát)
let v = vnitrek.replace(/<g clip-path="url\(#c8bb2f1d5c\)">[\s\S]*?<\/g>/, '');
// 2) nápis „Freedom“ (poslední skupina, žluté a fialové glyfy)
const iFreedom = v.indexOf('<g transform="matrix(1, 0, 0, 1, 2, 60)">');
if (iFreedom < 0) throw new Error('Nápis Freedom ve zdroji nenalezen');
v = v.slice(0, iFreedom);
// 3) tečky za televizí
v = v.replace('fill="#161730"', `fill="${TECKY}"`);
if (v.includes('#812840') || v.includes('#ffcf02')) throw new Error('Ve motivu zůstalo pozadí nebo nápis speciálu');

// Střed televize ve zdroji (viewBox 810 × 1012,5) a kam ho v každém formátu posadit: [střed x, střed y, měřítko]
const STRED = [401, 484];
const POLOHA = {
  homepage: [1500, 1200, [1110, 800, 1.2]],
  og: [1200, 630, [855, 375, 0.74]],
  square: [1080, 1080, [640, 790, 0.95]],
  instagram: [1080, 1350, [680, 930, 1.0]],
  story: [1080, 1920, [560, 1200, 1.08]],
};

for (const [k, [W, H, [cx, cy, m]]] of Object.entries(POLOHA)) {
  const tx = cx - STRED[0] * m, ty = cy - STRED[1] * m;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${m})">${v}</g></svg>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), svg);
  console.log(`motiv-${k}.svg`);
}

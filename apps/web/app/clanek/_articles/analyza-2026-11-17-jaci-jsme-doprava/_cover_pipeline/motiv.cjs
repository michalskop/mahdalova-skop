// Motiv coveru kapitoly Doprava (speciál Jací jsme byli, jací jsme – 1989 × 2026): dvě „parkoviště“ po 100 místech.
// Jedno místo = 10 osobních aut na 1 000 obyvatel. Vlevo rok 1990 (234 aut na 1 000 obyvatel → 23 autíček, barva
// „tehdy“ #6267a3), vpravo dnes (2025: 621 → 62 autíček, karmínová #de1743); volná místa jako tlumené tečky.
// Čísla: _data_pipeline/cisla.json (výstup cisla.py, viz i vystup.txt: (auta_1000_tehdy = [1990, 234], auta_1000_dnes = [2025, 621]; Eurostat road_eqs_carhab).
// node motiv.cjs → motiv-<formát>.svg (mimo git, viz .gitignore článku)
const fs = require('fs');
const path = require('path');

const cisla = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json'));
const cislo = (klic) => cisla[klic][1]; // [rok, aut na 1 000 obyvatel]
const TEHDY = Math.round(cislo('auta_1000_tehdy') / 10); // 234 → 23
const DNES = Math.round(cislo('auta_1000_dnes') / 10); // 621 → 62

const C_TEHDY = '#6267a3', C_DNES = '#de1743', VOLNO = '#4c4f8e', KREM = '#f8f6f0', NAVY = '#101432';
const f1 = (v) => v.toFixed(1);

// osobní auto z boku v jednotkovém čtverci, okna a kola s mezerou v barvě pozadí
const AUTO = (barva) => `<path fill="${barva}" d="M.05 .7V.56Q.05 .48 .13 .47L.27 .45L.37 .31Q.4 .27 .46 .27H.65Q.71 .27 .75 .31L.86 .45Q.95 .47 .95 .56V.7Z"/>`
  + `<path fill="${NAVY}" d="M.4 .44L.47 .34H.57V.44Z M.61 .44V.34H.66Q.69 .34 .71 .36L.77 .44Z"/>`
  + `<circle cx=".28" cy=".72" r=".11" fill="${barva}" stroke="${NAVY}" stroke-width=".05"/><circle cx=".72" cy=".72" r=".11" fill="${barva}" stroke="${NAVY}" stroke-width=".05"/>`;

function parkoviste(x0, y0, s, pomer, n, barva, popisek, fs_) {
  // místo = s × s·pomer; auto (svisle .27–.83 jednotkového čtverce) sedí na spodku místa
  const h = s * pomer, a = s * 0.94;
  let g = `<text x="${f1(x0 + s * 0.04)}" y="${f1(y0 - fs_ * 0.5)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${f1(fs_)}" fill="${barva === C_DNES ? KREM : '#b4b8e0'}" letter-spacing="${f1(fs_ * 0.06)}">${popisek}</text>`;
  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / 10), col = i % 10;
    const x = x0 + col * s + (s - a) / 2, y = y0 + row * h + h - a * 0.86;
    // volné místo = totéž auto ztlumené (prázdný piktogram, COVER-VIZUALNI-IDENTITA 4.2)
    g += `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(a)})"${i < n ? '' : ' opacity="0.32"'}>${AUTO(i < n ? barva : VOLNO)}</g>`;
  }
  return g;
}

// [W, H, x0, y0, krok, výška místa / krok, mezera, pod sebou?, velikost popisku]
const POLOHA = {
  homepage: [1500, 1200, 178, 600, 58, 0.66, 60, false, 34],
  og: [1200, 630, 322, 300, 26.5, 0.7, 26, false, 20],
  square: [1080, 1080, 70, 580, 45, 0.82, 50, false, 30],
  instagram: [1080, 1350, 70, 680, 45, 1.0, 50, false, 30],
  story: [1080, 1920, 250, 740, 58, 0.56, 76, true, 32],
};
for (const [k, [W, H, x0, y0, s, pomer, mez, podSebou, fs_]] of Object.entries(POLOHA)) {
  const [x1, y1] = podSebou ? [x0, y0 + 10 * s * pomer + mez] : [x0 + 10 * s + mez, y0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + parkoviste(x0, y0, s, pomer, TEHDY, C_TEHDY, '1990', fs_)
    + parkoviste(x1, y1, s, pomer, DNES, C_DNES, 'DNES', fs_) + '</svg>';
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), svg);
}
console.log(`motiv Doprava: 1990 ${TEHDY} aut, dnes ${DNES} aut (1 auto = 10 aut na 1 000 obyvatel)`);

// Motiv coveru: „slunečnice“ z teček – 1 tečka = 10 dívek do 18 let léčených s poruchou příjmu potravy (dg. F50,
// unikátní pacientky, ÚZIS – NZIP datový souhrn NR-04-25). Tečky jsou rozložené po Vogelově spirále (fylotaxe),
// takže disk roste od středu: vnitřních 120 teček = rok 2010 (1 199 dívek, tlumeně), celý disk 386 teček = rok 2025
// (3 858 dívek); 266 teček, o které disk vyrostl, je zvýrazněných oranžově. Plocha disku je úměrná počtu dívek.
// Citlivé téma: záměrně jen abstraktní tečky – žádná těla, siluety, jídlo ani váhy.
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const DIVKY = { 2010: 1199, 2025: 3858 }; // z _data_pipeline (zadání coveru), neměnit
const N0 = Math.round(DIVKY[2010] / 10); // 120 teček
const N1 = Math.round(DIVKY[2025] / 10); // 386 teček

const ORANZ = '#f76800'; // brandOrange.6 – dívky (genderové barvy: ženy oranžová)
const TLUM = '#994800'; // brandOrange.8 – stav v roce 2010
const ZARE = '#663200'; // brandOrange.9 – záře za diskem
const POPIS = '#ffe0c7'; // brandOrange.1
const NAVY = '#101432'; // brandNavy.9

const ZLATY = Math.PI * (3 - Math.sqrt(5)); // zlatý úhel

// Disk: [střed x, střed y, poloměr celého disku (rok 2025)] pro každý formát; OG má dva disky (2010 vlevo, 2025 vpravo).
const FORMATY = {
  homepage: { W: 1500, H: 1200, disky: [[1135, 860, 320, N1]] },
  square: { W: 1080, H: 1080, disky: [[775, 775, 285, N1]] },
  instagram: { W: 1080, H: 1350, disky: [[700, 945, 320, N1]] },
  story: { W: 1080, H: 1920, disky: [[610, 1195, 315, N1]] },
  og: { W: 1200, H: 630, disky: [[172, 300, 0, N0], [1040, 300, 158, N1]], popisky: true },
};

const f1 = (v) => v.toFixed(1);

function disk(cx, cy, c, n, rot) {
  const r = c * 0.56; // poloměr tečky
  let out = '';
  for (let i = 0; i < n; i++) {
    const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY + rot;
    const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
    out += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${i < N0 ? TLUM : ORANZ}"/>`;
  }
  return out;
}

// Sdílené s animace.config.cjs (slunečnice rostoucí 2010 → 2025): stejné rozložení disků a barvy.
module.exports = { FORMATY, ZLATY, N0, N1, barvy: { ORANZ, TLUM, ZARE, POPIS, NAVY } };

if (require.main === module) for (const [klic, F] of Object.entries(FORMATY)) {
  // společná rozteč c ze zadaného poloměru disku 2025 (u OG i pro menší disk 2010, ať je měřítko stejné)
  const R25 = F.disky.find((d) => d[3] === N1)[2];
  const c = R25 / Math.sqrt(N1 + 0.5);
  let svg = `<defs><radialGradient id="zare"><stop offset="0" stop-color="${ZARE}" stop-opacity=".5"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs>`;
  for (const [cx, cy, , n] of F.disky) {
    const R = c * Math.sqrt(n + 0.5);
    svg += `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.45)}" fill="url(#zare)"/>`;
  }
  for (const [cx, cy, , n] of F.disky) svg += disk(cx, cy, c, n, -Math.PI / 2);
  if (F.popisky) {
    const fs_ = 21;
    for (const [cx, cy, , n] of F.disky) {
      const R = c * Math.sqrt(n + 0.5);
      const rok = n === N0 ? '2010' : '2025';
      svg += `<text x="${cx}" y="${f1(cy + R + fs_ * 1.45)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${fs_}" letter-spacing="1" fill="${POPIS}" stroke="${NAVY}" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${rok}</text>`;
    }
  }
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${svg}</svg>`);
}
if (require.main === module) console.log(`motiv hotový: ${N0} teček (2010) → ${N1} teček (2025), přibylo ${N1 - N0}`);

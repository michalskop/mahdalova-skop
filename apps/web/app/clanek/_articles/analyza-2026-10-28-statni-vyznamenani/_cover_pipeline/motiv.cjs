// Motiv coveru: medaile ze všech státních vyznamenání 1995–2025 – 1 tečka = 1 vyznamenání
// (oficiální seznamy Hradu, ../_data_pipeline/vstupy/hrad_seznamy.csv). Tečky jdou od středu ven
// v pořadí udělení: uprostřed Havel (1995), na okraji Pavel (2025). Oranžové tečky = ženy;
// vnější prstenec (Pavel) je proto viditelně oranžovější.
// Nad diskem stuha v barvách trikolóry. Vzor slunečnice: analyza-2026-10-08-znasilneni…/_cover_pipeline/motiv.cjs
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const PREZ = [ // barvy prezidentů na tmavém pozadí (světlejší odstíny týchž škál jako v grafech)
  ['Havel', 'Václav Havel', '#697fe6', 2002], // brandRoyalBlue.4
  ['Klaus', 'Václav Klaus', '#ff4970', 2012], // brand.3
  ['Zeman', 'Miloš Zeman', '#f8f6f0', 2022], // background.2 – světlá béžová jako bílý pruh stuhy: Havel, Zeman, Klaus = trikolóra (Kateřina 28. 10. 2026)
  ['Pavel', 'Petr Pavel', '#1a9fbd', 2025], // brandTeal.5
];
// VARIANTA=prezidenti obarví tečky podle prezidenta místo podle pohlaví
const PODLE_PREZIDENTU = process.env.VARIANTA === 'prezidenti';
const STUHA = ['#f8f6f0', '#de1743', '#4a51ab']; // bílá (background.2), karmínová (brand.6), modrá (brandRoyalBlue.6)
const ZLATY = Math.PI * (3 - Math.sqrt(5));

// tecky.json zapisuje 02_analyza.py: vyznamenání 1995–2025 seřazená podle roku, [rok, pohlaví, prezident]
// (prezident ze dat, ne z roku: v lednu 2003 ještě vyznamenával Havel, k 1. 1. 2023 Zeman)
const zaznamy = JSON.parse(fs.readFileSync(path.join(__dirname, 'tecky.json'), 'utf8'));
const ZENY = '#f76800'; // brandOrange.6 – ženy (barvy pohlaví v grafech DataTimes)
const MUZI = '#4c4f8e'; // brandNavy.7 – muži (a 2 záznamy s neurčeným pohlavím) tlumeně
const N = zaznamy.length;

// [střed x, střed y, poloměr disku] pro každý formát
const FORMATY = {
  homepage: { W: 1500, H: 1200, disk: [1150, 900, 265], stuha: 0.7 },
  square: { W: 1080, H: 1080, disk: [810, 820, 215], stuha: 0.55 },
  instagram: { W: 1080, H: 1350, disk: [700, 1020, 240], stuha: 0.6 },
  story: { W: 1080, H: 1920, disk: [540, 1250, 300], stuha: 0.7 },
  og: { W: 1200, H: 630, disk: [770, 400, 150], stuha: 0.7 },
};
const f1 = (v) => v.toFixed(1);

module.exports = { FORMATY, PREZ, N, ZENY, MUZI, ZEN: zaznamy.filter((x) => x[1] === "Z").length };

if (require.main === module) {
  for (const [klic, F] of Object.entries(FORMATY)) {
    const [cx, cy, R] = F.disk;
    const c = R / Math.sqrt(N + 0.5), r = c * 0.58;
    // stuha: dva pásy z horního okraje disku šikmo nahoru, každý ve třech proužcích
    const sirka = R * 0.62, vyska = R * (F.stuha || 0.95), top = cy - R - vyska;
    let svg = `<defs><radialGradient id="zare"><stop offset="0" stop-color="#ffcf02" stop-opacity=".22"/><stop offset="1" stop-color="#ffcf02" stop-opacity="0"/></radialGradient></defs>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.45)}" fill="url(#zare)"/>`;
    for (const strana of [-1, 1]) {
      const x0 = cx + strana * R * 0.08, x1 = cx + strana * (R * 0.08 + sirka * 0.55);
      for (let s = 0; s < 3; s++) {
        const a = s / 3, b = (s + 1) / 3;
        // čtyřúhelník: dole u disku úzký, nahoře široký
        const pts = [
          [x0 + strana * sirka * 0.2 * a, cy - R * 0.55],
          [x0 + strana * sirka * 0.2 * b, cy - R * 0.55],
          [x1 + strana * sirka * 0.45 * b, top],
          [x1 + strana * sirka * 0.45 * a, top],
        ];
        svg += `<polygon points="${pts.map((p) => p.map(f1).join(',')).join(' ')}" fill="${STUHA[strana < 0 ? s : 2 - s]}"/>`;
      }
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.03)}" fill="#101432"/>`;
    for (let i = 0; i < N; i++) {
      const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
      svg += `<circle cx="${f1(cx + rr * Math.cos(a))}" cy="${f1(cy + rr * Math.sin(a))}" r="${f1(r)}" fill="${PODLE_PREZIDENTU ? PREZ.find((p) => p[0] === zaznamy[i][2])[2] : zaznamy[i][1] === "Z" ? ZENY : MUZI}"/>`;
    }
    fs.writeFileSync(path.join(__dirname, PODLE_PREZIDENTU ? `motiv-prezidenti-${klic}.svg` : `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${svg}</svg>`);
  }
  console.log(`motiv hotový: ${N} teček`);
}

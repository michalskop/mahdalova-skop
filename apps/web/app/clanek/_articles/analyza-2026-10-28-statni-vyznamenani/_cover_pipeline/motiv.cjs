// Motiv coveru: medaile ze všech státních vyznamenání 1995–2025 – 1 tečka = 1 vyznamenání
// (oficiální seznamy Hradu, ../_data_pipeline/vstupy/hrad_seznamy.csv). Tečky jdou od středu ven
// v pořadí udělení: uprostřed Havel (1995), na okraji Pavel (2025). Světlé béžové tečky = ženy na modré
// medaili mužů (Kateřina 28. 10. 2026: bez stereotypu modrá × růžová, stejné barvy jako trikolóra stuhy);
// vnější prstenec (Pavel) je proto viditelně světlejší.
// Nad diskem stuha v barvách trikolóry. Vzor slunečnice: analyza-2026-10-08-znasilneni…/_cover_pipeline/motiv.cjs
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
// VARIANTA=prezidenti node motiv.cjs → motiv-prezidenti-<formát>.svg pro článek …-komu (tečky podle prezidentů)
// medaile(klic, barva, navic) kreslí motiv i pro animace (animace.config.cjs: problikávající ženy)
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
const ZENY = '#f8f6f0'; // background.2 – ženy světlou béžovou (jako bílý pruh stuhy)
const MUZI = '#4a51ab'; // brandRoyalBlue.6 – muži (a 2 záznamy s neurčeným pohlavím) modrou medailí
const N = zaznamy.length;

// [střed x, střed y, poloměr disku] pro každý formát
const FORMATY = { // medaile co nejblíž k textu a co největší, ale stuha pod titulkem a mimo štítek rubriky (Kateřina 28. 10.)
  homepage: { W: 1500, H: 1200, disk: [1020, 830, 285], stuha: 0.55 },
  square: { W: 1080, H: 1080, disk: [720, 760, 250], stuha: 0.5 },
  instagram: { W: 1080, H: 1350, disk: [660, 930, 285], stuha: 0.55 },
  story: { W: 1080, H: 1920, disk: [540, 1270, 235], stuha: 0.4 }, // pod legendou, nad logem
  og: { W: 1200, H: 630, disk: [770, 375, 168], stuha: 0.5 },
};
// článek o ženách má třířádkový titulek: na homepage medaile níž a menší, aby stuha nevjela do titulku
// článek …-komu: legenda kratší (jen prezidenti), medaile větší a výš; poznámka „1 tečka = …“ vpravo dole na úrovni loga
// POZNAMKA[klic] = [pravý okraj x, účaří y, velikost písma] – pravý okraj bezpečné zóny, účaří loga DataTimes.cz
const POZNAMKA = { homepage: [1320, 1066, 27], square: [1010, 999, 24], instagram: [1010, 1229, 24], story: [1000, 1556, 26], og: [880, 576, 15] };
if (PODLE_PREZIDENTU) Object.assign(FORMATY, {
  homepage: { ...FORMATY.homepage, disk: [1090, 730, 295], stuha: 0.4 },
  square: { ...FORMATY.square, disk: [790, 685, 262], stuha: 0.4 },
  instagram: { ...FORMATY.instagram, disk: [680, 840, 330], stuha: 0.4 },
  story: { ...FORMATY.story, disk: [540, 1180, 300], stuha: 0.4 },
  og: { ...FORMATY.og, disk: [770, 360, 185], stuha: 0.4 },
});
if (!PODLE_PREZIDENTU) FORMATY.homepage = { ...FORMATY.homepage, disk: [1050, 880, 270], stuha: 0.5 };
if (!PODLE_PREZIDENTU) FORMATY.story = { ...FORMATY.story, disk: [540, 1258, 235], stuha: 0.4 };
const f1 = (v) => v.toFixed(1);

const barvaPodleDat = (i) => (PODLE_PREZIDENTU ? PREZ.find((p) => p[0] === zaznamy[i][2])[2] : zaznamy[i][1] === 'Z' ? ZENY : MUZI);

// Celé SVG motivu pro formát. barva(i) → barva tečky; navic(i, x, y, r) → SVG kreslené nad tečkou (záblesk v animaci)
function medaile(klic, barva = barvaPodleDat, navic = null) {
  const F = FORMATY[klic];
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
  let nad = '';
  for (let i = 0; i < N; i++) {
    const rr = c * Math.sqrt(i + 0.5), a = i * ZLATY - Math.PI / 2;
    const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
    svg += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${barva(i)}"/>`;
    if (navic) nad += navic(i, x, y, r);
  }
  if (PODLE_PREZIDENTU && POZNAMKA[klic]) {
    const [px, py, ps] = POZNAMKA[klic];
    nad += `<text x="${px}" y="${py}" text-anchor="end" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="500" font-size="${ps}" fill="#f8f6f0">1 tečka = 1 vyznamenání 1995–2025</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${svg}${nad}</svg>`;
}

module.exports = { FORMATY, PREZ, N, ZENY, MUZI, ZEN: zaznamy.filter((x) => x[1] === 'Z').length, zaznamy, medaile, f1 };

if (require.main === module) {
  for (const klic of Object.keys(FORMATY)) {
    fs.writeFileSync(path.join(__dirname, PODLE_PREZIDENTU ? `motiv-prezidenti-${klic}.svg` : `motiv-${klic}.svg`), medaile(klic));
  }
  console.log(`motiv hotový: ${N} teček`);
}

// Motiv coveru kapitoly Kriminalita a bezpečnost (speciál Jací jsme byli, jací jsme – 1989 × 2026): tečkové sloupce,
// jeden sloupec = jeden rok 1973–2025, 1 tečka = 20 000 trestných činů zjištěných policií (zbytek pod 20 000 = menší
// tečka s plochou úměrnou zbytku). Roky do 1989 barvou „tehdy“ #6267a3, 1990–2024 tlumeně (brandNavy.7),
// poslední rok (2025, „dnes“) karmínově. Data: data/trestne-ciny.json (z _data_pipeline/grafy.py; IKSP a ČSÚ).
// node motiv.cjs → motiv-<formát>.svg (mimo git, viz .gitignore článku)
const fs = require('fs');
const path = require('path');

const rada = require(path.join(__dirname, '..', 'data', 'trestne-ciny.json')).data.values.map((v) => [v.rok, v.tc]);
const JEDNOTKA = 20000;
const POSLEDNI = rada[rada.length - 1][0];
const TEHDY = '#6267a3', DNES = '#de1743', MEZI = '#4c4f8e', KREM = '#f8f6f0', NAVY = '#101432';
const f1 = (v) => v.toFixed(1);
const barva = (rok) => (rok <= 1989 ? TEHDY : rok === POSLEDNI ? DNES : MEZI);
const pruhl = (rok) => (rok > 1989 && rok < POSLEDNI ? ' opacity="0.55"' : '');
const POPISKY = { 1973: '1973', 1989: '1989', 1999: '1999', [POSLEDNI]: 'dnes' };

// [W, H, x levého okraje, y základny, šířka plochy, velikost popisků, svislá rozteč / vodorovná]
const POLOHA = {
  homepage: [1500, 1200, 172, 960, 1160, 26, 0.85],
  og: [1200, 630, 312, 500, 576, 16, 1],
  square: [1080, 1080, 62, 890, 956, 24, 0.95],
  instagram: [1080, 1350, 62, 1100, 956, 24, 1.35],
  story: [1080, 1920, 62, 1390, 956, 26, 1.75],
};
for (const [k, [W, H, x0, y0, w, fs_, vy]] of Object.entries(POLOHA)) {
  const krok = w / rada.length, r = krok * 0.4, kv = krok * vy;
  let g = '';
  rada.forEach(([rok, tc], c) => {
    const x = x0 + c * krok + krok / 2;
    const cele = Math.floor(tc / JEDNOTKA), zbytek = tc / JEDNOTKA - cele;
    const b = barva(rok);
    for (let i = 0; i < cele; i++) g += `<circle cx="${f1(x)}" cy="${f1(y0 - krok / 2 - i * kv)}" r="${f1(r)}" fill="${b}"${pruhl(rok)}/>`;
    if (zbytek > 0.04) g += `<circle cx="${f1(x)}" cy="${f1(y0 - krok / 2 - cele * kv)}" r="${f1(r * Math.sqrt(zbytek))}" fill="${b}"${pruhl(rok)}/>`;
    if (POPISKY[rok]) {
      const svetly = rok === POSLEDNI ? KREM : rok <= 1989 ? '#b4b8e0' : '#b4b8e0';
      g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(y0 + fs_ * 0.25)}" y2="${f1(y0 + fs_ * 0.6)}" stroke="${svetly}" stroke-width="${f1(fs_ * 0.08)}"/>`
        + `<text x="${f1(x)}" y="${f1(y0 + fs_ * 1.65)}" text-anchor="${rok === POSLEDNI ? 'end' : rok === 1973 ? 'start' : 'middle'}" dx="${rok === POSLEDNI ? f1(krok / 2) : rok === 1973 ? f1(-krok / 2) : 0}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${f1(fs_)}" fill="${svetly}">${POPISKY[rok]}</text>`;
    }
  });
  // úroveň roku 1989 čárkovaně až k dnešku: dnešní sloupec ji pořád přesahuje
  const i89 = rada.findIndex(([rok]) => rok === 1989), v89 = rada[i89][1] / JEDNOTKA;
  const yl = y0 - krok / 2 - (v89 - 0.5) * kv - r * 1.6;
  g += `<line x1="${f1(x0 + i89 * krok)}" x2="${f1(x0 + w)}" y1="${f1(yl)}" y2="${f1(yl)}" stroke="#b4b8e0" stroke-width="${f1(Math.max(1.5, krok * 0.12))}" stroke-dasharray="${f1(krok * 0.5)} ${f1(krok * 0.35)}"/>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
}
const tc = Object.fromEntries(rada);
console.log(`motiv Kriminalita: ${rada[0][0]}–${POSLEDNI}, 1989 ${tc[1989]} (${(tc[1989] / JEDNOTKA).toFixed(2)} teček), 1999 ${tc[1999]} (${(tc[1999] / JEDNOTKA).toFixed(2)}), ${POSLEDNI} ${tc[POSLEDNI]} (${(tc[POSLEDNI] / JEDNOTKA).toFixed(2)})`);

// Motiv coveru: tečkový sál Knesetu podle predikce, 1 tečka = 1 mandát (120).
// Zleva arabské strany (19), Eisenkotova opozice (48), Netanjahuův blok (53) – stav posledního přepočtu
// predikce 29. 10. 2026 6:59 SEČ (_data_pipeline/predikce.py). Svislá čárkovaná čára = polovina sálu:
// Netanjahuův blok k ní nedosáhne, k většině 61 mu chybí osm mandátů.
// node motiv.cjs → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

// mandáty z predikce (kontrola proti _data_pipeline/data/predikce_historie.json níže)
const BLOKY = [
  { n: 'arabské strany', m: 19, barva: '#8dd265' },        // brandForestGreen.3 (Ra'am zelená)
  { n: 'Eisenkotova opozice', m: 48, barva: '#8cdfef' },   // brandTeal.2 (Jašar světle modrá)
  { n: 'Netanjahuův blok', m: 53, barva: '#5e66d5' },      // brandRoyalBlue.5 (Likud modrá)
];
const H = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'data', 'predikce_historie.json'), 'utf8')).historie;
const posl = H[H.length - 1].strany;
const sedadla = (ks) => ks.reduce((a, k) => a + posl[k].seats, 0);
const kontrola = [sedadla(['ודם', 'עם']), sedadla(['דרך', 'רק', 'אמת', 'ל']), sedadla(['מחל', 'ג', 'שס', 'ב', 'ט'])];
if (kontrola.join() !== BLOKY.map((b) => b.m).join()) throw new Error(`mandáty nesedí s predikcí: ${kontrola}`);

// [střed x, střed y (spodní hrana sálu), vnější poloměr] pro každý formát
const FORMATY = {
  homepage: [1500, 1200, [1000, 910, 400]],
  og: [1200, 630, [600, 560, 300]],
  square: [1080, 1080, [700, 880, 300]],
  instagram: [1080, 1350, [540, 1090, 400]],
  story: [1080, 1920, [540, 1440, 430]],
};

// rozmístění 120 sedadel do řad půlkruhu (počet v řadě úměrný poloměru), pak podle úhlu zleva doprava
function sal(cx, cy, R) {
  const RADY = 7, r0 = R * 0.3, N = 120; // r0 0,3 R: rozestup v řadě ≈ rozestup řad, oblouky jsou čitelné
  const polomery = Array.from({ length: RADY }, (_, i) => r0 + ((R - r0) * i) / (RADY - 1));
  const soucet = polomery.reduce((a, b) => a + b, 0);
  const pocty = polomery.map((r) => Math.round((N * r) / soucet));
  pocty[RADY - 1] += N - pocty.reduce((a, b) => a + b, 0);
  const body = [];
  polomery.forEach((r, i) => {
    for (let j = 0; j < pocty[i]; j++) {
      const a = Math.PI - (Math.PI * j) / (pocty[i] - 1);
      body.push({ a, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
    }
  });
  body.sort((p, q) => q.a - p.a);
  const rTecka = ((R - r0) / (RADY - 1)) * 0.34;
  return { body, rTecka, r0 };
}

for (const [klic, [W, Hh, [cx, cy, R]]] of Object.entries(FORMATY)) {
  const { body, rTecka } = sal(cx, cy, R);
  let i = 0;
  const tecky = BLOKY.flatMap((b) => Array.from({ length: b.m }, () => body[i++]).map((p) =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rTecka.toFixed(1)}" fill="${b.barva}"/>`)).join('');
  // polovina sálu: čárkovaná svislice od spodní hrany kousek nad vnější řadu
  const cara = `<line x1="${cx}" y1="${cy + rTecka}" x2="${cx}" y2="${(cy - R - rTecka * 3).toFixed(1)}" stroke="#f8f6f0" stroke-width="${(rTecka * 0.32).toFixed(1)}" stroke-dasharray="${(rTecka * 0.9).toFixed(1)} ${(rTecka * 0.7).toFixed(1)}" opacity="0.75"/>`;
  const fs1 = Math.round(R * 0.075);
  const popis = `<text x="${cx}" y="${(cy - R - rTecka * 3 - fs1 * 0.5).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${fs1}" fill="#f8f6f0">většina 61</text>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}">${tecky}${cara}${popis}</svg>`);
}
console.log('motiv hotový: bloky', BLOKY.map((b) => `${b.n} ${b.m}`).join(', '));

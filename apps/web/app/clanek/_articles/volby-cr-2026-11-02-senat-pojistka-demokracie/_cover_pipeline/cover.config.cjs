// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: tečkový půlkruh Senátu, 81 křesel = 81 teček. Vpravo 15 provládních senátorů (14 v klubu ANO a Daniela
// Kovářová) karmínově, nejistý Petr Korč jako prázdný kroužek, 65 protivládních tlumeně – stav k 3. 11. 2026
// jako v článku a v grafu grafy/kluby-49.html.
const PROTI = 65, NEJISTY = 1, PRO = 15;
if (PROTI + NEJISTY + PRO !== 81) throw new Error('Senát má 81 křesel');

const C_PRO = '#ff1a4a'; // brand.4
const C_PROTI = '#6267a3'; // brandNavy.6
const C_NEJ = '#d2d8e9'; // brandNavy.1 – obrys

// Půlkruh: řady od vnitřní po vnější, počet křesel v řadě úměrný poloměru; křesla seřazená podle úhlu zleva doprava.
function pulkruh(cx, cy, R) {
  const rady = 5, r0 = 0.42 * R, sum = (k) => r0 + (R - r0) * (k / (rady - 1));
  const polomery = Array.from({ length: rady }, (_, i) => sum(i));
  const celkem = polomery.reduce((a, b) => a + b, 0);
  let pocty = polomery.map((r) => Math.round((81 * r) / celkem));
  pocty[rady - 1] += 81 - pocty.reduce((a, b) => a + b, 0);
  const sedadla = [];
  polomery.forEach((r, i) => {
    const n = pocty[i];
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (Math.PI * j) / (n - 1);
      sedadla.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), a });
    }
  });
  sedadla.sort((p, q) => q.a - p.a); // zleva doprava
  const t = (0.5 * (R - r0)) / (rady - 1) * 0.72; // poloměr tečky
  return sedadla.map((s, i) => {
    const typ = i < PROTI ? 'proti' : i < PROTI + NEJISTY ? 'nej' : 'pro';
    return typ === 'nej'
      ? `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${(t * 0.82).toFixed(1)}" fill="none" stroke="${C_NEJ}" stroke-width="${(t * 0.3).toFixed(1)}"/>`
      : `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${t.toFixed(1)}" fill="${typ === 'pro' ? C_PRO : C_PROTI}"/>`;
  }).join('');
}
const svg = (w, h, cx, cy, R) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${pulkruh(cx, cy, R)}</svg>`;

module.exports = {
  vystup: require('path').join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Senát po volbách 2026' },
  // titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek)
  legendaPodTextem: true,
  legenda: [[null, 'Senát, 81 křesel'], [C_PRO, 'na straně vlády']],
  logo: 'vlevo',
  barvy: { glowA: '#8b0e2b', glowB: '#4c4f8e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: {
    typ: 'svg',
    svg: {
      homepage: svg(1500, 1200, 1010, 1050, 390),
      og: svg(1200, 630, 600, 600, 280),
      square: svg(1080, 1080, 700, 925, 290),
      instagram: svg(1080, 1350, 560, 1160, 400),
      story: svg(1080, 1920, 540, 1420, 400),
    },
  },
};

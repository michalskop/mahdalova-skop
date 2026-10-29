// Motiv coveru: tečková mapa ČR a v každé z 21 obcí s referendem malá větrná turbína – zlatá tam, kde lidé
// výstavbu odmítli, tyrkysová v Dětřichově, který ji podpořil. Výška turbíny roste s počtem hlasujících.
// node motiv.cjs   (obce.json vyrábí ../_data_pipeline/build.py; tečky mapy z článku predikce senátu)
// Vyrobí motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg').
// Pro animaci a carousel exportuje kresli(klic, { stav, otoceni }) – stav(o, i) vrací měřítko turbíny 0–1.
const fs = require('fs');
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const dots = require(path.join(ZDROJ, 'senat-mapa.json')).dots;
const obce = require(path.join(__dirname, 'obce.json'));

// Zamítnuté turbíny tmavší zlatou, aby jediné „ano“ (Dětřichov) svítilo (Kateřina 25. 10.: oranžová se tloukla
// se sousední kartou na homepage, pak „ať ten schválený větrník poutá pozornost“).
const PROTI = process.env.PROTI_BARVA || '#bd9103'; // brandYellow.8
const PRO = '#5fcce6'; // brandTeal.3 – jasný tyrkys pro Dětřichov
const ZARE = '#33b9d9'; // brandTeal.4 – záře pod Dětřichovem
const KREM = '#f8f6f0'; // světlá kontura Dětřichova
const TECKA = '#2f325c'; // brandNavy.8
const NAVY = '#101432'; // brandNavy.9

// Stejné plochy mapy jako tools/cover-generator.cjs (FORMATY[].mapa, homepage podle mapaPozice v cover.config.cjs).
const MAPA = {
  homepage: [1500, 1200, [140, 470, 1500, 1170]], og: [1200, 630, [190, 165, 1010, 628]],
  square: [1080, 1080, [20, 470, 1070, 1050]], instagram: [1080, 1350, [20, 560, 1070, 1260]],
  story: [1080, 1920, [0, 860, 1080, 1580]],
};

const lon = dots.map((d) => d[0]), lat = dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
const kx = Math.cos((49.8 * Math.PI) / 180);
const maxHl = Math.max(...obce.map((o) => o.hlasujicich));
// Dětřichov kreslit poslední, ať ho sousední turbíny Svitavska nepřekryjí.
const poradi = [...obce].sort((a, b) => (a.vysledek === 'pro výstavbu') - (b.vysledek === 'pro výstavbu'));
const f = (v) => v.toFixed(1);

// stav(o, i) → měřítko turbíny 0–1 (animace: vyrůstání); otoceni → úhel listů ve stupních navíc (animace: točení)
// popisek = true: u Dětřichova jméno (OG ho nemá, střed zabírá text)
function kresli(klic, { stav = () => 1, otoceni = 0, plocha, popisek = true } = {}) {
  const [W, H, vychozi] = MAPA[klic];
  const [mx0, my0, mx1, my1] = plocha ?? vychozi;
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  // i u OG plná mapa, jinak turbíny visí ve vzduchu (Kateřina 24. 10.)
  const t = dots.map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${TECKA}"/>`; }).join('');
  const turbiny = poradi.map((o, i) => {
    const k = stav(o, i);
    if (k <= 0.01) return '';
    const [x, y] = P(o.lon, o.lat);
    const ano = o.vysledek === 'pro výstavbu';
    const c = ano ? PRO : PROTI;
    const obrys = ano ? KREM : NAVY; // Dětřichov: světlá kontura, ostatní tmavá
    const hm = sc * (0.15 + 0.11 * Math.sqrt(o.hlasujicich / maxHl)) * k * (ano ? 1.35 : 1); // výška stožáru
    const L = hm * 0.6, sw = Math.max(1.8, sc * 0.012) * (ano ? 1.25 : 1), hy = y - hm;
    const a0 = ((obce.indexOf(o) * 47) % 120) + otoceni; // natočení listů – jen kvůli živosti, ne data
    const listy = [0, 120, 240].map((d) => {
      const a = ((a0 + d - 90) * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a);
      const tx = x + Math.cos(a) * L, ty = hy + Math.sin(a) * L, w = L * 0.17;
      const mxp = x + Math.cos(a) * L * 0.3, myp = hy + Math.sin(a) * L * 0.3;
      return `<path d="M${f(x)},${f(hy)} L${f(mxp + nx * w)},${f(myp + ny * w)} L${f(tx)},${f(ty)} L${f(mxp - nx * w * 0.35)},${f(myp - ny * w * 0.35)} Z" fill="${c}" stroke="${obrys}" stroke-width="${f(sw * (ano ? 0.9 : 0.45))}" stroke-linejoin="round"/>`;
    }).join('');
    const zare = ano ? `<defs><radialGradient id="zare-${klic}"><stop offset="0" stop-color="${ZARE}" stop-opacity=".55"/><stop offset="1" stop-color="${ZARE}" stop-opacity="0"/></radialGradient></defs><circle cx="${f(x)}" cy="${f(hy)}" r="${f(hm * 1.25)}" fill="url(#zare-${klic})"/>` : '';
    const fs2 = sc * 0.085;
    const jmeno = ano && popisek && k > 0.9 ? `<text x="${f(x + L * 0.75)}" y="${f(hy - L * 0.55)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${f(fs2)}" fill="${PRO}" stroke="${NAVY}" stroke-width="${f(fs2 * 0.18)}" stroke-linejoin="round" paint-order="stroke">Dětřichov</text>` : '';
    return `<g>${zare}<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(hy)}" stroke="${obrys}" stroke-width="${f(sw * 2.4)}" stroke-linecap="round"/><line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(hy)}" stroke="${c}" stroke-width="${f(sw)}" stroke-linecap="round"/>${listy}<circle cx="${f(x)}" cy="${f(hy)}" r="${f(sw * 1.3)}" fill="${c}" stroke="${obrys}" stroke-width="${f(sw * 0.45)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(sw * 1.5)}" fill="${c}"/>${jmeno}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${t}${turbiny}</svg>`;
}

module.exports = { kresli, poradi, obce, MAPA, barvy: { PROTI, PRO, ZARE, TECKA, NAVY } };

if (require.main === module) {
  for (const klic of Object.keys(MAPA)) fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), kresli(klic));
  console.log('motiv hotový,', obce.length, 'obcí');
}

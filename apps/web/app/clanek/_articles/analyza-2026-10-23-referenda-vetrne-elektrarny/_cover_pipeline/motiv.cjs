// Motiv coveru: tečková mapa ČR a v každé z 21 obcí s referendem malá větrná turbína – oranžová tam, kde lidé
// výstavbu odmítli, tyrkysová v Dětřichově, který ji podpořil. Výška turbíny roste s počtem hlasujících.
// node motiv.cjs   (obce.json vyrábí ../_data_pipeline/build.py; tečky mapy z článku predikce senátu)
// Vyrobí motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg').
const fs = require('fs');
const path = require('path');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const dots = require(path.join(ZDROJ, 'senat-mapa.json')).dots;
const obce = require(path.join(__dirname, 'obce.json'));

const PROTI = '#ffcf02'; // brandYellow.6 (oranžová se tloukla se sousední kartou na homepage, Kateřina 25. 10.)
const PRO = '#33b9d9'; // brandTeal.4 (světlá varianta brandTeal.7 na tmavém pozadí)
const TECKA = '#2f325c'; // brandNavy.8
const NAVY = '#101432'; // brandNavy.9

// Stejné plochy mapy jako tools/cover-generator.cjs (FORMATY[].mapa, homepage podle mapaPozice v cover.config.cjs).
const MAPA = {
  homepage: [1500, 1200, [140, 470, 1500, 1170]], og: [1200, 630, [40, 30, 1160, 610]],
  square: [1080, 1080, [20, 470, 1070, 1050]], instagram: [1080, 1350, [20, 560, 1070, 1260]],
  story: [1080, 1920, [0, 860, 1080, 1580]],
};

const lon = dots.map((d) => d[0]), lat = dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
const kx = Math.cos((49.8 * Math.PI) / 180);
const maxHl = Math.max(...obce.map((o) => o.hlasujicich));
// Dětřichov kreslit poslední, ať ho sousední turbíny Svitavska nepřekryjí.
const poradi = [...obce].sort((a, b) => (a.vysledek === 'pro výstavbu') - (b.vysledek === 'pro výstavbu'));

for (const [klic, [W, H, [mx0, my0, mx1, my1]]] of Object.entries(MAPA)) {
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  const op = 1; // i u OG plná mapa, jinak turbíny visí ve vzduchu (Kateřina 24. 10.)
  const t = dots.map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${TECKA}" opacity="${op}"/>`; }).join('');
  const f = (v) => v.toFixed(1);
  const turbiny = poradi.map((o, i) => {
    const [x, y] = P(o.lon, o.lat);
    const c = o.vysledek === 'pro výstavbu' ? PRO : PROTI;
    const hm = sc * (0.15 + 0.11 * Math.sqrt(o.hlasujicich / maxHl)); // výška stožáru
    const L = hm * 0.6, sw = Math.max(1.8, sc * 0.012), hy = y - hm;
    const a0 = (obce.indexOf(o) * 47) % 120; // natočení listů – jen kvůli živosti, ne data
    const listy = [0, 120, 240].map((d) => {
      const a = ((a0 + d - 90) * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a);
      const tx = x + Math.cos(a) * L, ty = hy + Math.sin(a) * L, w = L * 0.17;
      const mxp = x + Math.cos(a) * L * 0.3, myp = hy + Math.sin(a) * L * 0.3;
      return `<path d="M${f(x)},${f(hy)} L${f(mxp + nx * w)},${f(myp + ny * w)} L${f(tx)},${f(ty)} L${f(mxp - nx * w * 0.35)},${f(myp - ny * w * 0.35)} Z" fill="${c}" stroke="${NAVY}" stroke-width="${f(sw * 0.45)}" stroke-linejoin="round"/>`;
    }).join('');
    return `<g opacity="1"><line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(hy)}" stroke="${NAVY}" stroke-width="${f(sw * 2.2)}" stroke-linecap="round"/><line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(hy)}" stroke="${c}" stroke-width="${f(sw)}" stroke-linecap="round"/>${listy}<circle cx="${f(x)}" cy="${f(hy)}" r="${f(sw * 1.3)}" fill="${c}" stroke="${NAVY}" stroke-width="${f(sw * 0.45)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(sw * 1.5)}" fill="${c}"/></g>`;
  }).join('');
  fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${t}${turbiny}</svg>`);
}
console.log('motiv hotový,', obce.length, 'obcí');

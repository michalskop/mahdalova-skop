// English copy of apps/web/app/clanek/_articles/volby-srbsko-2026-10-26-studenti/_cover_pipeline/motiv.cjs
// (identical drawing, only the output targets point to the English articles).
// Motiv coveru: bublinová mapa obcí Srbska (sourozenec coveru „Proč vyhrál Lula“).
// Kolečko = obec nebo městský obvod RIK v těžišti obce, plocha ∝ zapsaní voliči; barva = kdo vede podle predikce
// (Studentská listina brandDeepRed.4, Vučićova SNS brandRoyalBlue.4 – dominantní barvy uskupení převedené do palety,
// na tmavém pozadí světlejší odstíny; menšinové a ostatní listiny šedě),
// pod tím rozmazaný stín obcí. Data: obce.json (priprav_obce.py); zahraničí a věznice v mapě nejsou.
// Kosovo (Kateřina 29. 10. 2026): hlasy voličů zapsaných v kosovských obcích ukázat, ale tak, aby mapa netvrdila,
// že Kosovo je součástí Srbska: vlastní čárkovaná hranice bez stínu Srbska, kolečka poloprůhledná, popisek „Kosovo“
// se šipkou. (Volilo se ve Vranji, Rašce, Kuršumliji a Tutinu, kolečko stojí v obci zápisu.)
// node motiv.cjs → motiv-<formát>.svg sem i do _cover_pipeline anglického článku s predikcí (stejný motiv, jiný text).
const fs = require('fs');
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const FORMATY = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };
const STU = '#d85a74', SNS = '#697fe6', JINE = '#bcbcb0', STIN = '#2f325c'; // brandDeepRed.4, brandRoyalBlue.4, background.9, brandNavy.8
const HRANICE = '#bcc4df', POPIS = '#d2d8e9', NAVY = '#101432'; // brandNavy.2, brandNavy.1, brandNavy.9
const CILE = [__dirname, path.join(__dirname, '..', '..', 'elections-serbia-2026-10-25-students-beat-vucic-prediction', '_cover_pipeline')];

(async () => {
  const { geoMercator, geoPath } = await import('d3-geo');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'obce.json'), 'utf8'));
  // obrys = polygony obcí; d3 chce kruh ve směru hodinových ručiček → otočíme pořadí (GeoJSON RFC 7946 je proti)
  const fc = { type: 'FeatureCollection', features: data.obrys.map((r) => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...r].reverse()] } })) };
  const kosovo = { type: 'MultiLineString', coordinates: data.kosovo };
  const vse = { type: 'FeatureCollection', features: [...fc.features, { type: 'Feature', geometry: kosovo }] };
  const maxV = Math.max(...data.obce.map((o) => o[2]));
  const obce = [...data.obce].sort((a, b) => b[2] - a[2]);   // velká kolečka dospod, malá navrch
  for (const [klic, [W, H]] of Object.entries(FORMATY)) {
    const [x0, y0, x1, y1] = MAPA[klic];
    const proj = geoMercator().fitExtent([[x0, y0], [x1, y1]], vse);
    const pathGen = geoPath(proj);
    const scale = (y1 - y0) / 1000;
    const stin = fc.features.map((f) => `<path d="${pathGen(f)}" fill="${STIN}"/>`).join('');
    const kolecka = obce.map(([lon, lat, v, kdo, ks]) => {
      const [x, y] = proj([lon, lat]);
      const r = Math.max(2.2 * scale, Math.sqrt(v / maxV) * 62 * scale);
      const fill = kdo === 'list_03' ? STU : kdo === 'list_01' ? SNS : JINE;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${fill}" opacity="${ks ? 0.45 : 0.9}" stroke="${NAVY}" stroke-opacity="0.35" stroke-width="${(0.8 * scale).toFixed(2)}"/>`;
    }).join('');
    // Kosovo: čárkovaná hranice a popisek se zahnutou šipkou zleva (západně od Kosova je na všech formátech volno)
    const hranice = `<path d="${pathGen(kosovo)}" fill="none" stroke="${HRANICE}" stroke-width="${(2.2 * scale).toFixed(2)}" stroke-dasharray="${(7 * scale).toFixed(1)} ${(5 * scale).toFixed(1)}" stroke-opacity="0.85"/>`;
    const [[kx0, ky0], [kx1, ky1]] = pathGen.bounds(kosovo);
    const fsz = 30 * scale;
    // story a instagram: vlevo od Kosova je logo a legenda, popisek proto pod Kosovo a šipka vzhůru
    const dole = klic === 'story' || klic === 'instagram';
    // (šipka musí končit uvnitř Kosova, ne u šedých koleček Preševa a Bujanovace, které jsou v Srbsku)
    const kw = kx1 - kx0, kh = ky1 - ky0;
    const tx = dole ? kx0 + kw * 0.62 : kx0 - 70 * scale, ty = dole ? ky1 + fsz * 1.3 : (ky0 + ky1) / 2 + fsz * 0.35;
    const sx = dole ? tx - 4 * scale : tx + 6 * scale, sy = ty - fsz * 1.1;
    const ex = dole ? kx0 + kw * 0.5 : kx0 + 10 * scale, ey = dole ? ky0 + kh * 0.72 : ky0 + kh * 0.32;
    const popisek = `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${dole ? 'start' : 'end'}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${fsz.toFixed(1)}" fill="${POPIS}" stroke="${NAVY}" stroke-width="${(fsz * 0.28).toFixed(1)}" stroke-linejoin="round" paint-order="stroke">Kosovo</text>` +
      `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${(ex - 10 * scale).toFixed(1)},${(sy - 25 * scale).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${POPIS}" stroke-width="${(2.4 * scale).toFixed(2)}" stroke-linecap="round" marker-end="url(#sipka-${klic})"/>`;
    const sipka = `<marker id="sipka-${klic}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="${(5).toFixed(1)}" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${POPIS}"/></marker>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs><filter id="stin-${klic}"><feGaussianBlur stdDeviation="${(7 * scale).toFixed(1)}"/></filter>${sipka}</defs>` +
      `<g filter="url(#stin-${klic})" opacity="0.6">${stin}</g>${hranice}${kolecka}${popisek}</svg>`;
    for (const cil of CILE) fs.writeFileSync(path.join(cil, `motiv-${klic}.svg`), svg);
  }
  console.log('motiv hotový,', obce.length, 'koleček');
})();

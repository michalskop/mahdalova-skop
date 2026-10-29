// Motiv coveru: bublinová mapa obcí Srbska (sourozenec coveru „Proč vyhrál Lula“).
// Kolečko = obec nebo městský obvod RIK v těžišti obce, plocha ∝ zapsaní voliči; barva = kdo vede podle predikce
// (Studentská listina brandDeepRed.4, Vučićova SNS brandRoyalBlue.4 – dominantní barvy uskupení převedené do palety,
// na tmavém pozadí světlejší odstíny; menšinové a ostatní listiny šedě),
// pod tím rozmazaný stín obcí. Data: obce.json (priprav_obce.py). Kosovo, zahraničí a věznice v mapě nejsou.
// node motiv.cjs → motiv-<formát>.svg sem i do _cover_pipeline článku s predikcí (stejný motiv, jiný text).
const fs = require('fs');
const path = require('path');
const MAPA = require('./mapa-pozice.json');
const FORMATY = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };
const STU = '#d85a74', SNS = '#697fe6', JINE = '#bcbcb0', STIN = '#2f325c'; // brandDeepRed.4, brandRoyalBlue.4, background.9, brandNavy.8
const CILE = [__dirname, path.join(__dirname, '..', '..', 'volby-srbsko-2026-10-25-predikce', '_cover_pipeline')];

(async () => {
  const { geoMercator, geoPath } = await import('d3-geo');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'obce.json'), 'utf8'));
  // obrys = polygony obcí; d3 chce kruh ve směru hodinových ručiček → otočíme pořadí (GeoJSON RFC 7946 je proti)
  const fc = { type: 'FeatureCollection', features: data.obrys.map((r) => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...r].reverse()] } })) };
  const maxV = Math.max(...data.obce.map((o) => o[2]));
  const obce = [...data.obce].sort((a, b) => b[2] - a[2]);   // velká kolečka dospod, malá navrch
  for (const [klic, [W, H]] of Object.entries(FORMATY)) {
    const [x0, y0, x1, y1] = MAPA[klic];
    const proj = geoMercator().fitExtent([[x0, y0], [x1, y1]], fc);
    const pathGen = geoPath(proj);
    const scale = (y1 - y0) / 1000;
    const stin = fc.features.map((f) => `<path d="${pathGen(f)}" fill="${STIN}"/>`).join('');
    const kolecka = obce.map(([lon, lat, v, kdo]) => {
      const [x, y] = proj([lon, lat]);
      const r = Math.max(2.2 * scale, Math.sqrt(v / maxV) * 62 * scale);
      const fill = kdo === 'list_03' ? STU : kdo === 'list_01' ? SNS : JINE;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${fill}" opacity="0.9" stroke="#101432" stroke-opacity="0.35" stroke-width="${(0.8 * scale).toFixed(2)}"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs><filter id="stin-${klic}"><feGaussianBlur stdDeviation="${(7 * scale).toFixed(1)}"/></filter></defs>` +
      `<g filter="url(#stin-${klic})" opacity="0.6">${stin}</g>${kolecka}</svg>`;
    for (const cil of CILE) fs.writeFileSync(path.join(cil, `motiv-${klic}.svg`), svg);
  }
  console.log('motiv hotový,', obce.length, 'koleček');
})();

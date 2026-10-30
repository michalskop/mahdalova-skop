// Motiv coveru: bublinová mapa obcí Brazílie (sourozenec coveru „Nepoměr na radnicích“).
// Každá obec = kolečko v těžišti obce, plocha ∝ počet voličů ve 2. kole; barva = vítěz obce
// (Lula červená PT, Flávio Bolsonaro modrá PL), pod tím rozmazaný stín státu.
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg'); pozice = MAPA (shodně s mapaPozice v configu)
const fs = require('fs');
const path = require('path');
const ART = path.join(__dirname, '..');
const MAPA = require('./mapa-pozice.json');
const FORMATY = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };
// barvy stran (Kateřina 30. 10., dřív vlajka): PT brandCoralRed.5, PL brandRoyalBlue.4 (o stupeň světlejší
// než v grafech, na tmavém pozadí), stín státu šedomodrý brandNavy.6, aby nesplýval s modrými kolečky
const LULA = '#ff3f30', FLAVIO = '#697fe6', STIN = '#6267a3';

(async () => {
  const { geoMercator, geoPath, geoCentroid } = await import('d3-geo');
  const { feature } = await import('topojson-client');
  const topo = JSON.parse(fs.readFileSync(path.join(ART, 'brazil-obce-geo.json'), 'utf8'));
  const data = JSON.parse(fs.readFileSync(path.join(ART, 'brazil-obce-data.json'), 'utf8'));
  const fc = feature(topo, topo.objects.mun);
  const ufs = feature(topo, topo.objects.uf);
  const maxV = Math.max(...Object.values(data).map((r) => r[2]));
  const obce = fc.features
    .map((f) => ({ c: geoCentroid(f), r: data[f.properties.id] }))
    .filter((o) => o.r)
    .sort((a, b) => a.r[2] - b.r[2]);
  for (const [klic, [W, H]] of Object.entries(FORMATY)) {
    const [x0, y0, x1, y1] = MAPA[klic];
    const proj = geoMercator().fitExtent([[x0, y0], [x1, y1]], ufs);
    const pathGen = geoPath(proj);
    const scale = (x1 - x0) / 1000;
    const stin = ufs.features.map((f) => `<path d="${pathGen(f)}" fill="${STIN}"/>`).join('');
    const kolecka = obce.map((o) => {
      const [x, y] = proj(o.c);
      const rr = Math.max(0.9 * scale, Math.sqrt(o.r[2] / maxV) * 46 * scale);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(2)}" fill="${o.r[3] > 50 ? LULA : FLAVIO}" opacity="0.88"/>`;
    }).join('');
    fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs><filter id="stin-${klic}"><feGaussianBlur stdDeviation="${(6 * scale).toFixed(1)}"/></filter></defs>` +
      `<g filter="url(#stin-${klic})" opacity="0.55">${stin}</g>${kolecka}</svg>`);
  }
  console.log('motiv hotový,', obce.length, 'obcí');
})();

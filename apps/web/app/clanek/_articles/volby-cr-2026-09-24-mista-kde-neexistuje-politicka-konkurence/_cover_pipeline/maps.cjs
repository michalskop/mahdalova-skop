// Usage: node maps.cjs <repoWorktree> <outDir>
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const [repo, out] = process.argv.slice(2);
const req = createRequire(path.join(repo, 'apps/web/package.json'));
const topojson = req('topojson-client');
let d3;
const { chromium } = req('playwright');

(async () => {
d3 = await import(require('node:url').pathToFileURL(req.resolve('d3-geo')).href);
const art = path.join(repo, 'apps/web/app/clanek/_articles/volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence');
const topo = JSON.parse(fs.readFileSync(path.join(art, 'obce-geo.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(art, 'obce-data.json'), 'utf8'));
const objName = Object.keys(topo.objects);
console.log('objects', objName.map(k => k + ':' + topo.objects[k].geometries.length));
const obceKey = objName.find(k => topo.objects[k].geometries.length > 6000);
const obce = topojson.feature(topo, topo.objects[obceKey]);
const krajeKey = objName.find(k => /kraj/i.test(k));
const kraje = krajeKey ? topojson.mesh(topo, topo.objects[krajeKey], (a, b) => a !== b) : null;
const outline = topojson.mesh(topo, topo.objects[obceKey], (a, b) => a === b);

const rec = id => {
  const o = raw.obce[id]; if (!o) return null;
  const m = o.y.split(';').map(s => s.split(':')).find(([y]) => y === '2026');
  return { p: o.p, r: m ? m[1].split(',').map(Number) : null };
};
const idOf = f => String(f.id ?? f.properties?.id ?? f.properties?.kod);
let s = { c: {}, small: 0, n: 0 };
obce.features.forEach(f => { const x = rec(idOf(f)); if (!x) return; s.n++; if (x.r) s.c[x.r[0]] = (s.c[x.r[0]] || 0) + 1; if (x.p < 500) s.small++; });
console.log('stats', JSON.stringify(s));

const W = 2400, H = 1600, BG = '#101432';
function svg(fillFn, strokeCol, strokeW) {
  const proj = d3.geoIdentity().reflectY(true).fitExtent([[120, 260], [W - 120, H - 260]], obce);
  const p = d3.geoPath(proj);
  const paths = obce.features.map(f => `<path d="${p(f)}" fill="${fillFn(rec(idOf(f)))}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${BG}"/>
<g stroke="${strokeCol}" stroke-width="${strokeW}" stroke-linejoin="round">${paths}</g>
${kraje ? `<path d="${p(kraje)}" fill="none" stroke="${BG}" stroke-width="3.2"/>` : ''}
<path d="${p(outline)}" fill="none" stroke="#9aa0d0" stroke-width="2.4"/>
</svg>`;
}
// mapa 1: jediná kandidátka 2026
const COL = { 0: '#2a2f66', 1: '#9b5bb3', 2: '#d6a8ec', 3: '#ff934d', 4: '#de1743' };
const svgKand = svg(x => (x && x.r ? COL[x.r[0]] : '#1b1f48'), BG, 0.6);
// mapa 2: síť obcí, pod 500 obyvatel zvýrazněné
const svgObce = svg(x => (x && x.p < 500 ? '#de1743' : '#2a2f66'), '#101432', 0.9);

{
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ headless: true, channel: 'msedge' });
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  for (const [name, s] of [['map-kandidatky', svgKand], ['map-obce', svgObce]]) {
    await pg.setContent(`<html><body style="margin:0;background:${BG}">${s}</body></html>`);
    await pg.screenshot({ path: path.join(out, name + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
}
})();

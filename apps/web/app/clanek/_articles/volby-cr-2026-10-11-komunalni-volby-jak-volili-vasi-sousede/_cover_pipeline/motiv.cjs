// Motiv coveru „Jak volili vaši sousedé“: celá ČR po okrscích tlumeně (brandNavy) a lupa nad Prahou (pestrá mozaika vítězů),
// kde jsou okrsky v barvách vítězných kandidátek (skutečná data článku, public/data/kv2026-okrsky).
// Vzor: cover sněmovních voleb 2025 (lupa nad Plzní), tentokrát podle tools/COVER-EDITOR.md.
// node motiv.cjs [obec] [výstupní složka]  → motiv-<formát>.svg pro všech pět formátů (vkládá je tools/cover-generator.cjs,
// motiv.typ 'svg'); výchozí obec Praha, jiné obce pro karty na sítě (socialni-site.cjs)
const fs = require('fs');
const path = require('path');
const { feature } = require('topojson-client');

const DATA = path.join(__dirname, '..', '..', '..', '..', '..', 'public', 'data', 'kv2026-okrsky');
const MESTO = process.argv[2] || 'Praha';
const OUT = process.argv[3] || __dirname;
const JEN = process.argv[4] ? process.argv[4].split(',') : null; // jen vybrané formáty (karty na sítě)

// paleta (packages/ui/DESIGN.md)
const BASE = '#2f325c';   // brandNavy.8 – okrsky ČR
const BASE_LINE = '#101432'; // brandNavy.9 – hranice okrsků (barva pozadí)
const PAPER = '#f8f6f0';  // background.2 – podklad v lupě
const CONTEXT = '#e9e9dd'; // background.5 – okolní obce v lupě
const RING = '#b8eff6';   // brandTeal.1 – obruba lupy
const GRIP = '#8cdfef';   // brandTeal.2 – rukojeť

// cx, cy, r = střed a poloměr lupy; scale = měřítko základní mapy (Mercator), lupa se vždy kreslí nad skutečnou polohou města
const FORMATY = {
  homepage: { w: 1500, h: 1200, cx: 1000, cy: 780, r: 310, scale: 15000, uhel: 135 },
  og: { w: 1200, h: 630, cx: 1000, cy: 335, r: 180, scale: 9000, uhel: 135 },
  square: { w: 1080, h: 1080, cx: 690, cy: 710, r: 285, scale: 12500, uhel: 135 },
  instagram: { w: 1080, h: 1350, cx: 680, cy: 870, r: 310, scale: 13500, uhel: 135 },
  story: { w: 1080, h: 1920, cx: 600, cy: 1140, r: 380, scale: 16000, uhel: 135 },
};

(async () => {
  const { geoMercator, geoPath, geoBounds } = await import('d3-geo');
  const topo = JSON.parse(fs.readFileSync(path.join(DATA, 'okrsky.json'), 'utf8'));
  const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'obce.json'), 'utf8'));
  const usti = idx.obce.find((o) => o[1] === MESTO);
  const okresKod = String(usti[2]);
  const meta = JSON.parse(fs.readFileSync(path.join(DATA, 'meta', `${okresKod}.json`), 'utf8'));
  const kody = new Set(usti[4].length ? usti[4].map((m) => String(m[0])) : [String(usti[0])]);

  const vse = Object.keys(topo.objects).flatMap((k) => feature(topo, topo.objects[k]).features);
  const okres = feature(topo, topo.objects[okresKod]).features;
  const mesto = okres.filter((f) => kody.has(f.properties.id.split('-')[0]));
  const fcMesto = { type: 'FeatureCollection', features: mesto };
  const [[lo0, la0], [lo1, la1]] = geoBounds(fcMesto);
  const stred = [(lo0 + lo1) / 2, (la0 + la1) / 2];
  const zast = meta.zast[String(usti[0])];
  const barva = (id) => {
    const r = meta.okrsky[id]?.['1'];
    return r && r[4].length ? zast.l[r[4][0][0]].c : CONTEXT;
  };

  for (const [klic, f] of Object.entries(FORMATY).filter(([k]) => !JEN || JEN.includes(k))) {
    // základní mapa: Ústí přesně pod středem lupy
    const p = geoMercator().scale(f.scale).center(stred).translate([f.cx, f.cy]).clipExtent([[-20, -20], [f.w + 20, f.h + 20]]);
    const gp = geoPath(p);
    const zaklad = vse.map((x) => gp(x)).filter(Boolean).map((d) => `<path d="${d}"/>`).join('');
    // lupa: okres Ústí n. L. zvětšený tak, aby město vyplnilo kruh
    // město zabere lupu na šířku i výšku (okraje města smí lupa uříznout), okolní okrsky dokreslí podklad
    const s = f.r * 1.08;
    const pl = geoMercator().center(stred).translate([f.cx, f.cy]).fitExtent([[f.cx - s, f.cy - s * 0.92], [f.cx + s, f.cy + s * 0.92]], fcMesto)
      .clipExtent([[f.cx - f.r - 4, f.cy - f.r - 4], [f.cx + f.r + 4, f.cy + f.r + 4]]);
    const gl = geoPath(pl);
    const okoli = vse.filter((x) => !kody.has(x.properties.id.split('-')[0])).map((x) => gl(x)).filter(Boolean).map((d) => `<path d="${d}"/>`).join('');
    const vMeste = mesto.map((x) => `<path d="${gl(x)}" fill="${barva(x.properties.id)}"/>`).join('');
    // rukojeť pod úhlem (ve stupních, 135 = vpravo dolů); začíná na obrubě
    const a = (f.uhel * Math.PI) / 180 - Math.PI / 2;
    const ring = Math.max(8, f.r * 0.055);
    const L = f.r * 0.95, W = f.r * 0.2;
    const hx = f.cx + Math.cos(a) * (f.r + ring / 2), hy = f.cy + Math.sin(a) * (f.r + ring / 2);
    const rot = (Math.atan2(Math.sin(a), Math.cos(a)) * 180) / Math.PI;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}" viewBox="0 0 ${f.w} ${f.h}" style="position:absolute;left:0;top:0">
<defs><clipPath id="lupa-${klic}"><circle cx="${f.cx}" cy="${f.cy}" r="${f.r}"/></clipPath></defs>
<g fill="${BASE}" stroke="${BASE_LINE}" stroke-width="0.6" stroke-linejoin="round">${zaklad}</g>
<g transform="translate(${hx.toFixed(1)},${hy.toFixed(1)}) rotate(${rot.toFixed(1)})">
  <rect x="0" y="${(-W * 0.38).toFixed(1)}" width="${(L * 0.22).toFixed(1)}" height="${(W * 0.76).toFixed(1)}" fill="${RING}"/>
  <rect x="${(L * 0.2).toFixed(1)}" y="${(-W / 2).toFixed(1)}" width="${(L * 0.8).toFixed(1)}" height="${W.toFixed(1)}" rx="${(W / 2).toFixed(1)}" fill="${GRIP}"/>
</g>
<circle cx="${f.cx}" cy="${f.cy}" r="${f.r + ring * 1.6}" fill="#101432" opacity="0.55"/>
<g clip-path="url(#lupa-${klic})">
  <rect x="${f.cx - f.r}" y="${f.cy - f.r}" width="${2 * f.r}" height="${2 * f.r}" fill="${PAPER}"/>
  <g fill="${CONTEXT}" stroke="#ffffff" stroke-width="${(f.r / 300).toFixed(2)}" stroke-linejoin="round">${okoli}</g>
  <g stroke="#ffffff" stroke-width="${(f.r / 220).toFixed(2)}" stroke-linejoin="round">${vMeste}</g>
</g>
<circle cx="${f.cx}" cy="${f.cy}" r="${f.r + ring / 2}" fill="none" stroke="${RING}" stroke-width="${ring.toFixed(1)}"/>
</svg>`;
    fs.mkdirSync(OUT, { recursive: true });
    const out = path.join(OUT, `motiv-${klic}.svg`);
    fs.writeFileSync(out, svg);
    console.log(klic, `${Math.round(svg.length / 1024)} kB`);
  }
})();

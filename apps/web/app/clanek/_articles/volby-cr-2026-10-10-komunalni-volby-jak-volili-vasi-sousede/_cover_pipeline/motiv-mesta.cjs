// Motiv coveru „Jak volili vaši sousedé“ – celá ČR po okrscích tlumeně (brandNavy) a nad ní okénka (lupy) nad
// skutečnou polohou měst: Praha velká lupa s rukojetí, ostatní krajská města menší kruhy s názvem. V každém okénku
// okrsky města v barvách vítězných kandidátek (data článku, public/data/kv2026-okrsky). Ukazuje, že mapa je pro celou zemi.
// node motiv-mesta.cjs  → motiv-mesta-<formát>.svg (vkládá je tools/cover-generator.cjs, motiv.typ 'svg')
const fs = require('fs');
const path = require('path');
const { feature } = require('topojson-client');

const DATA = path.join(__dirname, '..', '..', '..', '..', '..', 'public', 'data', 'kv2026-okrsky');

// paleta (packages/ui/DESIGN.md)
const BASE = '#2f325c';      // brandNavy.8 – okrsky ČR
const BASE_LINE = '#101432'; // brandNavy.9 – hranice okrsků (barva pozadí)
const PAPER = '#f8f6f0';     // background.2 – podklad v okénku
const CONTEXT = '#e9e9dd';   // background.5 – okolní obce v okénku
const RING = '#b8eff6';      // brandTeal.1 – obruba
const GRIP = '#8cdfef';      // brandTeal.2 – rukojeť

// mapa = obdélník, do kterého se vejde celá ČR; r = poloměr okének (Praha × 1.45); mesta = která města v daném formátu
const VSE = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Ústí nad Labem', 'České Budějovice', 'Jihlava', 'Hradec Králové', 'Jeseník', 'Liberec'];
// posun = { město: [x, y] } – kde stojí okénko (absolutně v pixelech formátu), když by se na skutečné poloze překrývalo;
// s městem ho spojí tenká čára z bodu skutečné polohy. nad = názvy, které jdou nad okénko (u spodního okraje).
const FORMATY = {
  homepage: { w: 1500, h: 1200, mapa: [40, 500, 1490, 1190], r: 74, mesta: VSE, popisek: 23,
    posun: { 'Ústí nad Labem': [470, 600], Praha: [640, 790], Plzeň: [355, 860], 'České Budějovice': [640, 1080], Jihlava: [845, 960], Brno: [1050, 1050], Ostrava: [1250, 840], 'Hradec Králové': [880, 690], Jeseník: [1110, 640], Liberec: [690, 585] },
    nad: ['České Budějovice', 'Brno', 'Liberec'] },
  og: { w: 1200, h: 630, mapa: [-110, 30, 1330, 600], r: 60, mesta: ['Brno', 'Ostrava', 'Plzeň', 'Ústí nad Labem', 'České Budějovice'], popisek: 16,
    posun: { 'Ústí nad Labem': [300, 110], Plzeň: [230, 330], 'České Budějovice': [380, 520], Brno: [830, 470], Ostrava: [1050, 300] }, nad: [] },
  square: { w: 1080, h: 1080, mapa: [10, 470, 1070, 1060], r: 60, mesta: VSE, popisek: 19,
    posun: { 'Ústí nad Labem': [300, 560], Praha: [440, 720], Plzeň: [175, 770], 'České Budějovice': [505, 935], Jihlava: [640, 860], Brno: [810, 930], Ostrava: [960, 740], 'Hradec Králové': [640, 640], Jeseník: [835, 610], Liberec: [480, 545] },
    nad: ['České Budějovice', 'Brno', 'Liberec'] },
  instagram: { w: 1080, h: 1350, mapa: [10, 600, 1070, 1260], r: 62, mesta: VSE, popisek: 20,
    posun: { 'Ústí nad Labem': [300, 690], Praha: [440, 860], Plzeň: [175, 920], 'České Budějovice': [440, 1110], Jihlava: [640, 1010], Brno: [810, 1090], Ostrava: [960, 880], 'Hradec Králové': [640, 780], Jeseník: [835, 745], Liberec: [480, 685] },
    nad: ['České Budějovice', 'Brno', 'Liberec'] },
  story: { w: 1080, h: 1920, mapa: [10, 860, 1070, 1580], r: 66, mesta: VSE, popisek: 21,
    posun: { 'Ústí nad Labem': [300, 950], Praha: [440, 1140], Plzeň: [170, 1210], 'České Budějovice': [440, 1410], Jihlava: [650, 1300], Brno: [820, 1390], Ostrava: [960, 1160], 'Hradec Králové': [650, 1060], Jeseník: [845, 1010], Liberec: [490, 955] },
    nad: ['Liberec'] },
};

(async () => {
  const { geoMercator, geoPath, geoBounds } = await import('d3-geo');
  const topo = JSON.parse(fs.readFileSync(path.join(DATA, 'okrsky.json'), 'utf8'));
  const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'obce.json'), 'utf8'));
  const vse = Object.keys(topo.objects).flatMap((k) => feature(topo, topo.objects[k]).features);
  const fcVse = { type: 'FeatureCollection', features: vse };
  const meze = new Map(vse.map((f) => [f, geoBounds(f)]));

  // města: okrsky, střed, barvy vítězů
  const mesto = {};
  for (const n of VSE) {
    const row = idx.obce.find((o) => o[1] === n);
    const meta = JSON.parse(fs.readFileSync(path.join(DATA, 'meta', `${row[2]}.json`), 'utf8'));
    const kody = new Set(row[4].length ? row[4].map((m) => String(m[0])) : [String(row[0])]);
    const okr = vse.filter((f) => kody.has(f.properties.id.split('-')[0]));
    const fc = { type: 'FeatureCollection', features: okr };
    const [[a, b], [c, d]] = geoBounds(fc);
    const zast = meta.zast[String(row[0])];
    const barva = (id) => { const r = meta.okrsky[id]?.['1']; return r && r[4].length ? zast.l[r[4][0][0]].c : CONTEXT; };
    mesto[n] = { okr, fc, stred: [(a + c) / 2, (b + d) / 2], bbox: [a, b, c, d], barva, kody };
  }

  for (const [klic, f] of Object.entries(FORMATY)) {
    const [mx0, my0, mx1, my1] = f.mapa;
    const p = geoMercator().fitExtent([[mx0, my0], [mx1, my1]], fcVse).clipExtent([[-20, -20], [f.w + 20, f.h + 20]]);
    const gp = geoPath(p);
    const zaklad = vse.map((x) => gp(x)).filter(Boolean).map((d) => `<path d="${d}"/>`).join('');
    let okenka = '', vodice = '';
    // Praha poslední, ať je navrch; menší okénka nejdřív
    const poradi = [...f.mesta.filter((n) => n !== 'Praha'), ...(f.mesta.includes('Praha') ? ['Praha'] : [])];
    for (const n of poradi) {
      const m = mesto[n];
      const praha = n === 'Praha';
      const r = f.r * (praha ? 1.45 : 1);
      const [tx, ty] = p(m.stred); // skutečná poloha
      const [cx, cy] = f.posun?.[n] ?? [tx, ty];
      const s = r * 1.05;
      const pl = geoMercator().fitExtent([[cx - s, cy - s], [cx + s, cy + s]], m.fc).clipExtent([[cx - r - 4, cy - r - 4], [cx + r + 4, cy + r + 4]]);
      const gl = geoPath(pl);
      // okolí jen z okrsků, které leží blízko města (rychlejší než celá ČR)
      const [a, b, c, d] = m.bbox, pad = Math.max(c - a, d - b);
      const blizko = vse.filter((x) => { const [[e, g], [h, i]] = meze.get(x); return h > a - pad && e < c + pad && i > b - pad && g < d + pad; });
      const okoli = blizko.filter((x) => !m.kody.has(x.properties.id.split('-')[0])).map((x) => gl(x)).filter(Boolean).map((d) => `<path d="${d}"/>`).join('');
      const vMeste = m.okr.map((x) => `<path d="${gl(x)}" fill="${m.barva(x.properties.id)}"/>`).join('');
      const ring = Math.max(5, r * 0.07);
      const id = `ok-${klic}-${n.replace(/\W/g, '')}`;
      let rukojet = '';
      if (praha) {
        const a = (135 * Math.PI) / 180 - Math.PI / 2, L = r * 0.9, W = r * 0.2;
        const hx = cx + Math.cos(a) * (r + ring / 2), hy = cy + Math.sin(a) * (r + ring / 2), rot = (a * 180) / Math.PI;
        rukojet = `<g transform="translate(${hx.toFixed(1)},${hy.toFixed(1)}) rotate(${rot.toFixed(1)})"><rect x="0" y="${(-W * 0.38).toFixed(1)}" width="${(L * 0.22).toFixed(1)}" height="${(W * 0.76).toFixed(1)}" fill="${RING}"/><rect x="${(L * 0.2).toFixed(1)}" y="${(-W / 2).toFixed(1)}" width="${(L * 0.8).toFixed(1)}" height="${W.toFixed(1)}" rx="${(W / 2).toFixed(1)}" fill="${GRIP}"/></g>`;
      }
      // popisek pod okénkem (IBM Plex Sans ze stránky generátoru), s tmavým obrysem pro čitelnost
      const fy = f.nad?.includes(n) ? cy - r - ring - f.popisek * 0.45 : cy + r + ring + f.popisek * 1.05;
      const odsun = Math.hypot(cx - tx, cy - ty) > r * 0.5;
      const vodic = odsun ? `<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${RING}" stroke-width="2" opacity="0.8"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4" fill="${RING}"/>` : '';
      const popisek = `<text x="${cx.toFixed(1)}" y="${fy.toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f.popisek}" fill="#f8f6f0" stroke="${BASE_LINE}" stroke-width="${(f.popisek * 0.28).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${n}</text>`;
      vodice += vodic;
      okenka += `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
${rukojet}<circle cx="${cx}" cy="${cy}" r="${r + ring * 1.7}" fill="${BASE_LINE}" opacity="0.6"/>
<g clip-path="url(#${id})"><rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${PAPER}"/>
<g fill="${CONTEXT}" stroke="#ffffff" stroke-width="0.6" stroke-linejoin="round">${okoli}</g>
<g stroke="#ffffff" stroke-width="${(r / 260).toFixed(2)}" stroke-linejoin="round">${vMeste}</g></g>
<circle cx="${cx}" cy="${cy}" r="${r + ring / 2}" fill="none" stroke="${RING}" stroke-width="${ring.toFixed(1)}"/>${popisek}`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}" viewBox="0 0 ${f.w} ${f.h}" style="position:absolute;left:0;top:0">
<g fill="${BASE}" stroke="${BASE_LINE}" stroke-width="0.5" stroke-linejoin="round">${zaklad}</g>
${vodice}
${okenka}
</svg>`;
    fs.writeFileSync(path.join(__dirname, `motiv-mesta-${klic}.svg`), svg);
    console.log(klic, `${Math.round(svg.length / 1024)} kB`);
  }
})();

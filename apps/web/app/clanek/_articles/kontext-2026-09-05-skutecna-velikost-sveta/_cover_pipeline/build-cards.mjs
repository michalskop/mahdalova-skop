// Regenerates ../social/social.json for this article.
//
// This article has no data chart, so the shared social-cards pipeline
// (tools/social-cards/) has nothing to drop into its chartSvg slot. Instead
// we reuse the article's own hand-drawn cover motif — the two Greenland
// silhouettes in ./main.svg — as the illustration.
//
// The map-size silhouette and the true-size silhouette are the SAME path,
// the true-size one scaled by 1/sqrt(14) so its AREA is exactly 1/14 of the
// other (Greenland vs. its Mercator inflation near 72° N).
//
//   Wide motif  -> og, bluesky-landscape   (label column beside the shapes)
//   Stacked motif -> x-square, ig-portrait (legend below the shapes)
//
// After editing, run from the repo root:
//   node apps/web/app/clanek/_articles/kontext-2026-09-05-skutecna-velikost-sveta/_cover_pipeline/build-cards.mjs
//   node tools/social-cards/generate.mjs kontext-2026-09-05-skutecna-velikost-sveta
//   cp apps/web/app/clanek/_articles/kontext-2026-09-05-skutecna-velikost-sveta/social/og/main.png \
//      apps/web/app/clanek/_articles/kontext-2026-09-05-skutecna-velikost-sveta/images/main.png
// (images/main.png is the article coverImage / og:image; social/ is upload-only.)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const svg = fs.readFileSync(path.join(HERE, 'main.svg'), 'utf8');
const d = [...svg.matchAll(/<path d="([^"]+)"/g)][0][1]; // first path = detailed Greenland outline

const nums = d.replace(/[MLZ]/g, ' ').trim().split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n));
const pts = [];
for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
const minX = Math.min(...pts.map(p => p[0]));
const maxX = Math.max(...pts.map(p => p[0]));
const minY = Math.min(...pts.map(p => p[1]));
const maxY = Math.max(...pts.map(p => p[1]));
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const gh = maxY - minY;
const gw = maxX - minX;

const ratio = 1 / Math.sqrt(14); // linear ratio -> true size = 1/14 of the area
const r = n => Math.round(n * 1000) / 1000;

const MAP_STYLE =
  'fill="#de1743" fill-opacity="0.13" stroke="#de1743" stroke-opacity="0.5" ' +
  'stroke-width="2" stroke-dasharray="7 5" vector-effect="non-scaling-stroke"';
const TRUE_STYLE =
  'fill="#de1743" fill-opacity="0.95" stroke="#a81134" stroke-width="2" vector-effect="non-scaling-stroke"';
const FONT = "font-family=\"'Roboto Condensed', Arial, sans-serif\"";

function wide() {
  const W = 960, H = 210;
  const bs = 196 / gh;
  const btx = 36 - minX * bs;
  const bty = (H - gh * bs) / 2 - minY * bs;
  const ss = bs * ratio;
  const stx = btx + cx * bs - 5 - cx * ss;
  const sty = bty + cy * bs + 22 - cy * ss;
  const bigRight = maxX * bs + btx;
  const smallRight = maxX * ss + stx;
  const cyMap = bty + cy * bs + 22;
  const LX = 360;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ${FONT}>` +
    `<path transform="translate(${r(btx)} ${r(bty)}) scale(${r(bs)})" d="${d}" ${MAP_STYLE}/>` +
    `<path transform="translate(${r(stx)} ${r(sty)}) scale(${r(ss)})" d="${d}" ${TRUE_STYLE}/>` +
    `<line x1="${r(bigRight - 8)}" y1="46" x2="${LX - 12}" y2="46" stroke="#c2bcae" stroke-width="2"/>` +
    `<text x="${LX}" y="40" font-size="26" fill="#55524a">jak velké Grónsko vypadá</text>` +
    `<text x="${LX}" y="74" font-size="26" fill="#55524a" font-weight="700">na Mercatorově mapě</text>` +
    `<line x1="${r(smallRight + 4)}" y1="${r(cyMap)}" x2="${LX - 12}" y2="${r(cyMap)}" stroke="#c2bcae" stroke-width="2"/>` +
    `<text x="${LX}" y="${r(cyMap - 7)}" font-size="26" fill="#55524a">jeho <tspan font-weight="700" fill="#de1743">skutečná velikost</tspan></text>` +
    `<text x="${LX}" y="${r(cyMap + 27)}" font-size="26" fill="#55524a" font-weight="700">= 14× menší plocha</text>` +
  `</svg>`;
}

function stack() {
  const W = 680, H = 520;
  const bs = 300 / gh;
  const btx = (W - gw * bs) / 2 - minX * bs;
  const bty = 20 - minY * bs;
  const ss = bs * ratio;
  const stx = btx + cx * bs - 6 - cx * ss;
  const sty = bty + cy * bs + 34 - cy * ss;
  const y1 = 390, y2 = 452;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ${FONT}>` +
    `<path transform="translate(${r(btx)} ${r(bty)}) scale(${r(bs)})" d="${d}" ${MAP_STYLE}/>` +
    `<path transform="translate(${r(stx)} ${r(sty)}) scale(${r(ss)})" d="${d}" ${TRUE_STYLE}/>` +
    `<circle cx="70" cy="${y1 - 8}" r="9" fill="#de1743" fill-opacity="0.13" stroke="#de1743" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 3"/>` +
    `<text x="90" y="${y1}" font-size="27" fill="#55524a">jak velké Grónsko <tspan font-weight="700">vypadá na Mercatorově mapě</tspan></text>` +
    `<rect x="61" y="${y2 - 17}" width="18" height="18" fill="#de1743" fill-opacity="0.95" stroke="#a81134" stroke-width="2"/>` +
    `<text x="90" y="${y2}" font-size="27" fill="#55524a">jeho <tspan font-weight="700" fill="#de1743">skutečná velikost</tspan> — <tspan font-weight="700">14× menší</tspan></text>` +
  `</svg>`;
}

// Main message = the article's own hook (as on the original hand-drawn cover).
// The 14× fact is the supporting caption underneath.
const headline =
  'Skutečná velikost' +
  '<br><span style="font-weight:400;font-size:0.4em;line-height:1.3;color:#55524a">' +
  'Poznáte zemi podle tvaru – a&nbsp;jak moc vás klame mapa?</span>';
const caption =
  'Grónsko je <b>14× menší</b>, než ukazuje mapa. Mercatorova projekce nafukuje ' +
  'plochy u&nbsp;pólů. „Obří" ostrov se scvrkne na velikost Alžírska.';

const config = {
  site: 'DataTimes.cz',
  eyebrow: 'Kontext',
  // no footer — the smallest microtext is left off this card by design;
  // branding is carried by the DataTimes.cz wordmark in the header
  cards: [
    { id: 'main', headline, caption, chartSvg: wide(), formats: ['og', 'bluesky-landscape'] },
    { id: 'main-portrait', headline, caption, chartSvg: stack(), formats: ['x-square', 'ig-portrait'] },
  ],
};

const out = path.join(HERE, '..', 'social', 'social.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log('wrote', path.relative(process.cwd(), out), `(${fs.statSync(out).size} B)`);

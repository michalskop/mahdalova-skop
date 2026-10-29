// Fotografická vrstva coveru pro tools/cover-generator.cjs (motiv.typ 'svg').
// Původní fotka článku se jen přesadí do formátu: výřez zdroje [sx, sy, šířka] se roztáhne do cílové
// oblasti [x, y, w, h] (výška výřezu = šířka × h / w), pod text jdou navy přechody (čitelnost).
// Volitelně druhá fotka (split před/po): src2 se kreslí přes pravou část od svislé čáry `split` (px formátu).
const fs = require('fs');
const path = require('path');

const NAVY = '#101432'; // brandNavy.9
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const uri = (p) => `data:${MIME[path.extname(p).toLowerCase()]};base64,${fs.readFileSync(p).toString('base64')}`;

// prechod: { smer: 'v' (shora dolů) | 'h' (zleva doprava), body: [[offset 0–1, krytí 0–1], …] }
function prechod(id, { smer, body }) {
  const [x2, y2] = smer === 'h' ? [1, 0] : [0, 1];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${body.map(([o, a]) => `<stop offset="${o}" stop-color="${NAVY}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
}

module.exports = function vrstva({ W, H, src, rozmer: [SW, SH], vyrez: [sx, sy, sw], oblast = [0, 0, W, H], prechody = [], src2, split, jas = 1, extra = '' }) {
  const [ox, oy, ow, oh] = oblast;
  const k = ow / sw;
  const img = (s) => `<image href="${uri(s)}" x="${(ox - sx * k).toFixed(1)}" y="${(oy - sy * k).toFixed(1)}" width="${(SW * k).toFixed(1)}" height="${(SH * k).toFixed(1)}" preserveAspectRatio="none"${jas !== 1 ? ' filter="url(#jas)"' : ''}/>`;
  const defs = prechody.map((p, i) => prechod(`p${i}`, p)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <clipPath id="obl"><rect x="${ox}" y="${oy}" width="${ow}" height="${oh}"/></clipPath>
    ${split != null ? `<clipPath id="vpravo"><rect x="${split}" y="${oy}" width="${ox + ow - split}" height="${oh}"/></clipPath>` : ''}
    <filter id="jas"><feComponentTransfer><feFuncR type="linear" slope="${jas}"/><feFuncG type="linear" slope="${jas}"/><feFuncB type="linear" slope="${jas}"/></feComponentTransfer></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <g clip-path="url(#obl)">${img(src)}${src2 ? `<g clip-path="url(#vpravo)">${img(src2)}</g><rect x="${split - 2}" y="${oy}" width="4" height="${oh}" fill="#f8f6f0" opacity=".85"/>` : ''}</g>
  ${prechody.map((_, i) => `<rect width="${W}" height="${H}" fill="url(#p${i})"/>`).join('')}
  ${extra}
</svg>`;
};

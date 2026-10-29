// Sada coverů (JPEG): PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs
// Podkres (Kateřina 27. 10. 2026, varianta A): satelitní snímek tábora Džabálijá na severu Pásma Gazy z prosince 2024
// přes CELÝ formát, navrch závoj v ink blue, aby vynikl text; text smí do fotky zasahovat (COVER-EDITOR.md, bod 9).
// Zdroj: podklad-gaza-dzabalija-2024.webp = images/gaza-09-dzabalija-po.webp z článku
// analyza-2026-09-29-mapy-ukazuji-jak-se-promenila-gaza (912 × 1029, Google Earth). Jediný popisek snímku, datum
// v pravém horním rohu (y < 105), je odříznutý výřezem (OREZ). Varianta s Rimálem (centrum Gazy) neprošla:
// pět zapečených popisků prosvítalo i po rozmazání.
const fs = require('fs');
const path = require('path');

const NAVY = '#101432'; // brandNavy.9
const SW = 912, SH = 1029, OREZ = 110;
const URI = `data:image/webp;base64,${fs.readFileSync(path.join(__dirname, 'podklad-gaza-dzabalija-2024.webp')).toString('base64')}`;
// [ohnisko x, y ve zdroji] = co má zůstat vidět; závoj: [krytí celé plochy, přechod pod text 'h' zleva / 'v' shora]
const L = {
  homepage: { W: 1500, H: 1200, f: [456, 470], zavoj: 0.3, smer: 'h' },
  og: { W: 1200, H: 630, f: [456, 470], zavoj: 0.3, smer: 'h' },
  square: { W: 1080, H: 1080, f: [456, 500], zavoj: 0.3, smer: 'h' },
  instagram: { W: 1080, H: 1350, f: [456, 515], zavoj: 0.28, smer: 'v' },
  story: { W: 1080, H: 1920, f: [456, 515], zavoj: 0.28, smer: 'v' },
};

function svg(k) {
  const { W, H, f: [fx, fy], zavoj, smer } = L[k];
  const s = Math.max(W / SW, H / (SH - OREZ));
  const x = Math.min(0, Math.max(W - SW * s, W / 2 - fx * s));
  const y = Math.min(-OREZ * s, Math.max(H - SH * s, H / 2 - fy * s));
  const img = () => `<image href="${URI}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(SW * s).toFixed(1)}" height="${(SH * s).toFixed(1)}"/>`;
  const prechod = smer === 'h'
    ? `<linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${NAVY}" stop-opacity=".6"/><stop offset=".55" stop-color="${NAVY}" stop-opacity=".2"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></linearGradient>`
    : `<linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${NAVY}" stop-opacity=".65"/><stop offset=".5" stop-color="${NAVY}" stop-opacity=".2"/><stop offset=".8" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity=".45"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${prechod}</defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  ${img()}
  <rect width="${W}" height="${H}" fill="${NAVY}" opacity="${zavoj}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`;
}

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Kontext', dal: 'Zpráva komise OSN' },
  titulek: 'Vyšetřovatelé<br>OSN viní Izrael<br>z&nbsp;vyhlazování',
  pod: 'Na Západním břehu zabily<br>izraelské síly za tři roky<br>1&nbsp;080 Palestinců',
  logo: 'vlevo',
  // OG přes celou šířku (fotka vyplní i boky), text ve středním čtverci od x 285
  og: 'siroky',
  format: { homepage: { box: [180, 300, 1320, 1080] }, og: { box: [315, 48, 880, 584] }, instagram: { t: 84 }, story: { t: 96 } },
  barvy: { glowA: NAVY, glowB: NAVY, sub: '#e9ecf4', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, svg: Object.fromEntries(Object.keys(L).map((k) => [k, svg(k)])) },
};

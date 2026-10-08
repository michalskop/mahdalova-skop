// Usage: node cover.cjs <repoWithNodeModules> <outDir>
// Vlastní obálka (bez licencované fotky): šikmý rudý pás s nápisem Die Linke,
// před ním rozostřené siluety lidí, text vlevo dole. Barvy z palety DataTimes.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const [repo, out] = process.argv.slice(2);
const { chromium } = createRequire(path.join(repo, 'apps/web/package.json'))('playwright');

const NAVY = '#101432';          // brandNavy.9
const RED = '#de1743';           // brand.6
const RED_DARK = '#8b0e2b';      // brand.9
const RED_MID = '#c5143c';       // brand.7

const LOGO = `<svg viewBox="112 112 276 276" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="1" x2="0.25" y1="0.5" y2="1"><stop offset="50%" stop-color="#ffdc33" stop-opacity="0"/><stop offset="50%" stop-color="#ffdc33"/></linearGradient></defs><g transform="rotate(-30 250 250)"><path fill="none" stroke="#ffdc33" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.6 300"/><path fill="none" stroke="#f76800" stroke-width="76" stroke-linecap="round" d="M 336.6 300 A 100 100 0 0 0 250 150"/><path fill="none" stroke="#de1743" stroke-width="76" stroke-linecap="round" d="M 250 150 A 100 100 0 0 0 250 350"/><path fill="none" stroke="url(#g1)" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.6 300"/></g></svg>`;

// Silueta hlavy a ramen (střed hlavy v 0,0; výška hlavy ~1)
const person = (x, y, s, blur, opts = {}) => {
  const cap = opts.cap
    ? `<path d="M-0.62,-0.18 Q-0.6,-0.78 0,-0.8 Q0.58,-0.78 0.6,-0.2 L0.98,-0.12 Q1.0,-0.02 0.6,-0.04 Z"/>` : '';
  return `<g filter="url(#b${blur})"><g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="0.56" ry="0.7"/>${cap}
    <path d="M-0.34,0.5 Q-0.3,0.9 -0.5,1.0 Q-1.55,1.25 -1.75,2.2 L-1.9,9 L1.9,9 L1.75,2.2 Q1.55,1.25 0.5,1.0 Q0.3,0.9 0.34,0.5 Z"/>
  </g></g>`;
};

const scene = (W, H, people) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0">
  <defs>
    ${[0, 2, 4, 8, 14, 22].map(b => `<filter id="b${b}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${b}"/></filter>`).join('')}
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="${RED_DARK}"/><stop offset="0.45" stop-color="${RED_MID}"/>
      <stop offset="0.7" stop-color="${RED}"/><stop offset="1" stop-color="${RED_DARK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.62" cy="0.38" r="0.6">
      <stop offset="0" stop-color="#ff4d70" stop-opacity="0.45"/><stop offset="1" stop-color="#ff4d70" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0.96"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  ${people.wall}
  <g fill="${NAVY}">${people.list.join('')}</g>
</svg>`;

// Pás s logem: oficiální písmena Die Linke (2023); jejich rovnoběžník je prodloužený
// do stran (x −400 až 1400 v jednotkách loga) a obarvený karmínovou z palety.
const LETTERS = require('./linke-logo.cjs');
const band = (x) => `${x},${(176.3 - 0.1763 * x).toFixed(1)}`;
const bandB = (x) => `${x},${(497.1 - 0.1763 * x).toFixed(1)}`;
const wall = (W, H, L) => `
  <g transform="translate(${L.x},${L.y}) scale(${L.k})">
    <polygon points="${band(-400)} ${band(1400)} ${bandB(1400)} ${bandB(-400)}" fill="url(#wall)"/>
    <polygon points="${band(-400)} ${band(1400)} ${bandB(1400)} ${bandB(-400)}" fill="url(#glow)"/>
    <g fill="#f4f2ec">${LETTERS.map(d => `<path d="${d}"/>`).join('')}</g>
  </g>`;

const page = (W, H, L, svg) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;700&family=IBM+Plex+Serif:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:${NAVY};overflow:hidden;position:relative;font-family:'IBM Plex Sans',sans-serif;color:#f4f2ec}
.fade{position:absolute;inset:0;background:${L.fade}}
.tag{position:absolute;left:${L.tx}px;top:${L.ty}px;font-weight:700;font-size:${L.tag}px;letter-spacing:.14em;white-space:nowrap}
.tag span:first-child{color:#ff4d6d;margin-right:${Math.round(L.tag * .5)}px}
.tag::after{content:'';display:block;width:${L.tag * 2.4}px;height:${Math.round(L.tag / 6)}px;background:${RED};margin-top:${Math.round(L.tag * .45)}px}
.txt{position:absolute;left:${L.hx}px;top:${L.hy}px;width:${L.hw}px}
.h{font-family:'IBM Plex Serif',serif;font-weight:700;font-size:${L.h}px;line-height:1.1}
.s{margin-top:${L.gap}px;font-family:'IBM Plex Serif',serif;font-weight:600;font-size:${L.s}px;line-height:1.25;color:#e6e3f0}
.logo{position:absolute;right:${L.lr}px;bottom:${L.lb}px;display:flex;align-items:center;gap:${L.l * .4}px;font-weight:700;font-size:${L.l}px}
.logo svg{width:${L.l * 2.4}px;height:${L.l * 2.4}px}
</style></head><body>
${svg}
<div class="fade"></div>
<div class="tag"><span>ANALÝZA</span><span>VOLBY V NĚMECKU</span></div>
<div class="txt"><div class="h">„Chceme bydlet důstojně jako vy,“</div><div class="s">říkají mladí lidé v&nbsp;Berlíně<br>a&nbsp;volí Levici</div></div>
<div class="logo">${LOGO}<span>DataTimes.cz</span></div>
</body></html>`;

// 5:4 homepage – pás nahoře, siluety přes střed, text vlevo dole
const HP = {
  W: 1500, H: 1200,
  wall: { x: -40, y: -127, k: 1.5 },
  people: [
    [330, 520, 62, 2], [560, 480, 58, 0, { cap: true }], [790, 440, 64, 2], [1040, 395, 56, 4],
    [1330, 330, 135, 14], [90, 560, 150, 14], [1180, 390, 70, 2],
  ],
  fade: `linear-gradient(180deg,rgba(16,20,50,0) 46%,rgba(16,20,50,.8) 66%,${'#101432'} 80%)`,
  tx: 95, ty: 700, tag: 30, hx: 95, hy: 785, hw: 900, h: 84, gap: 18, s: 54, lr: 95, lb: 70, l: 40,
};
// OG 1200×630 – text vlevo, pás a siluety vpravo; obsah v bezpečné zóně x 100–1100 / y 35–555
const OG = {
  W: 1200, H: 630,
  wall: { x: 520, y: 74, k: 0.7 },
  people: [
    [690, 355, 44, 0, { cap: true }], [850, 330, 40, 2], [1000, 300, 46, 2],
    [1150, 260, 90, 14], [600, 400, 95, 14],
  ],
  fade: `linear-gradient(90deg,#101432 34%,rgba(16,20,50,.85) 48%,rgba(16,20,50,0) 62%),linear-gradient(180deg,rgba(16,20,50,0) 70%,rgba(16,20,50,.75) 100%)`,
  tx: 100, ty: 70, tag: 20, hx: 100, hy: 145, hw: 520, h: 54, gap: 16, s: 38, lr: 100, lb: 75, l: 30,
};

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ headless: true, channel: 'msedge' });
  for (const [name, L] of [['cover.jpg', HP], ['cover-og.jpg', OG]]) {
    const svg = scene(L.W, L.H, { wall: wall(L.W, L.H, L.wall), list: L.people.map(p => person(...p)) });
    const pg = await b.newPage({ viewport: { width: L.W, height: L.H } });
    await pg.setContent(page(L.W, L.H, L, svg), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 88 });
    await pg.close();
  }
  await b.close();
})();

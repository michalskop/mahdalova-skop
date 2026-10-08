// Usage: node compose.cjs <repoWorktree> <coversDir>
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const [repo, dir] = process.argv.slice(2);
const { chromium } = createRequire(path.join(repo, 'apps/web/package.json'))('playwright');

const LOGO = `<svg viewBox="112 112 276 276" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="1" x2="0.25" y1="0.5" y2="1"><stop offset="50%" stop-color="#ffdc33" stop-opacity="0"/><stop offset="50%" stop-color="#ffdc33"/></linearGradient></defs><g transform="rotate(-30 250 250)"><path fill="none" stroke="#ffdc33" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.6 300"/><path fill="none" stroke="#f76800" stroke-width="76" stroke-linecap="round" d="M 336.6 300 A 100 100 0 0 0 250 150"/><path fill="none" stroke="#de1743" stroke-width="76" stroke-linecap="round" d="M 250 150 A 100 100 0 0 0 250 350"/><path fill="none" stroke="url(#g1)" stroke-width="76" stroke-linecap="round" d="M 250 350 A 100 100 0 0 0 336.6 300"/></g></svg>`;

const COVERS = {
  'kolik-ma-cesko-obci': {
    map: 'map-obce.png',
    headline: 'Země malých obcí',
    sub: '<b class="red">Červeně</b> obce pod 500 obyvatel. Je jich víc než polovina z&nbsp;6&nbsp;254. Jejich správa stojí na obyvatele až dvakrát víc než v&nbsp;obcích s&nbsp;tisícovkou obyvatel.',
  },
  'mista-bez-konkurence': {
    map: 'map-kandidatky.png',
    headline: 'Volby bez výběru',
    sub: '<b class="lila">1&nbsp;830 obcí</b> má jedinou kandidátku. V&nbsp;931 z&nbsp;nich budou zvoleni všichni.',
  },
};

// mapa v PNG: Česko leží zhruba v x 324–2076, y 260–1340 (2400 × 1600)
const page = (c, W, H, L) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;700&family=IBM+Plex+Serif:wght@700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#101432;overflow:hidden;position:relative;font-family:'IBM Plex Sans',sans-serif;color:#f4f2ec}
.map{position:absolute;left:${L.mx}px;top:${L.my}px;width:${L.mw}px}
.fade{position:absolute;inset:0;background:${L.fade}}
.tag{position:absolute;left:${L.tx}px;top:${L.ty}px;font-weight:700;font-size:${L.tag}px;letter-spacing:.14em;white-space:nowrap}
.tag span:first-child{color:#ff4d6d;border-bottom:${Math.round(L.tag/7)}px solid #de1743;padding-bottom:${Math.round(L.tag/3)}px;margin-right:${Math.round(L.tag*.6)}px}
.txt{position:absolute;left:${L.hx}px;top:${L.hy}px;width:${L.hw}px}
.h{font-family:'IBM Plex Serif',serif;font-weight:700;font-size:${L.h}px;line-height:1.08}
.s{margin-top:${L.gap}px;font-weight:500;font-size:${L.s}px;line-height:1.35;color:#d9d7e6}
.red{color:#ff4d6d}.lila{color:#d6a8ec}
.logo{position:absolute;right:${L.lr}px;bottom:${L.lb}px;display:flex;align-items:center;gap:${L.l*.4}px;font-weight:700;font-size:${L.l}px}
.logo svg{width:${L.l*2.4}px;height:${L.l*2.4}px}
</style></head><body>
<img class="map" src="${c.mapUrl}">
<div class="fade"></div>
<div class="tag"><span>ANALÝZA</span><span>VOLBY 2026</span></div>
<div class="txt"><div class="h">${c.headline}</div><div class="s">${c.sub}</div></div>
<div class="logo">${LOGO}<span>DataTimes.cz</span></div>
</body></html>`;

// homepage 1500×1200: text nahoře, mapa přes celou šířku dole
const HP = { mx: 30, my: 350, mw: 1330, gap: 22, fade: 'linear-gradient(180deg,#101432 28%,rgba(16,20,50,0) 42%)',
  tx: 80, ty: 62, tag: 34, hx: 80, hy: 150, hw: 1340, h: 118, sy: 300, s: 40, lr: 95, lb: 70, l: 42 };
// OG 1200×630: mapa vlevo, text vpravo
const OG = { mx: -330, my: 10, mw: 1450, gap: 18, fade: 'linear-gradient(90deg,rgba(16,20,50,0) 38%,rgba(16,20,50,.85) 55%,#101432 62%)',
  tx: 600, ty: 50, tag: 21, hx: 600, hy: 118, hw: 540, h: 66, sy: 290, s: 26, lr: 100, lb: 70, l: 30 };

(async () => {
  const b = await chromium.launch({ headless: true, channel: 'msedge' });
  for (const [slug, c] of Object.entries(COVERS)) {
    c.mapUrl = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, c.map)).toString('base64');
    for (const [name, W, H, L] of [['cover.jpg', 1500, 1200, HP], ['cover-og.jpg', 1200, 630, OG]]) {
      const pg = await b.newPage({ viewport: { width: W, height: H } });
      await pg.setContent(page(c, W, H, L), { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      fs.mkdirSync(path.join(dir, 'final', slug), { recursive: true });
      await pg.screenshot({ path: path.join(dir, 'final', slug, name), type: 'jpeg', quality: 88 });
      await pg.close();
    }
  }
  await b.close();
})();

// Kontrolní list coverů: jak se který formát ořízne na homepage a na sítích (simulace ořezů na střed).
// node _cover_pipeline/nahledy.cjs  → _cover_pipeline/nahledy.png  (nepublikuje se, jen ke kontrole)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const IMG = path.join(__dirname, '..', 'images');
const STARY = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'images', 'cover.png');
const u = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const hp = u(path.join(IMG, 'cover-homepage.png')), og = u(path.join(IMG, 'cover-og.jpg')).replace('image/png', 'image/jpeg'), sq = u(path.join(IMG, 'cover-square.png'));
const ig = u(path.join(IMG, 'cover-instagram.png')), st = u(path.join(IMG, 'cover-story.png')), old = u(STARY);

// rámeček s ořezem na střed (object-fit: cover), volitelně štítek rubriky vpravo nahoře jako na homepage
const box = (src, w, h, popis, stitek = false) => `<figure><div class="b" style="width:${w}px;height:${h}px"><img src="${src}">${stitek ? '<span class="rub">Analýza</span>' : ''}</div><figcaption>${popis}</figcaption></figure>`;

const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><style>
body{margin:0;padding:28px;background:#f4f2ec;font:14px/1.4 Arial,sans-serif;color:#101432;width:1500px}
h2{font-size:20px;margin:26px 0 10px}
.r{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
figure{margin:0}.b{position:relative;overflow:hidden;border-radius:6px;background:#ddd;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.b img{width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block}
.rub{position:absolute;top:8px;right:12px;background:#de1743;color:#fff;font-weight:700;font-size:12px;padding:2px 8px;border-radius:10px}
figcaption{margin-top:6px;color:#4c4f8e;max-width:420px}
.story{position:relative}.story:before,.story:after{content:'';position:absolute;left:0;right:0;background:rgba(222,23,67,.25)}
.story:before{top:0;height:${250 / 1920 * 100}%}.story:after{bottom:0;height:${340 / 1920 * 100}%}
</style></head><body>
<h2>Homepage (homepageImage 1500×1200, karta 5:4) – nový vs. původní cover predikce</h2>
<div class="r">${box(hp, 420, 336, 'nový: velká karta 5:4', true)}${box(old, 420, 336, 'původní predikce: velká karta 5:4', true)}${box(hp, 260, 260, 'postranní karta homepage (≈ čtverec, ořez boků)', true)}${box(hp, 300, 200, 'postranní karta 481–767 px (na šířku)', true)}${box(hp, 160, 128, 'mobilní seznam (45 % šířky)')}${box(hp, 120, 96, 'související články 120×96')}</div>
<h2>Sociální sítě</h2>
<div class="r">${box(og, 600, 315, 'OG 1200×630 – Facebook, X, LinkedIn')}${box(og, 315, 315, 'OG oříznutý na čtverec – Bluesky, WhatsApp, Messenger')}${box(sq, 315, 315, 'čtverec 1080×1080 – přímé sdílení / Bluesky obrázek')}</div>
<div class="r" style="margin-top:22px">${box(ig, 320, 400, 'Instagram feed 4:5 (1080×1350)')}${box(ig, 300, 400, 'mřížka profilu Instagramu 3:4')}<figure><div class="b story" style="width:270px;height:480px"><img src="${st}"></div><figcaption>Instagram stories 9:16 (1080×1920) – červeně zóny překryté rozhraním</figcaption></figure></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1560, height: 1200 } });
  await page.setContent(html);
  await page.screenshot({ path: path.join(__dirname, 'nahledy.png'), fullPage: true });
  await browser.close();
  console.log('nahledy.png');
})();

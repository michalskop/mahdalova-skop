// Kontaktní arch coverů: všech 5 formátů celé + simulace ořezů na webu a sítích (ořez na střed).
// PW_PATH=<repo>/node_modules/playwright node tools/kontaktni-arch.cjs <images/ článku> [výstup.png]
// Bere cover-<formát>.png nebo .jpg (fotografické covery jsou v JPEG). Arch se nepublikuje, jen ke kontrole.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const IMG = path.resolve(process.argv[2]);
const OUT = process.argv[3] ? path.resolve(process.argv[3]) : path.join(IMG, '..', '_cover_pipeline', 'kontaktni-arch.png');
const u = (k) => {
  const f = ['png', 'jpg'].map((x) => `cover-${k}.${x}`).find((n) => fs.existsSync(path.join(IMG, n)));
  if (!f) throw new Error(`chybí cover-${k}.png/.jpg v ${IMG}`);
  return `data:image/${f.endsWith('png') ? 'png' : 'jpeg'};base64,` + fs.readFileSync(path.join(IMG, f)).toString('base64');
};
const hp = u('homepage'), og = u('og'), sq = u('square');
const ig = u('instagram'), st = u('story');
const ogKb = Math.round(fs.statSync(path.join(IMG, 'cover-og.jpg')).size / 1024);

// rámeček s ořezem na střed (object-fit: cover), volitelně štítek rubriky vpravo nahoře jako v kartách webu
const box = (src, w, h, popis, stitek = false, cls = '') => `<figure><div class="b ${cls}" style="width:${w}px;height:${h}px"><img src="${src}">${stitek ? '<span class="rub">Analýza</span>' : ''}</div><figcaption>${popis}</figcaption></figure>`;

const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><style>
body{margin:0;padding:28px;background:#f4f2ec;font:14px/1.4 Arial,sans-serif;color:#101432;width:1500px}
h2{font-size:20px;margin:26px 0 10px}
.r{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
figure{margin:0}.b{position:relative;overflow:hidden;border-radius:6px;background:#ddd;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.b img{width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block}
.rub{position:absolute;top:8px;right:12px;background:#de1743;color:#fff;font-weight:700;font-size:12px;padding:2px 8px;border-radius:10px}
figcaption{margin-top:6px;color:#4c4f8e;max-width:420px}
.og-sq:after{content:'';position:absolute;top:0;bottom:0;left:${(285 / 1200) * 100}%;width:${(630 / 1200) * 100}%;outline:2px dashed rgba(222,23,67,.8)}
/* kontrolní zóny jen čárkovaným obrysem, nikdy výplní: barevná výplň vypadala jako součást coveru (Kateřina 27. 10. 2026) */
.story:before,.story:after{content:'';position:absolute;left:0;right:0;z-index:1;box-sizing:border-box}
.story:before{top:0;height:${(250 / 1920) * 100}%;border-bottom:2px dashed #de1743}.story:after{bottom:0;height:${(340 / 1920) * 100}%;border-top:2px dashed #de1743}
.zona:after{content:'';position:absolute;left:${(950 / 1500) * 100}%;top:0;right:0;height:${(280 / 1200) * 100}%;border-left:2px dashed #de1743;border-bottom:2px dashed #de1743;box-sizing:border-box}
</style></head><body>
<h2>Celé formáty</h2>
<div class="r">${box(hp, 375, 300, 'homepage 1500×1200 – čárkovaně zóna štítku rubriky (x ≥ 950, y ≤ 280; jen kontrola, v obrázku není)', false, 'zona')}${box(og, 571, 300, `OG 1200×630 (${ogKb} kB) – čárkovaně střední čtverec 630`, false, 'og-sq')}${box(sq, 300, 300, 'čtverec 1080×1080')}</div>
<div class="r" style="margin-top:22px">${box(ig, 300, 375, 'Instagram 4:5 (1080×1350)')}<figure><div class="b story" style="width:240px;height:427px"><img src="${st}"></div><figcaption>stories 9:16 – čárkovaně zóny pod rozhraním Instagramu (jen kontrola, v obrázku nejsou)</figcaption></figure></div>
<h2>Karty webu (5:4 ořez, štítek rubriky)</h2>
<div class="r">${box(hp, 420, 336, 'velká karta 5:4', true)}${box(hp, 230, 184, 'boční karta 230 px', true)}${box(hp, 160, 128, 'mobilní seznam (45 % šířky)', true)}${box(hp, 120, 96, 'související články 120×96')}</div>
<h2>Ořezy na sítích</h2>
<div class="r">${box(og, 600, 315, 'OG – Facebook, X, LinkedIn')}${box(og, 315, 315, 'OG oříznutý na čtverec – WhatsApp, Bluesky, Messenger')}${box(og, 100, 100, 'WhatsApp náhled ~100 px')}${box(ig, 300, 400, 'mřížka profilu Instagramu 3:4')}</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1560, height: 1200 } });
  await page.setContent(html);
  await page.screenshot({ path: OUT, fullPage: true });
  await browser.close();
  console.log(OUT, 'OG', ogKb, 'kB');
})();

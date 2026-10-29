// Anatomie coveru: prázdné šablony všech pěti formátů s bezpečnými zónami a popsanými částmi (zavedené anglické
// názvy, česky v závorce). Výstup tools/cover-anatomie.png je nákres do manuálu COVER-EDITOR.md → *Názvy částí coveru*.
// Polohy odpovídají FORMATY v cover-generator.cjs; při změně zón nebo formátů nákres vyrenderovat znovu:
// PW_PATH=<repo>/node_modules/playwright node tools/cover-anatomie.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { FORMATY } = require('./cover-generator.cjs');

const NAVY = '#101432';
const RED = '#de1743';
const OUT = path.join(__dirname, 'cover-anatomie.png');

// Šrafa = plocha mimo bezpečnou zónu textu (motiv sem smí, text a logo ne).
const srafa = (x, y, w, h, popis = '') => `<div class="srafa" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${popis ? `<span>${popis}</span>` : ''}</div>`;
const stitek = (text, x, y, vpravo = false) => `<div class="tag" style="${vpravo ? `right:${x}px` : `left:${x}px`};top:${y}px">${text}</div>`;

// výška textového bloku (štítek, dva řádky titulku, dva řádky podtitulku)
const vyskaBloku = (f) => f.kick * 1.6 + f.t * 0.3 + f.t * 2.12 + f.t * 0.4 + f.sub * 2.6;
// Textový blok: štítek, titulek, podtitulek (lorem ipsum v reálných velikostech formátu)
function blok(f, x, y, sirka, { t = f.t, popisky = true, tagX = x + sirka + 24, vpravo = false, kickNad = false } = {}) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${sirka}px">
    <div class="kick" style="font-size:${f.kick}px"><span class="cerv">Rubrika</span><span class="sep">•</span>Téma článku</div>
    <h1 style="font-size:${t}px;margin-top:${t * 0.3}px">Lorem ipsum<br>dolor sit amet</h1>
    <div class="sub" style="font-size:${f.sub}px;margin-top:${t * 0.4}px">Consectetur adipiscing elit,<br>sed do eiusmod tempor</div>
  </div>${popisky ? (kickNad ? stitek('Kicker / eyebrow (štítek) ↓', x, y - f.kick * 2.4) : stitek('← Kicker / eyebrow (štítek)', tagX, y - 4, vpravo)) + stitek('← Headline (titulek)', tagX, y + f.kick * 1.6 + t * 0.7, vpravo) + stitek('← Dek / standfirst (podtitulek)', tagX, y + f.kick * 1.6 + t * 2.82, vpravo) : ''}`;
}
const motiv = (x, y, w, h, anot = true) => `<div class="motiv" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><span>Key visual (motiv)</span>${anot ? `<b class="anot" style="left:${w * 0.62}px;top:${h * 0.24}px">● Místo</b><em class="tag" style="left:${w * 0.62}px;top:${h * 0.24 + 40}px">↑ Annotation / data label (popisek)</em>` : ''}</div>`;
const logo = (f, x, y, vpravo = false) => `<div class="logo" style="${vpravo ? `right:${x}px` : `left:${x}px`};top:${y}px;font-size:${f.logo}px"><i></i>DataTimes.cz</div>`;
const legenda = (f, x, y) => `<div class="leg" style="right:${x}px;top:${y}px;font-size:${f.leg ?? 24}px"><div>položka A <i style="background:#f76800"></i></div><div>položka B <i style="background:#5fcce6"></i></div></div>`;

function format(klic) {
  const f = FORMATY[klic];
  const { w, h } = f;
  const [bx0, by0, bx1, by1] = f.box;
  let s = '';
  if (klic === 'homepage') {
    s += srafa(0, 0, w, by0) + srafa(0, by1, w, h - by1) + srafa(0, by0, bx0, by1 - by0) + srafa(bx1, by0, w - bx1, by1 - by0);
    s += `<div class="zona" style="left:950px;top:0;width:${w - 950}px;height:280px"><span class="badge">Analýza</span><span>Category badge / section tag (štítek rubriky) – web ho dokreslí</span></div>`;
    s += motiv(760, 470, 700, 600) + blok(f, bx0, by0 + 40, 560, { tagX: 860, kickNad: true });
    s += logo(f, bx0, by1 - f.logo * 1.6) + legenda(f, w - bx1, by1 - f.leg * 3.4);
    s += stitek('Logo (logo)', bx0, by1 - f.logo * 3.2) + stitek('Legend / key (legenda)', w - bx1 - 20, by1 - f.leg * 5.2, true);
  } else if (klic === 'og') {
    s += srafa(0, 0, 285, h, 'mimo čtverec: jen motiv') + srafa(915, 0, w - 915, h, 'mimo čtverec: jen motiv');
    s += `<div class="ctverec"><span>Center square / safe area 630 × 630 (střední čtverec, ořez WhatsApp, Signal)</span></div>`;
    s += `<div class="vule" style="left:320px;top:48px;width:560px;height:536px"></div>`;
    s += motiv(470, 330, 520, 270, false) + blok(f, 320, 60, 520, { popisky: false });
    s += logo(f, 320, 584 - f.logo * 1.6);
    s += stitek('← Kicker', 930, 50) + stitek('← Headline', 930, 120) + stitek('← Dek', 930, 245) + stitek('Logo ↓', 320, 505);
  } else {
    const m = klic === 'square' ? 70 : 70;
    if (klic === 'square') s += srafa(0, 0, w, m) + srafa(0, h - m, w, m) + srafa(0, m, m, h - 2 * m) + srafa(w - m, m, m, h - 2 * m);
    if (klic === 'instagram') s += srafa(0, 0, w, 80, 'ořez mřížky profilu 3:4') + srafa(0, h - 80, w, 80, 'ořez mřížky profilu 3:4') + srafa(0, 80, m, h - 160) + srafa(w - m, 80, m, h - 160);
    if (klic === 'story') s += srafa(0, 0, w, 250, 'UI overlay: profil, průběh (rozhraní Instagramu)') + srafa(0, h - 340, w, 340, 'UI overlay: odpověď, reakce (rozhraní Instagramu)') + srafa(0, 250, 80, h - 590) + srafa(w - 80, 250, 80, h - 590);
    const top = klic === 'story' ? 300 : by0 + 20;
    s += blok(f, bx0, top, (bx1 - bx0) * 0.6, { tagX: w - bx1, vpravo: true });
    const vy = top + vyskaBloku(f) + f.t * 0.45, vb = (klic === 'story' ? h - 340 : by1) - f.logo * 2.4;
    s += motiv(bx0, vy, bx1 - bx0, vb - vy - 20);
    s += logo(f, bx0, vb + f.logo * 0.4) + legenda(f, w - bx1, vb - f.leg * 0.4);
    s += stitek('Logo', bx0, vb - f.logo * 1.1) + stitek('Legend / key', w - bx1, vb - f.leg * 2.4, true);
  }
  return `<div class="cover" style="width:${w}px;height:${h}px">${s}</div>`;
}

const POPIS = {
  homepage: ['Homepage cover 1500 × 1200 (5:4)', 'web: karty článků na titulce a v rubrikách'],
  og: ['OG image 1200 × 630', 'náhled odkazu: Facebook, X, LinkedIn, Bluesky celý; WhatsApp, Signal, Messenger jen střední čtverec'],
  square: ['Square 1080 × 1080 (1:1)', 'ruční sdílení: Bluesky, WhatsApp, X; carousel'],
  instagram: ['Portrait 1080 × 1350 (4:5)', 'Instagram feed, carousel; Facebook, LinkedIn na výšku'],
  story: ['Story 1080 × 1920 (9:16)', 'Instagram a Facebook stories, Reels, TikTok, YouTube Shorts'],
};
const MERITKO = { homepage: 0.42, og: 0.5, square: 0.42, instagram: 0.42, story: 0.36 };
const karta = (k) => {
  const f = FORMATY[k], z = MERITKO[k];
  return `<figure><div style="width:${f.w * z}px;height:${f.h * z}px;overflow:hidden;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,.25)"><div style="transform:scale(${z});transform-origin:0 0">${format(k)}</div></div><figcaption><b>${POPIS[k][0]}</b><br>${POPIS[k][1]}</figcaption></figure>`;
};

const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:32px;background:#f4f2ec;font:15px/1.4 'IBM Plex Sans',Arial,sans-serif;color:${NAVY};width:1640px}
h2{font:700 30px 'IBM Plex Serif',serif;margin:0 0 6px}
p.u{margin:0 0 22px;color:#4c4f8e;max-width:1500px}
.r{display:flex;gap:28px;align-items:flex-start;margin-bottom:26px}
figure{margin:0}figcaption{margin-top:8px;max-width:640px;color:#4c4f8e}figcaption b{color:${NAVY}}
.cover{position:relative;background:radial-gradient(ellipse at 0% 20%,#044d5e 0%,#044d5e00 55%),${NAVY};color:#fff;overflow:hidden}
.srafa{position:absolute;background:repeating-linear-gradient(45deg,rgba(222,23,67,.38) 0 6px,transparent 6px 22px);box-sizing:border-box}
.srafa span{position:absolute;left:50%;top:88%;transform:translate(-50%,-50%);font:600 26px 'IBM Plex Sans';color:#fff;background:rgba(16,20,50,.85);padding:4px 12px;border-radius:6px;white-space:nowrap}
.zona{position:absolute;border-left:3px dashed ${RED};border-bottom:3px dashed ${RED};box-sizing:border-box;background:repeating-linear-gradient(-45deg,rgba(222,23,67,.5) 0 6px,transparent 6px 18px)}
.zona span{position:absolute;left:24px;bottom:22px;right:24px;font:600 24px 'IBM Plex Sans';background:rgba(16,20,50,.9);padding:6px 10px;border-radius:6px}
.zona .badge{left:auto;right:30px;top:24px;bottom:auto;background:${RED};font-weight:700;padding:4px 18px;border-radius:30px}
.ctverec{position:absolute;left:285px;top:0;width:630px;height:630px;border:4px dashed #39ff14;box-sizing:border-box}
.ctverec span{position:absolute;left:8px;bottom:6px;font:600 17px 'IBM Plex Sans';color:#39ff14}
.vule{position:absolute;border:2px dotted #39ff14}
.motiv{position:absolute;border:3px dashed #8f9dc9;border-radius:24px;background:repeating-linear-gradient(0deg,rgba(143,157,201,.18) 0 2px,transparent 2px 26px),repeating-linear-gradient(90deg,rgba(143,157,201,.18) 0 2px,transparent 2px 26px)}
.motiv span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 30px 'IBM Plex Sans';color:#d2d8e9;white-space:nowrap}
.kick{font-family:'IBM Plex Sans';font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#f8f6f0;display:flex;gap:.5em}
.kick .cerv{color:${RED};border-bottom:3px solid ${RED};padding-bottom:.3em}.kick .sep{color:${RED}}
h1{margin:0;font-family:'IBM Plex Serif';font-weight:700;line-height:1.06;white-space:nowrap}
.sub{font-family:'IBM Plex Sans';font-weight:500;line-height:1.3;color:#d2d8e9;white-space:nowrap}
.logo{position:absolute;display:flex;align-items:center;gap:.3em;font-family:'IBM Plex Serif';font-weight:700}
.logo i{width:1.3em;height:1.3em;border-radius:50%;border:.28em solid ${RED};box-sizing:border-box;display:inline-block}
.leg{position:absolute;text-align:right;font-family:'IBM Plex Sans';font-weight:500;line-height:1.6}
.leg i{display:inline-block;width:.6em;height:.6em;border-radius:50%;margin-left:.4em}
.anot{position:absolute;font:600 26px 'IBM Plex Sans';color:#5fcce6}
em.tag{font-style:normal}
.tag{position:absolute;font:700 22px 'IBM Plex Sans';color:${NAVY};background:#ffe14d;padding:3px 10px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)}
</style></head><body>
<h2>Anatomie coveru DataTimes.cz</h2>
<p class="u">Žlutě: zavedený anglický název části (česky v závorce). Červená šrafa: mimo bezpečnou zónu, sem nepatří text ani logo (motiv smí). Zeleně čárkovaně: střední čtverec OG, tečkovaně jeho vůle 35 px pro text. Rozměry a zóny podle <code>tools/cover-generator.cjs</code>.</p>
<div class="r">${karta('homepage')}${karta('og')}</div>
<div class="r">${karta('square')}${karta('instagram')}${karta('story')}</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1704, height: 1200 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: OUT, fullPage: true });
  await browser.close();
  console.log(OUT);
})();

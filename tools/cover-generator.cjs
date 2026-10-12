// Společný generátor sady coverů DataTimes (tools/COVER-EDITOR.md → „Sada pro web a sociální sítě“).
// Z jednoho konfiguračního souboru článku vyrobí všech pět formátů se stejnými kotvami a písmy:
//   titulek            IBM Plex Serif Bold (jediný patkový text kromě loga)
//   kicker, nadtitulek, podtitulek, štítek, legenda   IBM Plex Sans
//   logo DataTimes.cz  donut + IBM Plex Serif Bold, vpravo dole v bezpečné zóně
// Kotvy homepage 1500×1200: text od x 180 / y 120, logo pravý dolní roh zóny (1320, 1080),
// oblast x ≥ 950, y ≤ 280 prázdná (štítek rubriky v malých kartách webu); ikona coveru až pod ní.
// OG 1200×630: titulek a logo ve středním čtverci 630×630 (WhatsApp, Bluesky a Messenger ořezávají).
// Barvy jen přesně ze závazné palety (packages/ui/DESIGN.md → Full palette).
//
// node tools/cover-generator.cjs <cesta ke cover.config.cjs> [formát…]
// (PW_PATH = cesta k balíčku playwright, výchozí 'playwright'; prohlížeč: nainstalovaný Microsoft Edge)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const REPO = path.join(__dirname, '..');
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const NAVY = '#101432'; // brandNavy.9

// box = bezpečná zóna textu a loga [x0, y0, x1, y1]; mapa = kam se kreslí tečková mapa;
// ikona = [pravý okraj, horní hrana, šířka]; t/sub/kick/logo = velikosti písma; stred = vše na střed (OG)
const FORMATY = {
  homepage: { soubor: 'cover-homepage.png', w: 1500, h: 1200, box: [180, 120, 1320, 1080], mapa: [150, 620, 1350, 1000], ikona: [1320, 470, 230], t: 100, sub: 38, kick: 30, logo: 44 },
  og: { soubor: 'cover-og.jpg', w: 1200, h: 630, box: [285, 40, 915, 590], mapa: [0, 0, 1200, 630], ikona: null, t: 60, sub: 26, kick: 22, logo: 30, stred: true },
  square: { soubor: 'cover-square.png', w: 1080, h: 1080, box: [70, 70, 1010, 1010], mapa: [70, 540, 1010, 930], ikona: [1010, 70, 190], t: 88, sub: 34, kick: 26, logo: 40 },
  instagram: { soubor: 'cover-instagram.png', w: 1080, h: 1350, box: [70, 110, 1010, 1240], mapa: [70, 640, 1010, 1120], ikona: [1010, 110, 190], t: 92, sub: 36, kick: 26, logo: 40 },
  story: { soubor: 'cover-story.png', w: 1080, h: 1920, box: [80, 260, 1000, 1570], mapa: [0, 980, 1080, 1520], ikona: [1000, 260, 210], t: 104, sub: 40, kick: 28, logo: 44 },
};

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const dataUri = (p) => `data:${MIME[path.extname(p)]};base64,${fs.readFileSync(p).toString('base64')}`;

function tecky(c, f) {
  const m = c.motiv;
  const [mx0, my0, mx1, my1] = f.mapa;
  const lon = m.dots.map((d) => d[0]), lat = m.dots.map((d) => d[1]);
  const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
  const kx = Math.cos((49.8 * Math.PI) / 180);
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  const op = f.stred ? 0.35 : 1; // u OG je mapa jen pozadí za textem
  const vol = new Set(m.vol);
  const d = m.dots.map(([lo, la, o]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${vol.has(o) ? m.barvaObvod : m.barvaTecka}" opacity="${op}"/>`; }).join('');
  const b = m.body.map((o) => { const [x, y] = P(o.lon, o.lat); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 2.3).toFixed(1)}" fill="${m.barvaBod}" stroke="${m.obrysBod}" stroke-width="${(r * 0.7).toFixed(1)}" opacity="${op}"/>`; }).join('');
  return `<svg style="position:absolute;left:0;top:0" width="${f.w}" height="${f.h}">${d}${b}</svg>`;
}

function obrazek(c, f, klic) {
  const m = c.motiv;
  const [x, y, h] = m.pozice[klic];
  const op = f.stred ? m.opacityOg ?? 0.45 : 1;
  return `<img src="${dataUri(m.src)}" style="position:absolute;left:${x}px;top:${y}px;height:${h}px;mix-blend-mode:screen;opacity:${op};filter:brightness(${m.jas ?? 0.75})">`;
}

function html(c, klic) {
  // c.ikonaPozice = { homepage: [pravý okraj, horní hrana, šířka] } – když dlouhý titulek koliduje s ikonou
  const f = { ...FORMATY[klic], ...(c.ikonaPozice?.[klic] ? { ikona: c.ikonaPozice[klic] } : {}) };
  const { w, h } = f;
  const [bx0, by0, bx1, by1] = f.box;
  const motiv = c.motiv.typ === 'tecky' ? tecky(c, f) : obrazek(c, f, klic);
  const scrim = !f.stred && c.motiv.scrim ? `<div style="position:absolute;inset:0;background:linear-gradient(90deg,${NAVY} 0%,${NAVY}e6 ${c.motiv.scrim[0]}%,${NAVY}00 ${c.motiv.scrim[1]}%)"></div>` : '';
  const ogScrim = f.stred ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 34% 60% at 50% 50%,${NAVY}cc,${NAVY}00)"></div>` : '';
  const stitek = c.stitek ? `<span class="stitek">${c.stitek}</span>` : '';
  // Štítek coveru (redakční standard): verzálky Plex Sans, první část karmínově s podtržením končícím
  // v půlce posledního písmene, pak „•“ a zbytek bíle. c.kicker = { cervene, dal } (nebo prostý text).
  const k = typeof c.kicker === 'string' ? { dal: c.kicker } : c.kicker;
  const kicker = `<div class="kick">${k.cervene ? `<span class="cerv">${k.cervene}</span>` : ''}${k.cervene && k.dal ? `<span class="sep">${k.oddelovac ?? '•'}</span>` : ''}${k.dal ? `<span>${k.dal}</span>` : ''}${stitek}</div>`;
  const nad = c.nad ? `<div class="nad">${c.nad}</div>` : '';
  const pod = c.pod ? `<div class="sub">${c.pod}</div>` : '';
  const logo = `<div class="logo">${DONUT}<span>DataTimes.cz</span></div>`;
  // SVG ikona se vkládá přímo (písmo v ní pak bere IBM Plex ze stránky), rastr jako <img>
  const ikonaEl = (style) => c.ikona.endsWith('.svg')
    ? `<div style="${style};line-height:0">${fs.readFileSync(c.ikona, 'utf8').replace('<svg ', '<svg style="width:100%;height:auto" ')}</div>`
    : `<img src="${dataUri(c.ikona)}" style="${style}">`;
  const ikona = c.ikona && f.ikona ? ikonaEl(`position:absolute;left:${f.ikona[0] - f.ikona[2]}px;top:${f.ikona[1]}px;width:${f.ikona[2]}px`) : '';
  const ikonaOg = c.ikona && f.stred ? ikonaEl(`width:${f.t * 1.5}px`) : '';
  const leg = c.legenda && !f.stred ? `<div class="leg" style="left:${bx0}px;bottom:${h - by1}px">${c.legenda.map(([b, t]) => `<div><i style="background:${b}"></i>${t}</div>`).join('')}</div>` : '';
  const logoPravy = Math.max(Math.round(w * 0.032), w - bx1);
  const text = f.stred
    ? `<div style="position:absolute;left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px;height:${by1 - by0}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:${f.t * 0.22}px">
         ${ikonaOg}${kicker}${nad}<h1>${c.titulek}</h1>${pod}<div style="margin-top:${f.t * 0.2}px">${logo}</div></div>`
    : `<div style="position:absolute;left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px">
         ${kicker}
         ${nad ? `<div style="margin-top:${f.t * 0.45}px">${nad}</div>` : ''}
         <h1 style="margin-top:${f.t * (nad ? 0.15 : 0.3)}px">${c.titulek}</h1>
         ${pod ? `<div style="margin-top:${f.t * 0.3}px">${pod}</div>` : ''}
       </div>
       ${leg}
       <div style="position:absolute;right:${logoPravy}px;bottom:${h - by1}px">${logo}</div>`;
  const b = c.barvy;
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;color:#fff}
  body{position:relative;background:radial-gradient(ellipse at 0% 20%,${b.glowA} 0%,${b.glowA}00 55%),radial-gradient(ellipse at 100% 100%,${b.glowB} 0%,${b.glowB}00 55%),${NAVY}}
  .kick{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:600;font-size:${f.kick}px;letter-spacing:.16em;text-transform:uppercase;color:#f8f6f0;display:flex;align-items:center;gap:${f.kick * 0.5}px;white-space:nowrap;width:max-content;max-width:none;justify-content:${f.stred ? 'center' : 'flex-start'};${f.stred ? 'margin:0 auto;' : ''}padding-bottom:.5em}
  .kick .cerv{color:#de1743;position:relative}
  .kick .cerv::after{content:'';position:absolute;left:0;bottom:-.42em;height:max(3px,.11em);width:calc(100% - .5em);background:#de1743}
  .kick .sep{color:#de1743}
  .kick.dva{flex-wrap:wrap;row-gap:.75em;width:auto}
  .kick.dva .sep{display:none}
  .kick.dva .zlom{flex-basis:100%;height:0}
  .stitek{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;letter-spacing:.08em;font-size:${f.kick}px;padding:${f.kick * 0.25}px ${f.kick * 0.6}px;border-radius:${f.kick}px;background:${b.stitek};color:#fff}
  .nad{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:600;font-size:${f.sub}px;line-height:1.3;color:#fff}
  h1{margin:0;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.t}px;line-height:1.06;text-shadow:0 2px 10px rgba(0,0,0,.35)}
  .sub{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:${f.sub}px;line-height:1.3;color:${b.sub}}
  .leg{position:absolute;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:${f.kick * 0.9}px;line-height:1.6}
  .leg i{display:inline-block;width:${f.kick * 0.6}px;height:${f.kick * 0.6}px;border-radius:50%;margin-right:${f.kick * 0.4}px}
  .logo{display:flex;align-items:center;gap:${f.logo * 0.3}px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.logo}px;text-shadow:0 1px 6px rgba(0,0,0,.4)}
  .logo svg{width:${f.logo * 1.5}px;height:${f.logo * 1.5}px}
</style></head><body>
${motiv}${scrim}${ogScrim}${ikona}
${text}
</body></html>`;
}

(async () => {
  const cfgPath = path.resolve(process.argv[2]);
  const c = require(cfgPath);
  const jen = process.argv.slice(3);
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const klic of Object.keys(FORMATY).filter((k) => !jen.length || jen.includes(k))) {
    const f = FORMATY[klic];
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(c, klic), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Štítek coveru se zmenší, dokud se nevejde: homepage končí před zónou štítku rubriky (x 950),
    // ostatní formáty v šířce bezpečné zóny.
    const maxW = klic === 'homepage' ? 950 - f.box[0] : f.box[2] - f.box[0];
    // Zmenšuje se nejvýš na 70 %; když se ani tak nevejde, zlomí se za karmínovou částí na dva řádky
    // (bez „•“) v plné velikosti.
    await page.evaluate((maxW) => {
      const el = document.querySelector('.kick');
      const s0 = parseFloat(getComputedStyle(el).fontSize);
      let s = s0;
      while (el.scrollWidth > maxW && s > s0 * 0.7) { s -= 1; el.style.fontSize = `${s}px`; }
      if (el.scrollWidth > maxW) {
        el.style.fontSize = `${s0}px`;
        el.classList.add('dva');
        const zlom = document.createElement('span');
        zlom.className = 'zlom';
        el.querySelector('.sep')?.after(zlom);
      }
    }, maxW);
    const out = path.join(c.vystup, f.soubor);
    await page.screenshot(f.soubor.endsWith('.jpg') ? { path: out, type: 'jpeg', quality: 88 } : { path: out });
    await page.close();
    console.log(path.relative(REPO, out), `${f.w}×${f.h}`, `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();

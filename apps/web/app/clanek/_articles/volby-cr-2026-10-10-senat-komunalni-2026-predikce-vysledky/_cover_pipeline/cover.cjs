// Cover článku „Volby 2026 – výsledky predikce“: homepage + 4 formáty pro sociální sítě, podle tools/COVER-EDITOR.md.
// Barvy jen ze závazné palety (packages/ui/DESIGN.md): brandNavy.9 pozadí, brandEmeraldMint 7/4/2/1/5, brandTeal 7/5, brandYellow.6, brandNavy.8.
// Písmo: titulek a podtitulek IBM Plex Serif, kicker a štítky IBM Plex Sans; logo vpravo dole (okraj ≈ 3,2 % šířky).
// Bezpečné zóny (důležitý text a logo musí být uvnitř):
//   homepage 1500×1200 – všechny karty webu 5:4 → vše uvnitř x 180–1320, y 120–1080;
//                        oblast x ≥ 950, y ≤ 280 prázdná (štítek rubriky v malých kartách)
//   og       1200×630  – Facebook/X/LinkedIn; Bluesky a messengery ořezávají na čtverec → text a logo ve středním čtverci
//   square   1080×1080 – přímé sdílení (Bluesky obrázek, WhatsApp)
//   ig       1080×1350 – Instagram feed 4:5; mřížka profilu ořízne na 3:4 → nic důležitého v horních/dolních 80 px
//   story    1080×1920 – Instagram stories 9:16; horních 250 a dolních 340 px překrývá rozhraní aplikace
// node _cover_pipeline/cover.cjs   (PW_PATH = cesta k balíčku playwright, nainstalovaný Microsoft Edge)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const DIR = path.join(__dirname, '..');
const ZDROJ = path.join(DIR, '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');  // mapové podklady sdílené s původním článkem
const mapa = JSON.parse(fs.readFileSync(path.join(ZDROJ, 'senat-mapa.json'), 'utf8'));
const obce = JSON.parse(fs.readFileSync(path.join(ZDROJ, 'obce-mapa.json'), 'utf8'));
const vol = new Set(mapa.vol);
const donut = fs.readFileSync(path.join(DIR, '..', '..', '..', '..', 'public', 'images', 'datatimes-donut.svg'), 'utf8');

const KICKER = 'Komunální a senátní volby 2026';
const TITULEK = 'Volby 2026 –<br>výsledky predikce';
const PODTITUL = 'Jak brzy jsme věděli, jak to dopadne';

// box = bezpečná zóna [x0, y0, x1, y1], mapa = kam se kreslí mapa (smí přesahovat zónu, ořez okraje mapy nevadí), t/sub/kick/logo = velikosti písma, stred = text na střed (OG)
const FORMATY = [
  { soubor: 'cover-homepage.png', w: 1500, h: 1200, box: [180, 120, 1320, 1080], mapa: [150, 550, 1350, 985], t: 104, sub: 40, kick: 30, logo: 46 },
  { soubor: 'cover-og.png', w: 1200, h: 630, box: [285, 40, 915, 590], mapa: [0, 0, 1200, 630], t: 64, sub: 28, kick: 22, logo: 30, stred: true },
  { soubor: 'cover-square.png', w: 1080, h: 1080, box: [70, 70, 1010, 1010], mapa: [70, 520, 1010, 930], t: 96, sub: 36, kick: 28, logo: 42 },
  { soubor: 'cover-instagram.png', w: 1080, h: 1350, box: [70, 110, 1010, 1240], mapa: [70, 620, 1010, 1120], t: 100, sub: 38, kick: 28, logo: 42 },
  { soubor: 'cover-story.png', w: 1080, h: 1920, box: [80, 260, 1000, 1570], mapa: [0, 900, 1080, 1500], t: 112, sub: 42, kick: 30, logo: 46 },
];

function html(f) {
  const { w, h } = f;
  const [bx0, by0, bx1, by1] = f.box;
  const [mx0, my0, mx1, my1] = f.mapa;
  const lon = mapa.dots.map((d) => d[0]), lat = mapa.dots.map((d) => d[1]);
  const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
  const kx = Math.cos((49.8 * Math.PI) / 180);
  const sc = Math.min((mx1 - mx0) / ((x1 - x0) * kx), (my1 - my0) / (y1 - y0));
  const ox = mx0 + (mx1 - mx0 - (x1 - x0) * kx * sc) / 2, oy = my0 + (my1 - my0 - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(1.6, sc * 0.018);
  const tlum = f.stred ? 0.35 : 1;  // u OG je mapa jen pozadí za textem
  const tecky = mapa.dots.map(([lo, la, o]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${vol.has(o) ? '#4fd6b4' : '#2f325c'}" opacity="${tlum}"/>`; }).join('');
  const mesta = obce.map((o) => { const [x, y] = P(o.lon, o.lat); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 2.3).toFixed(1)}" fill="#ffcf02" stroke="#101432" stroke-width="${(r * 0.7).toFixed(1)}" opacity="${tlum}"/>`; }).join('');
  const logoPravy = Math.max(Math.round(w * 0.032), w - bx1);  // pravý okraj loga: aspoň 3,2 % šířky, uvnitř bezpečné zóny
  const text = f.stred
    ? `<div class="blok" style="left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px;height:${by1 - by0}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:${f.t * 0.25}px">
         <div class="kick">${KICKER}</div>
         <h1>${TITULEK}</h1>
         <div class="sub">${PODTITUL}</div>
         <div class="stitek">VÝSLEDKY</div>
         <div class="logo" style="position:static;margin-top:${f.t * 0.15}px">${donut}<span>DataTimes.cz</span></div>
       </div>`
    : `<div class="blok" style="left:${bx0}px;top:${by0}px;width:${bx1 - bx0}px">
         <div class="kick">${KICKER}<span class="stitek">VÝSLEDKY</span></div>
         <h1 style="margin-top:${f.t * 0.3}px">${TITULEK}</h1>
         <div class="sub" style="margin-top:${f.t * 0.3}px">${PODTITUL}</div>
       </div>
       <div class="leg" style="left:${bx0}px;bottom:${h - by1}px"><div><i style="background:#ffcf02"></i>140 měst</div><div><i style="background:#4fd6b4"></i>27 senátních obvodů</div></div>
       <div class="logo" style="right:${logoPravy}px;bottom:${h - by1}px">${donut}<span>DataTimes.cz</span></div>`;
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@600;700&family=IBM+Plex+Sans:wght@500;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;color:#fff}
  body{background:radial-gradient(ellipse at 0% 20%,#0b6b4e 0%,rgba(11,107,78,0) 55%),radial-gradient(ellipse at 100% 100%,#06677d 0%,rgba(6,103,125,0) 55%),#101432}
  svg.mapa{position:absolute;left:0;top:0}
  .blok{position:absolute}
  .kick{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:${f.kick}px;color:#c2f0e4;display:flex;align-items:center;gap:${f.kick * 0.6}px;flex-wrap:wrap;justify-content:${f.stred ? 'center' : 'flex-start'}}
  .stitek{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;letter-spacing:.08em;font-size:${f.kick}px;padding:${f.kick * 0.25}px ${f.kick * 0.6}px;border-radius:${f.kick}px;background:linear-gradient(90deg,#1a9fbd,#12b886);color:#fff}
  h1{margin:0;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.t}px;line-height:1.06}
  .sub{font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:${f.sub}px;line-height:1.3;color:#9be8d4}
  .leg{position:absolute;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:${f.kick * 0.9}px;line-height:1.6}
  .leg i{display:inline-block;width:${f.kick * 0.6}px;height:${f.kick * 0.6}px;border-radius:50%;margin-right:${f.kick * 0.4}px}
  .logo{position:absolute;display:flex;align-items:center;gap:${f.logo * 0.3}px;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:${f.logo}px;text-shadow:0 1px 6px rgba(0,0,0,.4)}
  .logo svg{width:${f.logo * 1.5}px;height:${f.logo * 1.5}px}
</style></head><body>
<svg class="mapa" width="${w}" height="${h}">${tecky}${mesta}</svg>
${text}
</body></html>`;
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const f of FORMATY) {
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(f), { waitUntil: 'networkidle' });
    // OG jako JPEG (cíl 150–500 kB podle tools/COVER-EDITOR.md), ostatní PNG
    const jpg = f.soubor === 'cover-og.png';
    await page.screenshot(jpg ? { path: path.join(DIR, 'images', 'cover-og.jpg'), type: 'jpeg', quality: 90 } : { path: path.join(DIR, 'images', f.soubor) });
    await page.close();
    console.log(f.soubor, `${f.w}×${f.h}`);
  }
  await browser.close();
})();

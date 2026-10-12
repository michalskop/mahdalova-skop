// Cover článku „Volby 2026 – výsledky predikce“ ve třech formátech (pravidlo: vždy čtverec, ležatý, vysoký pro Instagram).
// Podkladová mapa jako u coveru predikce (tečky ČR, senátní obvody, 140 měst), barevnost zeleno-tyrkysová, štítek VÝSLEDKY.
// node _cover_pipeline/cover.cjs   (PW_PATH = cesta k balíčku playwright, nainstalovaný Microsoft Edge)
// → images/cover.png (čtverec 1200×1200), images/cover-og.png (ležatý 1200×630), images/cover-ig.png (Instagram 1080×1350)
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const DIR = path.join(__dirname, '..');
const ZDROJ = path.join(DIR, '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');  // mapové podklady sdílené s původním článkem
const mapa = JSON.parse(fs.readFileSync(path.join(ZDROJ, 'senat-mapa.json'), 'utf8'));
const obce = JSON.parse(fs.readFileSync(path.join(ZDROJ, 'obce-mapa.json'), 'utf8'));
const vol = new Set(mapa.vol);
const donut = fs.readFileSync(path.join(DIR, '..', '..', '..', '..', 'public', 'images', 'datatimes-donut.svg'), 'utf8');

const FORMATY = [
  { soubor: 'cover.png', w: 1200, h: 1200 },
  { soubor: 'cover-og.png', w: 1200, h: 630 },
  { soubor: 'cover-ig.png', w: 1080, h: 1350 },
];

function html({ w, h }) {
  const lezaty = w / h > 1.4;
  // mapa: vpravo (ležatý) nebo dole (čtverec, vysoký)
  const box = lezaty ? { x: w * 0.47, y: h * 0.2, w: w * 0.5, h: h * 0.62 } : { x: w * 0.06, y: h * (h > w ? 0.43 : 0.44), w: w * 0.88, h: h * (h > w ? 0.42 : 0.41) };
  const lon = mapa.dots.map((d) => d[0]), lat = mapa.dots.map((d) => d[1]);
  const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
  const kx = Math.cos((49.8 * Math.PI) / 180);
  const sc = Math.min(box.w / ((x1 - x0) * kx), box.h / (y1 - y0));
  const ox = box.x + (box.w - (x1 - x0) * kx * sc) / 2, oy = box.y + (box.h - (y1 - y0) * sc) / 2;
  const P = (lo, la) => [ox + (lo - x0) * kx * sc, oy + (y1 - la) * sc];
  const r = Math.max(2, sc * 0.018);
  const tecky = mapa.dots.map(([lo, la, o]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${vol.has(o) ? '#2fd39a' : '#2c4a5c'}"/>`; }).join('');
  const mesta = obce.map((o) => { const [x, y] = P(o.lon, o.lat); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 2.3).toFixed(1)}" fill="#ffd23f" stroke="#0b1f2a" stroke-width="${(r * 0.7).toFixed(1)}"/>`; }).join('');
  const u = w / 1200;  // měřítko písma
  const tit = lezaty ? 62 * u : 104 * u;
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:'IBM Plex Sans',Arial,sans-serif;color:#fff}
  body{background:radial-gradient(ellipse at 0% 25%,#0f6b5c 0%,rgba(15,107,92,0) 55%),radial-gradient(ellipse at 100% 100%,#0e5d73 0%,rgba(14,93,115,0) 55%),#0b1f2a}
  .tag{position:absolute;left:${70 * u}px;top:${60 * u}px;background:#06141b;border-radius:${6 * u}px;padding:${10 * u}px ${18 * u}px;font-weight:700;font-size:${28 * u}px}
  h1{position:absolute;left:${70 * u}px;top:${130 * u}px;margin:0;font-size:${tit}px;line-height:1.05;font-weight:700;width:${lezaty ? 560 * u : 900 * u}px}
  .sub{position:absolute;left:${70 * u}px;top:${lezaty ? 300 * u : 400 * u}px;font-size:${(lezaty ? 30 : 38) * u}px;line-height:1.3;color:#9ff0d3;font-weight:500;width:${lezaty ? 520 * u : 1000 * u}px}
  .badge{position:absolute;right:${60 * u}px;top:${56 * u}px;padding:${12 * u}px ${26 * u}px;border-radius:${40 * u}px;background:linear-gradient(90deg,#14b8a6,#22c55e);font-weight:700;letter-spacing:.06em;font-size:${(lezaty ? 30 : 38) * u}px;box-shadow:0 ${6 * u}px ${20 * u}px rgba(0,0,0,.35)}
  .leg{position:absolute;left:${70 * u}px;bottom:${50 * u}px;font-size:${(lezaty ? 22 : 28) * u}px;line-height:1.7;font-weight:500}
  .leg i{display:inline-block;width:${18 * u}px;height:${18 * u}px;border-radius:50%;margin-right:${12 * u}px;vertical-align:-${2 * u}px}
  .logo{position:absolute;right:${60 * u}px;bottom:${46 * u}px;display:flex;align-items:center;gap:${14 * u}px;font-weight:700;font-size:${(lezaty ? 34 : 40) * u}px}
  .logo svg{width:${(lezaty ? 56 : 68) * u}px;height:${(lezaty ? 56 : 68) * u}px}
  svg.mapa{position:absolute;left:0;top:0}
</style></head><body>
<svg class="mapa" width="${w}" height="${h}">${tecky}${mesta}</svg>
<div class="tag">Komunální a senátní volby 2026</div>
<h1>Volby 2026 –<br>výsledky predikce</h1>
<div class="sub">Jak brzy jsme věděli, jak to dopadne:<br>140 měst a 27 senátních obvodů</div>
<div class="badge">VÝSLEDKY</div>
${lezaty ? '' : `<div class="leg"><div><i style="background:#ffd23f"></i>140 měst – komunální volby</div><div><i style="background:#2fd39a"></i>27 senátních obvodů</div></div>`}
<div class="logo">${donut.replace('<svg', '<svg aria-hidden="true"')}<span>DataTimes.cz</span></div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const f of FORMATY) {
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(f), { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(DIR, 'images', f.soubor) });
    await page.close();
    console.log(f.soubor, `${f.w}×${f.h}`);
  }
  await browser.close();
})();

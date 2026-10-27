// Galerie dlaždic do článku: jedna tečková mapa ČR za každou stranu, 1080×1080, jednobarevné ink blue.
// Data: dlazdice.json (python dlazdice.py). Tečková mapa: senat-mapa.json z článku o predikci.
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/dlazdice.cjs  → images/mapa-<strana>.png
// Snímky pro animovaný GIF (sítě): … dlazdice.cjs gif spd ano ksc  → ../_social/<strana>-2022.png, -2026.png
//   2022 = obce, kde strana měla zastupitele; 2026 = má (plná tečka) / přišla o všechny (kroužek)
// Písma podle pravidel coverů: název strany IBM Plex Serif Bold, ostatní IBM Plex Sans.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const ZDROJ = path.join(__dirname, '..', '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce');
const mapa = require(path.join(ZDROJ, 'senat-mapa.json'));
const data = require('./dlazdice.json');
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const OUT = path.join(__dirname, '..', 'images');

// barvy stran z predikce / mapy v článku (závazná paleta)
const BARVA = { ods: '#697fe6', kdu: '#ffcf02', top: '#d85a74', stan: '#ff1a4a', pir: '#f8f6f0', zel: '#8dd265' };
// pozn.: na tmavém pozadí bereme světlejší odstín téže škály (ODS brandRoyalBlue.4, KDU-ČSL brandYellow.6,
// TOP 09 brandDeepRed.4, STAN brand.4, Zelení brandForestGreen.3), aby tečky vystoupily; Piráti (v článku
// černá #111111) na tmavém pozadí světlou background.2
const NAVY = '#101432', TECKA = '#2f325c', SUB = '#d2d8e9';
// formáty: čtverec (galerie, X, Bluesky, FB), Instagram 4:5 (nic důležitého v horních/dolních 80 px)
// a stories 9:16 (horních 250 a dolních 340 px překrývá rozhraní) – zóny podle tools/COVER-EDITOR.md
const FORMATY = {
  ctverec: { W: 1080, H: 1080, mapa: [50, 330, 1030, 1000], top: 62, logo: 52 },
  ig: { W: 1080, H: 1350, mapa: [40, 400, 1040, 1180], top: 110, logo: 110 },
  story: { W: 1080, H: 1920, mapa: [30, 640, 1050, 1500], top: 290, logo: 380 },
};

const nf = (n) => n.toLocaleString('cs-CZ').replace(/\s/g, ' ');
const obci = (n) => `${nf(n)} ${n === 1 ? 'obec' : n >= 2 && n <= 4 ? 'obce' : 'obcí'}`;

// projekce: rovnoběžky zkrácené kosinem 49,8° a vměstnané do mapové plochy formátu se zachováním poměru
const K = Math.cos(49.8 * Math.PI / 180);
const lons = mapa.dots.map((d) => d[0] * K), lats = mapa.dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
function projekce([a, b, c, e]) {
  const s = Math.min((c - a) / (x1 - x0), (e - b) / (y1 - y0));
  const ox = a + ((c - a) - (x1 - x0) * s) / 2, oy = b + ((e - b) - (y1 - y0) * s) / 2;
  return (lon, lat) => [ox + (lon * K - x0) * s, oy + (y1 - lat) * s];
}

function html(key, mode = 'dlazdice', f = FORMATY.ctverec) {
  const { W, H, top } = f, P = projekce(f.mapa);
  const d0 = data[key], c = BARVA[key];
  // GIF: snímek 2022 = jen obce se zastupiteli 2022, plné; snímek 2026 = bez míst, kde strana jen neuspěla
  const d = mode === '2022'
    ? { ...d0, body: d0.body.filter((b) => b[3]).map((b) => [b[0], b[1], 1, 1]) }
    : mode === '2026' ? { ...d0, body: d0.body.filter((b) => b[2] || b[3]) } : d0;
  const pocet = (st) => d.body.filter((b) => b[2] === st).length;
  const podklad = mapa.dots.map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${TECKA}"/>`; }).join('');
  // kroužky dospod, plné tečky navrch; obojí s tenkým bílým obrysem, aby vystoupily i tmavší barvy
  const krouzky = d.body.filter((b) => !b[2]).map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.3" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${NAVY}" stroke="${c}" stroke-width="3.6"/>`; }).join('');
  const plne = d.body.filter((b) => b[2]).map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${c}" stroke="#fff" stroke-width="1.6"/>`; }).join('');
  const zmena = mode === '2022' ? `Volby 2022: ${nf(d.m22)} zastupitelů`
    : mode === '2026' ? `Volby 2026: ${nf(d.m26)} zastupitelů`
    : d.nova ? `${nf(d.m26)} ${d.m26 >= 5 ? 'zastupitelů' : 'zastupitelé'} z ${nf(d.k26)} kandidátů` : `${nf(d.m22)} → ${nf(d.m26)} zastupitelů`;
  const legPlne = mode === 'dlazdice' ? d.plne : pocet(1), legPrazdne = mode === 'dlazdice' ? d.prazdne : pocet(0);
  const krouzekText = d.nova ? 'kandidovali, nikdo neprošel' : 'přišli o všechny';
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${NAVY};color:#fff}
.t{position:absolute;left:70px;top:${top}px;font:700 92px/1 'IBM Plex Serif',Georgia,serif;color:${c}}
.z{position:absolute;left:70px;top:${top + 110}px;font:600 44px/1.1 'IBM Plex Sans',Arial,sans-serif}
.l{position:absolute;left:70px;top:${top + 178}px;font:500 28px/1.3 'IBM Plex Sans',Arial,sans-serif;color:${SUB};display:flex;gap:34px}
.l span{display:inline-flex;align-items:center;gap:10px}
.logo{position:absolute;left:70px;bottom:${f.logo}px;display:flex;align-items:center;gap:12px;font:700 34px/1 'IBM Plex Serif',Georgia,serif}
.logo svg{width:46px;height:46px}
svg.m{position:absolute;left:0;top:0}
</style></head><body>
<svg class="m" width="${W}" height="${H}">${podklad}${krouzky}${plne}</svg>
<div class="t">${d.nazev}</div>
<div class="z">${zmena}</div>
<div class="l">
  <span><svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="${c}" stroke="#fff" stroke-width="1.5"/></svg>mají zastupitele: ${obci(legPlne)}</span>
  ${mode === '2022' ? '' : `<span><svg width="22" height="22"><circle cx="11" cy="11" r="7" fill="none" stroke="${c}" stroke-width="3.6"/></svg>${krouzekText}: ${obci(legPrazdne)}</span>`}
</div>
<div class="logo">${DONUT.replace('<svg ', '<svg width="46" height="46" ')}<span>DataTimes.cz</span></div>
</body></html>`;
}

// CLI: bez argumentů dlaždice do článku; „gif spd …“ snímky 2022/2026; „social spd …“ verze na sítě
const SOCIAL = path.join(__dirname, '..', '_social');
const [rezim, ...strany] = process.argv.slice(2);
const ulohy = rezim === 'gif'
  ? strany.flatMap((k) => ['2022', '2026'].map((m) => [k, m, FORMATY.ctverec, path.join(SOCIAL, `${k}-${m}.png`)]))
  : rezim === 'social'
    ? strany.flatMap((k) => [['ig', 'ig'], ['story', 'story']].map(([fk, n]) => [k, 'dlazdice', FORMATY[fk], path.join(SOCIAL, `${k}-${n}.png`)]))
    : Object.keys(data).map((k) => [k, 'dlazdice', FORMATY.ctverec, path.join(OUT, `mapa-${k}.png`)]);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const [key, mode, f, out] of ulohy) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const page = await browser.newPage({ viewport: { width: f.W, height: f.H } });
    await page.setContent(html(key, mode, f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out });
    await page.close();
    console.log(path.relative(REPO, out), `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();

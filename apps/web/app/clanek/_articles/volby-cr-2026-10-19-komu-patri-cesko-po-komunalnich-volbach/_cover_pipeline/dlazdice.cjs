// Dlaždice na sítě z mapy síly stran (images/mapa-stran.html): jedna strana = jedna tečková mapa ČR,
// puntík = obec, kde strana kandidovala, plocha ∝ kolik voličů tam zastupují její zastupitelé,
// prázdný kroužek = kandidovala, křeslo nezískala. Stejná data i měřítko plochy jako mapa v článku.
// Data: ../_data_pipeline/mapa_data.json (build.py), poloha obcí body.json (body.py), podklad senat-mapa.json.
// Čísla v textech dlaždic odpovídají ../_data_pipeline/vystup.txt (podíl voličů 2022 → 2026, podíl mandátů).
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/dlazdice.cjs  → ../_social/<strana>-{ig,story,ctverec}.png
// Písma podle tools/COVER-EDITOR.md: název strany IBM Plex Serif Bold, ostatní IBM Plex Sans.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const ART = path.join(__dirname, '..');
const REPO = path.join(ART, '..', '..', '..', '..', '..', '..');
const mapa = require(path.join(ART, '..', 'volby-cr-2026-10-10-senat-komunalni-2026-predikce', 'senat-mapa.json'));
const D = require(path.join(ART, '_data_pipeline', 'mapa_data.json'));
const poloha = Object.fromEntries(require('./body.json').map((b) => [b.kod, [b.lon, b.lat]]));
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const OUT = path.join(ART, '_social');

// Na tmavém pozadí série dlaždic (SPD/ANO 14. 10., ODS/STAN 16. 10.) bereme odstíny, které na ink blue vystoupí:
// nezávislí brandNavy.4 jako na coveru, ANO brandRoyalBlue.5 a SPD brandYellow.6 jako v dlaždicích 14. 10.,
// STAN brand.4 jako v dlaždicích 16. 10. (v mapě článku jsou ANO #272a59 a SPD #a47d03, na tmavém by zanikly)
const NAVY = '#101432', TECKA = '#2f325c', SUB = '#d2d8e9';
const nb = (s) => s.replace(/(^|\s)([vkszouaiVKSZOUAI])\s/g, '$1$2 ').replace(/(\d) (?=\d{3}\b)/g, '$1 ').replace(/ %/g, ' %');
const STRANY = {
  nez: { klic: 'nezávislí', nazev: 'Nezávislí', barva: '#8f9dc9',
    radek: 'zastupují 36,4 % voličů', pod: 'a mají 77,5 % křesel' },
  ano: { klic: 'ANO', nazev: 'ANO', barva: '#5e66d5',
    radek: 'zastupuje 12,8 % voličů', pod: 'v roce 2022 to bylo 15,2 %' },
  stan: { klic: 'STAN', nazev: 'STAN', barva: '#ff1a4a',
    radek: 'zastupuje 10,2 % voličů', pod: 'v roce 2022 to bylo 6,7 %' },
  spd: { klic: 'SPD', nazev: 'SPD', barva: '#ffcf02',
    radek: 'zastupuje 1,0 % voličů', pod: 'v roce 2022 to bylo 3,9 %' },
  // Zelení: brandForestGreen #8dd265 (světlejší odstín než #639e0a v mapě článku, ten by na ink blue zanikl)
  zel: { klic: 'Zelení', nazev: 'Zelení', barva: '#8dd265',
    radek: 'zastupují 1,0 % voličů', pod: 'v roce 2022 to bylo 0,9 %' },
};
// formáty a bezpečné zóny podle tools/COVER-EDITOR.md: IG 4:5 nic důležitého v horních/dolních 80 px,
// stories horních 250 a dolních 340 px překrývá rozhraní; mapa = [x0, y0, x1, y1] plochy pro republiku
const FORMATY = {
  ctverec: { W: 1080, H: 1080, mapa: [60, 405, 1020, 975], top: 58, logo: 50 },
  ig: { W: 1080, H: 1350, mapa: [40, 420, 1040, 1150], top: 110, logo: 110 },
  // story: mapa hned pod legendou, logo pod mapou a pod ním volné místo na samolepku Odkaz (nad spodními 340 px)
  story: { W: 1080, H: 1920, mapa: [30, 680, 1050, 1280], top: 290, logo: 500 },
};

// projekce jako v mapě článku: rovnoběžky zkrácené kosinem 49,8°, vměstnané do plochy se zachováním poměru
const K = Math.cos(49.8 * Math.PI / 180);
const lons = mapa.dots.map((d) => d[0] * K), lats = mapa.dots.map((d) => d[1]);
const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
function projekce([a, b, c, e]) {
  const s = Math.min((c - a) / (x1 - x0), (e - b) / (y1 - y0));
  const ox = a + ((c - a) - (x1 - x0) * s) / 2, oy = b + ((e - b) - (y1 - y0) * s) / 2;
  return { s, P: (lon, lat) => [ox + (lon * K - x0) * s, oy + (y1 - lat) * s] };
}
// plocha puntíku ∝ voliči; v článku 100 000 voličů = poloměr 16 px při šířce republiky 876 px.
// Na mobilu je dlaždice zmenšená asi na třetinu, proto měřítko 1,5× větší (legenda ho ukazuje).
const ZVETSENI = 1.5;

function html(key, f) {
  const { W, H, top } = f, st = STRANY[key], c = st.barva;
  const { s, P } = projekce(f.mapa);
  const R100 = 16 * ((x1 - x0) * s / 876) * ZVETSENI;
  const rad = (v) => Math.max(1.8, Math.sqrt(v / 100000) * R100);
  const podklad = mapa.dots.map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${TECKA}"/>`; }).join('');
  const body = [];
  for (const [kod, o] of Object.entries(D.obce)) {
    const z = o.s[st.klic], p = poloha[kod];
    if (z && p) body.push([P(...p), z[0], z[1]]);
  }
  const krouzky = body.filter((b) => !b[1]).map(([[x, y]]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="none" stroke="${c}" stroke-width="1.8" opacity=".9"/>`).join('');
  const plne = body.filter((b) => b[1]).sort((a, b) => b[2] - a[2]) // velké dospod, malé navrch
    .map(([[x, y], , v]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad(v).toFixed(2)}" fill="${c}" fill-opacity=".88" stroke="#fff" stroke-opacity=".75" stroke-width="${rad(v) > 4 ? 1.4 : 0.6}"/>`).join('');
  const vel = [1000, 10000, 100000].map((v) => {
    const r = rad(v), d = Math.ceil(2 * r + 4);
    return `<span><svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="${c}" fill-opacity=".88" stroke="#fff" stroke-opacity=".75" stroke-width="1.2"/></svg>${nb(v.toLocaleString('cs-CZ'))}</span>`;
  }).join('');
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${NAVY};color:#fff}
.t{position:absolute;left:70px;top:${top}px;font:700 92px/1 'IBM Plex Serif',Georgia,serif;color:${c}}
.z{position:absolute;left:70px;top:${top + 112}px;font:600 46px/1.1 'IBM Plex Sans',Arial,sans-serif}
.p{position:absolute;left:70px;top:${top + 172}px;font:500 34px/1.2 'IBM Plex Sans',Arial,sans-serif;color:${SUB}}
.l{position:absolute;left:70px;right:60px;top:${top + 232}px;font:500 24px/1.3 'IBM Plex Sans',Arial,sans-serif;color:${SUB};display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px}
.l span{display:inline-flex;align-items:center;gap:7px}
.logo{position:absolute;left:70px;bottom:${f.logo}px;display:flex;align-items:center;gap:12px;font:700 34px/1 'IBM Plex Serif',Georgia,serif}
.logo svg{width:46px;height:46px}
.zdroj{position:absolute;right:60px;bottom:${f.logo + 8}px;font:500 20px/1.2 'IBM Plex Sans',Arial,sans-serif;color:#8f9dc9;text-align:right}
svg.m{position:absolute;left:0;top:0}
</style></head><body>
<svg class="m" width="${W}" height="${H}">${podklad}${krouzky}${plne}</svg>
<div class="t">${st.nazev}</div>
<div class="z">${nb(st.radek)}</div>
<div class="p">${nb(st.pod)}</div>
<div class="l"><span>${nb('kolik voličů v obci zastupují:')}</span>${vel}<span><svg width="20" height="20"><circle cx="10" cy="10" r="6" fill="none" stroke="${c}" stroke-width="2.4"/></svg>${nb('kandidátka bez křesla')}</span></div>
<div class="logo">${DONUT.replace('<svg ', '<svg width="46" height="46" ')}<span>DataTimes.cz</span></div>
<div class="zdroj">${nb('Komunální volby 2026')}<br>${nb('data volby.gov.cz')}</div>
</body></html>`;
}

const strany = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(STRANY);
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const key of strany) for (const [fk, f] of Object.entries(FORMATY)) {
    const out = path.join(OUT, `${key}-${fk}.png`);
    fs.mkdirSync(OUT, { recursive: true });
    const page = await browser.newPage({ viewport: { width: f.W, height: f.H } });
    await page.setContent(html(key, f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out });
    await page.close();
    console.log(path.relative(REPO, out), `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();

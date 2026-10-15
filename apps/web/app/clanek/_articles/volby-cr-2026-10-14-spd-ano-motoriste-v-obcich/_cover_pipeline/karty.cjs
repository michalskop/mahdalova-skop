// Bonusové karty na sítě ve stylu coveru: štítek, titulek (IBM Plex Serif), graf nebo tabulka z článku
// na světlém panelu, zdroj a logo DataTimes.cz. Tři formáty: Instagram 4:5, čtverec, široký (X, Bluesky, FB).
// Těla grafů vyfotí grafy-telo.cjs, tabulka měst se čte z _data_pipeline/zastupitelstva.csv (build.py).
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/karty.cjs  → ../_social/karta-<id>-<formát>.png
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const SOC = path.join(__dirname, '..', '_social');
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SOC, f)).toString('base64')}`;
const ZDROJ = 'Data: volby.gov.cz, registry kandidátů a mandátů 2022 a 2026 · výpočet DataTimes.cz';

// barvy jen ze závazné palety: brandNavy.9 pozadí, brandYellow.8 / brandTeal.7 záře (jako cover), brand.6 štítek
const NAVY = '#101432', GLOW_A = '#bd9103', GLOW_B = '#06677d', RED = '#de1743', SUB = '#d2d8e9', PAPER = '#f8f6f0';

// ── tabulka krajských měst z výstupu datového skriptu ──
const csv = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'zastupitelstva.csv'), 'utf8').trim().split(/\r?\n/);
const hlav = csv[0].split(',');
const radky = csv.slice(1).map((l) => Object.fromEntries(l.split(',').map((v, i) => [hlav[i], v])));
const MESTA = [['Praha hl.m.', 'Praha'], ['Brno'], ['Ostrava'], ['Plzeň'], ['Liberec'], ['Olomouc'], ['České Budějovice'],
  ['Hradec Králové'], ['Pardubice'], ['Ústí nad Labem'], ['Zlín'], ['Karlovy Vary'], ['Jihlava']];
const mesta = MESTA.map(([n, zobraz]) => {
  const r = radky.find((x) => x.nazev === n && x.typ === '1');
  return { n: zobraz ?? n, spd: [r.spd_m22, r.spd_m26], ano: [r.ano_m22, r.ano_m26], aut: [r.aut_k26, r.aut_m26] };
});
const sipka = (a, b) => `${a} → <b>${b}</b>`;
const tabulka = (fs) => `<table style="font-size:${fs}px">
  <tr><th></th><th><i style="background:#a47d03"></i>SPD<br><span>před → po</span></th><th><i style="background:#272a59"></i>ANO<br><span>před → po</span></th><th><i style="background:#1a9fbd"></i>Motoristé<br><span>kandidáti → zvolení</span></th></tr>
  ${mesta.map((m) => `<tr><td>${m.n}</td><td class="${m.spd[1] === '0' ? 'nula' : ''}">${sipka(...m.spd)}</td><td>${sipka(...m.ano)}</td><td>${m.aut[0] === '0' ? '–' : sipka(...m.aut)}</td></tr>`).join('')}
</table>`;

const KARTY = [
  { id: 'uspesnost', titulek: 'V roce 2022 prošel do zastupitelstva každý desátý kandidát SPD, letos každý pětadvacátý',
    pod: 'Podíl zvolených z kandidátů, které strana navrhla (%), komunální volby 2022 a 2026', obsah: (f) => `<img src="${img(f.uzky ? 'telo-uspesnost-uzky.png' : 'telo-uspesnost.png')}">` },
  { id: 'velikost', titulek: 'ANO ztrácí ve městech, v menších obcích přibírá. SPD ubývá všude',
    pod: 'Změna počtu zastupitelů 2022 → 2026 podle velikosti obce (počet obyvatel)', obsah: (f) => `<img src="${img(f.uzky ? 'telo-velikost-uzky.png' : 'telo-velikost.png')}">` },
  { id: 'mesta', titulek: 'SPD zmizela ze zastupitelstev Prahy a šesti krajských měst',
    pod: 'Zastupitelé v zastupitelstvech krajských měst před volbami a po nich, podle navrhující strany', obsah: (f) => tabulka(f.tab) },
];

// formáty: rozměry, velikosti písma a rozvržení (široký = text vlevo, panel vpravo)
const FORMATY = {
  ig: { W: 1080, H: 1350, t: 60, sub: 28, kick: 22, tab: 27, logo: 40, pad: 70 },
  ctverec: { W: 1080, H: 1080, t: 50, sub: 25, kick: 20, tab: 21, logo: 36, pad: 60 },
  siroky: { W: 1200, H: 675, t: 38, sub: 20, kick: 16, tab: 17, logo: 30, pad: 44, vedle: true, uzky: true },
};

function html(k, f) {
  const kicker = `<div class="kick"><span class="cerv">Analýza</span><span class="sep">•</span><span>Komunální volby 2026</span></div>`;
  const text = `${kicker}<h1>${k.titulek}</h1><div class="sub">${k.pod}</div>`;
  const pata = `<div class="pata"><div class="logo">${DONUT.replace('<svg ', `<svg width="${f.logo * 1.15}" height="${f.logo * 1.15}" `)}<span>DataTimes.cz</span></div><div class="zdroj">${ZDROJ}</div></div>`;
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
html,body{margin:0;width:${f.W}px;height:${f.H}px;overflow:hidden;color:#fff;font-family:'IBM Plex Sans',Arial,sans-serif}
body{background:radial-gradient(ellipse at 0% 15%,${GLOW_A} 0%,${GLOW_A}00 55%),radial-gradient(ellipse at 100% 100%,${GLOW_B} 0%,${GLOW_B}00 55%),${NAVY};
  padding:${f.pad}px;display:flex;${f.vedle ? 'flex-direction:row;gap:36px' : 'flex-direction:column'}}
.text{${f.vedle ? 'flex:0 0 34%;display:flex;flex-direction:column' : ''}}
.kick{font-weight:600;font-size:${f.kick}px;letter-spacing:.16em;text-transform:uppercase;display:flex;gap:.6em;align-items:baseline}
.cerv{color:${RED};text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:8px}
.sep{color:${RED}}
h1{font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:${f.t}px;line-height:1.12;margin:${f.t * 0.45}px 0 ${f.t * 0.25}px;text-shadow:0 2px 18px rgba(16,20,50,.45)}
.sub{font-size:${f.sub}px;line-height:1.3;color:${SUB};margin-bottom:${f.vedle ? 0 : f.t * 0.5}px}
.panel{flex:1 1 auto;min-height:0;background:${PAPER};border-radius:14px;padding:${f.pad * 0.4}px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.panel img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.pata{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;${f.vedle ? 'margin-top:auto' : `margin-top:${f.pad * 0.5}px`}}
.logo{display:flex;align-items:center;gap:${f.logo * 0.3}px;font:700 ${f.logo}px/1 'IBM Plex Serif',Georgia,serif;white-space:nowrap}
.zdroj{font-size:${Math.round(f.sub * 0.62)}px;color:${SUB};text-align:right;max-width:${f.vedle ? 100 : 55}%;line-height:1.3}
${f.vedle ? '.pata{flex-direction:column;align-items:flex-start;gap:10px}.zdroj{text-align:left}' : ''}
table{border-collapse:collapse;color:${NAVY};width:100%}
th{text-align:left;font-weight:700;padding:0 .5em .45em;border-bottom:2px solid ${NAVY};vertical-align:bottom;line-height:1.25;white-space:nowrap}
th span{font-weight:500;color:#4c4f8e;font-size:.8em}
th i{display:inline-block;width:.6em;height:.6em;border-radius:2px;margin-right:.35em}
td{padding:.22em .5em;border-bottom:1px solid #e9e9dd;white-space:nowrap}
td:first-child{font-weight:600;padding-left:0}
td.nula b{color:${RED}}
</style></head><body>
${f.vedle ? `<div class="text">${text}${pata}</div><div class="panel">${k.obsah(f)}</div>` : `<div class="text">${text}</div><div class="panel">${k.obsah(f)}</div>${pata}`}
</body></html>`;
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const k of KARTY) {
    for (const [fk, f] of Object.entries(FORMATY)) {
      const page = await browser.newPage({ viewport: { width: f.W, height: f.H } });
      await page.setContent(html(k, f), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // kontrola, že se nic nevešlo mimo plochu
      const pretece = await page.evaluate(() => document.body.scrollHeight > window.innerHeight + 1 || document.body.scrollWidth > window.innerWidth + 1);
      const out = path.join(SOC, `karta-${k.id}-${fk}.png`);
      await page.screenshot({ path: out });
      await page.close();
      console.log(path.basename(out), `${Math.round(fs.statSync(out).size / 1024)} kB`, pretece ? '!!! PŘETÉKÁ' : '');
    }
  }
  await browser.close();
})();

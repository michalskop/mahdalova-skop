// Karusel pro Instagram (4:5, 1080×1350) – stejný vizuální jazyk jako covery (navy, IBM Plex, paleta DataTimes).
// Čísla v pruzích bere z grafů článku (../data/*.json), texty odpovídají textu článku.
// Spuštění: PW_PATH=<repo>/node_modules/playwright node karusel.cjs  → ../social/ig-karusel/0X-*.png
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..', '..', '..', '..', '..', '..');
const OUT = path.join(ROOT, 'social', 'ig-karusel');
fs.mkdirSync(OUT, { recursive: true });
const DONUT = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'datatimes-donut.svg'), 'utf8');
const bonus = require(path.join(ROOT, 'data', 'bonus-profese.json')).data.values;
const skok = require(path.join(ROOT, 'data', 'preskoceni-profese.json')).data.values;

const NAVY = '#101432';
const VIC = '#5fcce6';   // brandTeal.3 – víc (na tmavém pozadí)
const MENE = '#e87c91';  // brandDeepRed.3 – méně (na tmavém pozadí)
const SUB = '#b8eff6';   // brandTeal.1
const fmt = (v, d = 0) => v.toFixed(d).replace('.', ',');
const pct = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)) + ' %';

function pruhy(rows, pole, popisek, nula) {
  // vodorovné pruhy od nuly (hlasy navíc) nebo od 1× (násobek, logaritmicky); nula 220 px od kraje osy
  const AX = 590, Z = 220;
  const t = (v) => (nula === 'log' ? Math.log(v) : v);
  const maxPos = Math.max(...rows.map((r) => t(r[pole])), 1e-9), maxNeg = Math.max(...rows.map((r) => -t(r[pole])), 1e-9);
  const k = Math.min(250 / maxPos, 160 / maxNeg);
  return `<div class="bars">${rows.map((r) => {
    const v = r[pole], x = t(v) * k, w = Math.abs(x), kladne = x >= 0;
    return `<div class="br"><div class="lab">${r.profese}</div><div class="axis">
      <div class="bar" style="left:${kladne ? Z : Z - w}px;width:${w}px;background:${kladne ? VIC : MENE}"></div>
      <div class="val" style="${kladne ? `left:${Z + w + 10}px` : `right:${AX - Z + w + 10}px`}">${popisek(v)}</div></div></div>`;
  }).join('')}</div>`;
}

const S = [
  {
    id: '02-hlasy-navic', kicker: 'Komu voliči věří • 1/4',
    titulek: 'Lékaři a lékařky dostávají o 13 % víc hlasů',
    pod: 'než kandidáti na stejném místě stejně dlouhé kandidátky ve stejně velkých obcích',
    telo: pruhy(['veterináři a veterinářky', 'lékaři a lékařky', 'ředitelé škol a jejich zástupci', 'hasiči', 'učitelky a učitelé',
      'řemeslníci a opraváři', 'prodavačky, kuchařky, kadeřnice a pošťačky', 'důchodci a důchodkyně', 'studenti a studentky']
      .map((p) => bonus.find((b) => b.profese === p)), 'bonus', pct, 0),
  },
  {
    id: '03-nevolitelne-misto', kicker: 'Komu voliči věří • 2/4',
    titulek: 'Z nevolitelného místa až do zastupitelstva',
    pod: 'Lékař Zdeněk Špale kandidoval v Sedlčanech na posledním, 21. místě. Strana získala tři mandáty, on třetí nejvíc hlasů a zastupitelem se stal.',
    telo: `<div class="big">3,3×</div><div class="bigsub">častěji než ostatní kandidáti se lékaři a lékařky dostali do zastupitelstva z místa, které by jim podle pořadí nestačilo</div>`,
  },
  {
    id: '04-autorita', kicker: 'Komu voliči věří • 3/4',
    titulek: 'Nestačí, že vás lidé znají',
    pod: 'Prodavačku, kuchařku nebo pošťačku zná v obci každý. Z nevolitelného místa se ale do zastupitelstva dostávají méně často. Voliči spíš věří těm, kdo jim pomáhají nebo vedou instituci.',
    telo: pruhy(['lékaři a lékařky', 'veterináři a veterinářky', 'ředitelky a vedoucí knihoven', 'ředitelé škol a jejich zástupci', 'hasiči',
      'ostatní knihovnice a knihovníci', 'řemeslníci a opraváři', 'prodavačky, kuchařky, kadeřnice a pošťačky', 'studenti a studentky']
      .map((p) => skok.find((b) => b.profese === p)), 'nasobek', (v) => fmt(v, 1) + '×', 'log'),
  },
  {
    id: '05-knihovny', kicker: 'Komu voliči věří • 4/4',
    titulek: 'Ředitelky knihoven ano, ostatní kolem průměru',
    pod: 'V zastupitelstvech je 115 knihovnic a knihovníků, stejně jako v roce 2018. Ředitelky a vedoucí knihoven se ale z nevolitelného místa dostávají do zastupitelstva třikrát častěji.',
    telo: `<div class="cta">Celou analýzu a dohledávač<br>„Najděte svou profesi“<br>najdete na DataTimes.cz<br><span>odkaz v bio</span></div>`,
  },
];

// česká typografie: jednopísmenné předložky a spojky nikdy na konci řádku
const nb = (t) => t.replace(/(^|[\s(„>])([KkSsVvZzOoUuAaIi])\s+/g, '$1$2&nbsp;');
const html = (s) => `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
 html,body{margin:0;width:1080px;height:1350px;overflow:hidden;color:#fff}
 body{position:relative;background:radial-gradient(ellipse at 0% 20%,#023440 0%,#02344000 55%),radial-gradient(ellipse at 100% 100%,#2f325c 0%,#2f325c00 55%),${NAVY};font-family:'IBM Plex Sans',Arial,sans-serif}
 .wrap{position:absolute;left:80px;right:80px;top:110px}
 .kick{font-weight:600;font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:#f8f6f0;display:inline-block;padding-bottom:.5em;position:relative}
 .kick::after{content:'';position:absolute;left:0;bottom:0;height:3px;width:120px;background:#de1743}
 h1{margin:34px 0 0;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:72px;line-height:1.06}
 .sub{margin-top:26px;font-weight:500;font-size:31px;line-height:1.35;color:${SUB}}
 .bars{margin-top:46px}
 .br{display:flex;align-items:center;height:56px}
 .lab{width:330px;font-size:22px;line-height:1.15;color:#e6e9f4;text-align:right;padding-right:16px}
 .axis{position:relative;width:590px;height:56px;border-left:0}
 .axis::before{content:'';position:absolute;left:220px;top:0;bottom:0;border-left:2px solid #f8f6f088}
 .bar{position:absolute;top:15px;height:26px;border-radius:2px}
 .val{position:absolute;top:13px;font-size:24px;font-weight:600;white-space:nowrap}
 .big{margin-top:60px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:260px;line-height:1;color:${VIC}}
 .bigsub{margin-top:20px;font-size:34px;line-height:1.35;font-weight:500}
 .cta{margin-top:70px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:52px;line-height:1.25}
 .cta span{display:inline-block;margin-top:24px;font-family:'IBM Plex Sans',Arial,sans-serif;font-size:30px;font-weight:600;color:#fff;background:#de1743;padding:8px 22px;border-radius:30px}
 .logo{position:absolute;left:80px;bottom:90px;display:flex;align-items:center;gap:16px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:40px}
 .logo svg{width:60px;height:60px}
 .src{position:absolute;right:80px;bottom:100px;font-size:18px;color:#c9cde0;text-align:right;max-width:520px}
</style></head><body><div class="wrap"><div class="kick">${s.kicker}</div><h1>${nb(s.titulek)}</h1><div class="sub">${nb(s.pod)}</div>${nb(s.telo)}</div>
<div class="logo">${DONUT}<span>DataTimes.cz</span></div><div class="src">Zdroj: registr kandidátů ČSÚ, obecní volby 2026; výpočet DataTimes.cz</div></body></html>`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  fs.copyFileSync(path.join(ROOT, 'images', 'cover-instagram.png'), path.join(OUT, '01-cover.png'));
  for (const s of S) {
    await page.setContent(html(s), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${s.id}.png`) });
    console.log(path.join(OUT, `${s.id}.png`));
  }
  await browser.close();
})();

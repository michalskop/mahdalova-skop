// Grafy z článku jako obrázky na sítě: vyfotí karty grafů (ChartCard s logem) přímo z běžícího webu,
// aby vypadaly stejně jako v článku. Potřebuje běžící dev server (npm run dev --workspace=apps/web).
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/grafy-social.cjs  → ../_social/graf-*.png
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const URL = 'http://localhost:3001/clanek/volby-cr-2026-10-14-spd-ano-motoriste-v-obcich';
const OUT = path.join(__dirname, '..', '_social');
// podle titulku grafu → název souboru
const GRAFY = [
  ['každý desátý kandidát SPD', 'graf-uspesnost'],
  ['ANO ztrácí ve městech', 'graf-velikost'],
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  // šířka sloupce článku ~ 540 px × 2 = obrázek ~1080 px na šířku
  const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  for (const [titulek, soubor] of GRAFY) {
    // karta grafu = nejbližší předek titulku s pozadím ChartCard (#f8f6f0)
    const karta = await page.evaluateHandle((t) => {
      const titul = [...document.querySelectorAll('.dpbp-chart-title')].find((e) => e.textContent.includes(t));
      let el = titul;
      while (el && getComputedStyle(el).backgroundColor !== 'rgb(248, 246, 240)') el = el.parentElement;
      return el;
    }, titulek);
    await karta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const out = path.join(OUT, `${soubor}.png`);
    await karta.screenshot({ path: out });
    console.log(soubor, `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();

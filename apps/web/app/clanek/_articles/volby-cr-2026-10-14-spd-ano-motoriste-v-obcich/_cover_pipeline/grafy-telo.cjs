// Samotná těla grafů z článku (bez titulku, loga a zdroje – ty dodá karta na sítě, viz karty.cjs).
// Potřebuje běžící dev server. PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/grafy-telo.cjs
//   → ../_social/telo-uspesnost.png, telo-velikost.png (okno 760 px) a telo-*-uzky.png (okno 480 px:
//   písmo je vůči grafu větší, pro široký formát)
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const URL = 'http://localhost:3001/clanek/volby-cr-2026-10-14-spd-ano-motoriste-v-obcich';
const OUT = path.join(__dirname, '..', '_social');
const GRAFY = [['každý desátý kandidát SPD', 'telo-uspesnost'], ['ANO ztrácí ve městech', 'telo-velikost']];

async function vyfot(browser, sirka, pripona) {
  const page = await browser.newPage({ viewport: { width: sirka, height: 1200 }, deviceScaleFactor: 3 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  // grafy se vykreslí až po načtení Vegy – projet stránku a počkat na oba titulky
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } });
  for (const [t] of GRAFY) await page.waitForFunction((x) => [...document.querySelectorAll('.dpbp-chart-title')].some((e) => e.textContent.includes(x)), t, { timeout: 60000 });
  await page.waitForTimeout(1500);
  for (const [titulek, soubor] of GRAFY) {
    // karta grafu → v ní plátno/SVG Vegy → jeho obal (graf i legenda, bez hlavičky a zdroje)
    const telo = await page.evaluateHandle((t) => {
      const titul = [...document.querySelectorAll('.dpbp-chart-title')].find((e) => e.textContent.includes(t));
      let karta = titul;
      while (karta && getComputedStyle(karta).backgroundColor !== 'rgb(248, 246, 240)') karta = karta.parentElement;
      const g = karta.querySelector('canvas, svg.marks');
      return g.parentElement;
    }, titulek);
    await telo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await telo.screenshot({ path: path.join(OUT, `${soubor}${pripona}.png`) });
    console.log(soubor + pripona);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  await vyfot(browser, 760, '');
  await vyfot(browser, 480, '-uzky');
  await browser.close();
})();

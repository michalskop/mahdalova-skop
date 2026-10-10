// Snímek karty obvodu z volby2026.datatimes.cz pro online reportáž.
// node snimek_obvodu.cjs <číslo obvodu> <název souboru bez přípony>
// → images/zive/<název>.jpg (JPEG ~80 %, šířka 700 px @2x – ostré a přitom malé)
// Potřebuje PW_PATH = cesta k balíčku playwright a nainstalovaný Microsoft Edge.
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

(async () => {
  const [ob, name] = process.argv.slice(2);
  if (!ob || !name) throw new Error('použití: node snimek_obvodu.cjs <obvod> <nazev>');
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 700, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto(`https://volby2026.datatimes.cz/#se:${ob}`);
  const detail = page.locator('section#detail');
  await detail.locator('h2').first().waitFor();
  await page.waitForTimeout(1200); // dokreslení grafu
  const out = path.join(__dirname, 'images', 'zive', `${name}.jpg`);
  await detail.screenshot({ path: out, type: 'jpeg', quality: 80 });
  await browser.close();
  console.log(out);
})();

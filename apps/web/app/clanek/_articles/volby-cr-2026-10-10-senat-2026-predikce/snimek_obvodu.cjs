// Snímek karty obvodu z volby2026.datatimes.cz pro online reportáž.
// node snimek_obvodu.cjs <číslo obvodu> <název souboru bez přípony>
// → images/zive/<název>.jpg (JPEG ~80 %, @2x; desktopová šířka, aby karta nepřekrývala seznam obvodů)
// Potřebuje PW_PATH = cesta k balíčku playwright a nainstalovaný Microsoft Edge.
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

(async () => {
  const [ob, name] = process.argv.slice(2);
  if (!ob || !name) throw new Error('použití: node snimek_obvodu.cjs <obvod> <nazev>');
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 }, deviceScaleFactor: 2 });
  await page.goto(`https://volby2026.datatimes.cz/#se:${ob}`);
  const detail = page.locator('section#detail');
  await detail.locator('h2').first().waitFor();
  // karta v šířce čtecího sloupce článku, bez prázdného místa pod obsahem
  await page.addStyleTag({ content: 'section#detail{width:680px!important;max-width:680px!important;min-height:0!important;height:auto!important;position:static!important}' });
  await page.waitForTimeout(1500); // dokreslení grafu v nové šířce
  const out = path.join(__dirname, 'images', 'zive', `${name}.jpg`);
  // ořez na skutečný obsah (sekce bývá natažená na výšku okna)
  const clip = await detail.evaluate((el) => {
    const box = el.getBoundingClientRect();
    let bottom = box.top;
    for (const c of el.querySelectorAll('*')) {
      const r = c.getBoundingClientRect();
      if (r.height > 0 && r.bottom > bottom) bottom = r.bottom;
    }
    return { x: box.left + window.scrollX, y: box.top + window.scrollY, width: box.width, height: bottom - box.top + 16 };
  });
  await page.screenshot({ path: out, type: 'jpeg', quality: 80, clip, fullPage: true });
  await browser.close();
  console.log(out);
})();

// Sada pěti coverů z cover.config.cjs přes sdílený tools/cover-generator.cjs, všechny formáty jako JPEG
// (fotografické covery; PNG by měly několik MB). OG = „čtverec s ušima“ z čtvercového formátu, do 300 kB.
// PW_PATH=<repo>/node_modules/playwright node _cover_pipeline/render.cjs [formát…]
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { FORMATY, html, upravStitek } = require(path.join(REPO, 'tools', 'cover-generator.cjs'));
const c = require('./cover.config.cjs');

(async () => {
  const jen = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const klic of Object.keys(FORMATY).filter((k) => !jen.length || jen.includes(k))) {
    const ucha = klic === 'og' && !c.format?.og && c.og !== 'siroky'; // stejně jako tools/cover-generator.cjs
    const zdroj = ucha ? 'square' : klic;
    const f = FORMATY[zdroj];
    const page = await browser.newPage({ viewport: ucha ? { width: 1200, height: 630 } : { width: f.w, height: f.h } });
    await page.setContent(html(c, zdroj, { ucha }), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await upravStitek(page, zdroj, f);
    const out = path.join(c.vystup, `cover-${klic}.jpg`);
    for (const q of [90, 84, 78, 72]) {
      await page.screenshot({ path: out, type: 'jpeg', quality: q });
      if (klic !== 'og' || fs.statSync(out).size <= 300 * 1024) break;
    }
    await page.close();
    console.log(path.relative(REPO, out), `${Math.round(fs.statSync(out).size / 1024)} kB`);
  }
  await browser.close();
})();

// Render the article's Vega-Lite chart for the portrait carousel; data and line geometry stay unchanged.
// Run this after motiv.cjs, then run tools/carousel-generator.cjs with carousel.config.cjs.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const article = path.join(__dirname, '..');
const original = require('../data/poplatky.json');
const font = 'Roboto Condensed';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 940, height: 700 }, deviceScaleFactor: 2 });
    await page.setContent(`<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=block" rel="stylesheet"><body><div id="chart"></div></body>`, { waitUntil: 'networkidle' });
    for (const entry of ['vega/build/vega.min.js', 'vega-lite/build/vega-lite.min.js', 'vega-embed/build/vega-embed.min.js']) {
      const modules = require.resolve.paths(entry).find(directory => fs.existsSync(path.join(directory, entry)));
      if (!modules) throw new Error(`Browser bundle missing: ${entry}`);
      await page.addScriptTag({ path: path.join(modules, entry) });
    }
    const { title, _source, ...spec } = original;
    await page.evaluate(async ({ spec, font }) => {
      await document.fonts.load(`400 20px '${font}'`);
      await document.fonts.load(`700 20px '${font}'`);
      if (![...document.fonts].some(face => face.family.includes(font) && face.status === 'loaded')) throw new Error('Chart font failed to load');
      await window.vegaEmbed('#chart', {
        ...spec, width: 850, height: 430, background: '#f8f6f0', padding: 22,
        autosize: { type: 'fit-x', contains: 'padding' },
        encoding: { ...spec.encoding, x: { ...spec.encoding.x, axis: { ...spec.encoding.x.axis, values: ['1991-04-01', '2000-01-01', '2008-01-01', '2017-01-01', '2026-11-03'] } } },
        layer: spec.layer.map(layer => layer.mark.type === 'text' ? { ...layer, mark: { ...layer.mark, fontSize: 24, dy: -16 } } : layer),
        config: { font, view: { stroke: null }, axis: { labelFont: font, labelFontSize: 23, labelColor: '#333333', labelPadding: 12 }, text: { font } },
      }, { actions: false, renderer: 'svg' });
    }, { spec, font });
    const output = path.join(article, 'social', 'grafy', 'poplatky.png');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.locator('#chart svg').screenshot({ path: output });
    console.log(output);
  } finally {
    await browser.close();
  }
})();

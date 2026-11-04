// Graf z článku (data/koalice.json) vykreslený stejně jako na webu (VegaChartImpl: Roboto Condensed, béžové pozadí,
// bez titulku a rámečku) do PNG pro carousel; titulek a podtitulek grafu nese slide. Vzor: analyza-2026-10-28-statni-vyznamenani.
// PW_PATH=<repo>/node_modules/playwright node grafy-z-clanku.cjs  → ../social/grafy/koalice.png
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const NM = require.resolve.paths('vega').find((d) => fs.existsSync(path.join(d, 'vega', 'build', 'vega.min.js')));
const CL = path.join(__dirname, '..');
const FONT = "'Roboto Condensed', Arial, sans-serif";
const config = (base = {}) => ({
  ...base,
  font: FONT,
  view: { stroke: null, ...(base.view ?? {}) },
  axis: { ...(base.axis ?? {}), labelFont: FONT, titleFont: FONT, labelFontSize: 10.5, titleFontSize: 10.5, labelColor: '#333333', titleColor: '#333333' },
  legend: { ...(base.legend ?? {}), labelLimit: 0, columnPadding: 24, labelFont: FONT, titleFont: FONT, labelFontSize: 14, titleFontSize: 14, labelColor: '#333333', orient: 'top', symbolType: 'square', symbolSize: 280, symbolStrokeWidth: 0 },
  text: { ...(base.text ?? {}), font: FONT, fontSize: 12 },
});

function priprav(soubor, sirka) {
  const spec = JSON.parse(fs.readFileSync(soubor, 'utf8'));
  const { title, _source, _tooltip_colors, ...rest } = spec;
  return { ...rest, title: null, background: '#f8f6f0', padding: 12, config: config(rest.config), width: sirka, autosize: { type: 'fit-x', contains: 'padding' } };
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 680, height: 1000 }, deviceScaleFactor: 2.2 });
  await page.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;700;800&display=block"></head><body style="margin:0;background:#f8f6f0"><div id="g" style="display:inline-block"></div></body></html>`);
  for (const k of ['vega/build/vega.min.js', 'vega-lite/build/vega-lite.min.js', 'vega-embed/build/vega-embed.min.js']) await page.addScriptTag({ path: path.join(NM, k) });
  await page.evaluate(async () => { await document.fonts.load("400 12px 'Roboto Condensed'"); await document.fonts.load("800 12px 'Roboto Condensed'"); });
  const cil = path.join(CL, 'social', 'grafy', 'koalice.png');
  await page.evaluate(async (s) => { await window.vegaEmbed('#g', s, { actions: false, renderer: 'svg' }); }, priprav(path.join(CL, 'data', 'koalice.json'), 600));
  fs.mkdirSync(path.dirname(cil), { recursive: true });
  await (await page.$('#g svg')).screenshot({ path: cil });
  console.log(path.relative(CL, cil));
  await browser.close();
})();

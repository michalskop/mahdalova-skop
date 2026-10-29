// Grafy z článků vykreslené stejně jako na webu (VegaChartImpl: Roboto Condensed, béžové pozadí #f8f6f0, bez titulku
// a rámečku) do PNG pro carousely. Titulek a podtitulek grafu nese slide, ne obrázek.
// PW_PATH=<repo>/node_modules/playwright node grafy-z-clanku.cjs  → ../social/grafy/*.png (+ komu/social/grafy/*.png)
// Kateřina 28. 10. 2026: v carouselu grafy přesně tak, jak jsou v článku; mřížku řádů rozdělit na víc slidů.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

// vega z node_modules: Node je najde nahoru po stromu (ve worktree v hlavním checkoutu)
const NM = require.resolve.paths('vega').find((d) => fs.existsSync(path.join(d, 'vega', 'build', 'vega.min.js')));
const ZENY = path.join(__dirname, '..');
const KOMU = path.join(__dirname, '..', '..', 'analyza-2026-10-28-statni-vyznamenani-komu');

const FONT = "'Roboto Condensed', Arial, sans-serif";
// stejné jako CHART_FONT_CONFIG + mergeFontConfig ve VegaChartImpl.tsx
const config = (base = {}) => ({
  ...base,
  font: FONT,
  view: { stroke: null, ...(base.view ?? {}) },
  axis: { ...(base.axis ?? {}), labelFont: FONT, titleFont: FONT, labelFontSize: 10.5, titleFontSize: 10.5, labelColor: '#333333', titleColor: '#333333' },
  legend: { ...(base.legend ?? {}), labelFont: FONT, titleFont: FONT, labelFontSize: 14, titleFontSize: 14, labelColor: '#333333', orient: 'top', symbolType: 'square', symbolSize: 280, symbolStrokeWidth: 0, layout: { top: { anchor: 'middle' } } },
  text: { ...(base.text ?? {}), font: FONT, fontSize: 12 },
  header: { labelFont: FONT, titleFont: FONT },
});

function priprav(soubor, { sirka, dlazdice, sloupce, obory } = {}) {
  const spec = JSON.parse(fs.readFileSync(soubor, 'utf8'));
  const { title, _source, _click_detail, _facet_fill, _total_width, ...rest } = spec;
  let s = { ...rest, title: null, background: '#f8f6f0', padding: 12, config: config(rest.config) };
  if (s.facet) {
    if (obory) {
      s.facet = { ...s.facet, sort: obory };
      s.transform = [...(s.transform ?? []), { filter: { field: s.facet.field, oneOf: obory } }];
    }
    s.columns = sloupce ?? s.columns;
    s.spec = { ...s.spec, width: dlazdice ?? s.spec.width };
  } else {
    s.width = sirka;
    s.autosize = { type: 'fit-x', contains: 'padding' };
  }
  return s;
}

const ULOHY = [
  { cil: path.join(ZENY, 'social', 'grafy', 'druhy-zm.png'), soubor: path.join(ZENY, 'data', 'graf_druhy_zm.json'), dlazdice: 190, sloupce: 2 },
  { cil: path.join(ZENY, 'social', 'grafy', 'zeny-roky.png'), soubor: path.join(ZENY, 'data', 'graf_zeny.json'), sirka: 430 },
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 520, height: 900 }, deviceScaleFactor: 2.2 });
  await page.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;700&display=block"></head><body style="margin:0;background:#f8f6f0"><div id="g" style="display:inline-block"></div></body></html>`);
  for (const k of ['vega/build/vega.min.js', 'vega-lite/build/vega-lite.min.js', 'vega-embed/build/vega-embed.min.js']) await page.addScriptTag({ path: path.join(NM, k) });
  await page.evaluate(async () => { await document.fonts.load("400 12px 'Roboto Condensed'"); await document.fonts.load("700 12px 'Roboto Condensed'"); });
  for (const u of ULOHY) {
    const spec = priprav(u.soubor, u);
    await page.evaluate(async (s) => { document.getElementById('g').innerHTML = ''; await window.vegaEmbed('#g', s, { actions: false, renderer: 'svg' }); }, spec);
    fs.mkdirSync(path.dirname(u.cil), { recursive: true });
    await (await page.$('#g svg')).screenshot({ path: u.cil });
    console.log(path.relative(path.join(__dirname, '..', '..'), u.cil));
  }
  await browser.close();
})();

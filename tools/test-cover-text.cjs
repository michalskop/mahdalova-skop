const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual editor text renderer with deterministic font metrics.
const html = fs.readFileSync(path.join(__dirname, 'poster-editor.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const wrap = script.slice(script.indexOf('function wrapWidth('), script.indexOf('// ---- MOTIF ----'));
const emit = script.slice(script.indexOf('function emitText('), script.indexOf('function emitImage('));
const escape = script.match(/function esc\(s\)\{[^\n]+/)[0];
const fonts = script.match(/const COVER_FONTS = [^\n]+/)[0];
let overrides = {};
const state = { content: {}, font: {}, color: {} };
const context = vm.createContext({
  CoverText: require('./cover-text.js'),
  state,
  FF: { sans: 'sans', serif: 'serif' },
  measure: text => text.length * 10,
  ovGet: () => overrides,
});
vm.runInContext(`${fonts}\n${escape}\n${wrap}\n${emit}`, context);
const layout = { x: 0, y: 30, size: 20, w: 800, color: '#101432' };
const lines = svg => [...svg.matchAll(/<tspan[^>]* dy="[^"]+"[^>]*>(.*?)<\/tspan><\/tspan>/g)].map(match => match[1].replace(/<[^>]+>/g, ''));
const width = svg => Number(svg.match(/class="object-box"[^>]*width="([^"]+)"/)[1]);

state.content.kicker = 'DATA';
assert.equal(width(context.emitText('kicker', layout)), 40, 'short kicker has a tight frame');
state.content.kicker = 'DATA ANALÝZA';
assert.equal(width(context.emitText('kicker', layout)), 120, 'frame grows with content');
overrides = { w: 300, sc: 1.5 };
assert.equal(width(context.emitText('kicker', layout)), 200, 'manual width accounts for scale');
delete overrides.w;
assert.equal(width(context.emitText('kicker', layout)), 120, 'reset restores content-sized frame');

state.content.claim = 'První řádek\nDruhý řádek';
for (const override of [{}, { w: 700 }, { w: 700, sc: 1.5 }]) {
  overrides = override;
  assert.deepEqual(lines(context.emitText('claim', layout)), ['První řádek', 'Druhý řádek']);
}
overrides = { w: 60 };
assert.deepEqual(lines(context.emitText('claim', layout)), ['První', 'řádek', 'Druhý', 'řádek'], 'narrow frame wraps within explicit lines');
state.content.claim = '<text> & text\nŘádek';
overrides = { w: 700 };
assert.deepEqual(lines(context.emitText('claim', layout)), ['&lt;text&gt; &amp; text', 'Řádek']);
for (const [id, expected] of Object.entries({ kicker: 'sans', headline: 'serif', subtitle: 'serif', claim: 'serif' })) {
  state.content[id] = 'Typography';
  state.font[id] = expected === 'sans' ? 'serif' : 'sans';
  assert(context.emitText(id, layout).includes(`font-family="${expected}"`), `${id} follows editorial typography even with a legacy font override`);
}
console.log('PASS kicker frame, manual width/reset/scale, claim newlines, wrapping, escaping and editorial typography');

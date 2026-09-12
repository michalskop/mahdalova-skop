import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as geo from 'd3-geo';
import * as extra from 'd3-geo-projection';

function load(file, dependencies) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)((name) => {
    assert.ok(name in dependencies, `Unknown dependency: ${name}`);
    return dependencies[name];
  }, exports);
  return exports;
}
const geometry = load('../components/clanek/TrueSizeGame/geometry.ts', { 'd3-geo': geo, 'd3-geo-projection': extra });
const { interpolateProjection } = load('../components/clanek/TrueSizeGame/useProjectionMorph.ts', { react: {}, 'd3-geo': geo, './geometry': geometry });
const grid = geo.geoGraticule10();
for (const height of [700, 875]) {
  for (const a of geometry.PROJECTIONS) for (const b of geometry.PROJECTIONS) {
    const from = geometry.makeProjection(a.id, height);
    const to = geometry.makeProjection(b.id, height);
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const morph = interpolateProjection(from, to, t, height);
      const path = geo.geoPath(morph)(grid);
      assert.ok(path && !/NaN|Infinity/.test(path), `${a.id} → ${b.id} at ${t}: grid vanished`);
      for (const point of [[0, 0], [30, 50], [-120, -40]]) {
        const start = from(point), end = to(point), actual = morph(point);
        for (let i = 0; i < 2; i++) assert.ok(Math.abs(actual[i] - (start[i] + (end[i] - start[i]) * t)) < 1e-6);
      }
    }
  }
}
console.log('PASS: all projection pairs retain a finite grid and continuous geographic positions at desktop/mobile heights');

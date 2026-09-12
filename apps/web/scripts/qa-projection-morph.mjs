import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as geo from 'd3-geo';
import * as extra from 'd3-geo-projection';
import { feature } from 'topojson-client';

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
const world = JSON.parse(fs.readFileSync(new URL('../public/specialy/dpbp/data/world-countries-110m.json', import.meta.url), 'utf8'));
const countries = feature(world, world.objects.countries).features;
for (const height of [700, 875]) {
  for (const a of geometry.PROJECTIONS) for (const b of geometry.PROJECTIONS) {
    const from = geometry.makeProjection(a.id, height);
    const to = geometry.makeProjection(b.id, height);
    if (b.id === 'mercator') {
      const nearEnd = geo.geoPath(interpolateProjection(from, to, 0.999999, height));
      const end = geo.geoPath(to);
      for (const country of countries) {
        const difference = Math.abs(nearEnd.area(country) - end.area(country));
        assert.ok(difference < 100, `${country.properties.name}: Mercator fill jumps by ${difference}`);
      }
    }
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const morph = interpolateProjection(from, to, t, height);
      for (const pole of [[0, 90], [180, 90], [-180, -90]]) {
        assert.ok(morph(pole).every(Number.isFinite), `${a.id} → ${b.id}: nonfinite pole`);
      }
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

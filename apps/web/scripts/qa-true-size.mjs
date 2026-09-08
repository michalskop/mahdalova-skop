// Run from repository root: node apps/web/scripts/qa-true-size.mjs
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { feature } from "topojson-client";
import { geoArea, geoCentroid, geoDistance, geoPath } from "d3-geo";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await fs.readFile(
  path.join(web, "components/clanek/TrueSizeGame/geometry.ts"),
  "utf8",
);
const temporary = path.join(web, "scripts/.true-size-geometry-qa.mjs");
await fs.writeFile(
  temporary,
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
);
try {
  const g = await import(pathToFileURL(temporary));
  const world = JSON.parse(
    await fs.readFile(
      path.join(web, "public/specialy/dpbp/data/world-countries-110m.json"),
      "utf8",
    ),
  );
  const countries = feature(world, world.objects.countries).features;
  const originalUkraine = countries.find(
    (c) => c.properties.name === "Ukraine",
  );
  const originalRussia = countries.find((c) => c.properties.name === "Russia");
  const originalArea = geoArea(originalUkraine) + geoArea(originalRussia);
  g.reassignCrimea(countries, world);
  assert.equal(
    originalUkraine.geometry.coordinates.length,
    1,
    "Ukraine and Crimea must form one polygon",
  );
  assert.ok(
    Math.abs(
      geoArea(originalUkraine) + geoArea(originalRussia) - originalArea,
    ) < 1e-10,
  );
  const byName = new Map(countries.map((c) => [c.properties.name, c]));
  let rotations = 0;
  for (const country of countries) {
    const origin = geoCentroid(country);
    const home = {
      id: 1,
      name: country.properties.name,
      lon: origin[0],
      lat: origin[1],
      angle: 0,
      pinned: false,
      color: g.COLORS[0],
    };
    assert.strictEqual(
      g.placeCountry(country, home),
      country,
      "Home must reuse exact original geometry",
    );
    for (const [lon, lat, angle] of [
      [0, 0, 0],
      [179, 45, 35],
      [-170, -40, -90],
      [15, 75, 180],
    ]) {
      const moved = g.placeCountry(country, { ...home, lon, lat, angle });
      assert.ok(
        Math.abs(geoArea(moved) / geoArea(country) - 1) < 1e-8,
        `${home.name}: spherical area changed`,
      );
      assert.ok(
        geoDistance(geoCentroid(moved), [lon, lat]) < 1e-7,
        `${home.name}: wrong anchor`,
      );
      rotations++;
    }
  }
  const greenland = byName.get("Greenland");
  const base = {
    id: 2,
    name: "Greenland",
    lon: 0,
    lat: 0,
    angle: 0,
    pinned: true,
    color: g.COLORS[1],
  };
  for (const info of g.PROJECTIONS) {
    const projection = g.makeProjection(info.id);
    const p = projection([15, 30]);
    const inverse = projection.invert(p);
    assert.ok(geoDistance(inverse, [15, 30]) < 1e-7, `${info.id} inverse`);
    for (const lon of [-179, 0, 179])
      for (const lat of [-60, 0, 60]) {
        const d = geoPath(projection)(
          g.placeCountry(greenland, { ...base, lon, lat }),
        );
        assert.ok(
          d && !/NaN|Infinity/.test(d),
          `${info.id}: invalid path at ${lon},${lat}`,
        );
      }
    if (["equal", "peters", "mollweide"].includes(info.id)) {
      const a = geoPath(projection).area(g.placeCountry(greenland, base));
      const b = geoPath(projection).area(
        g.placeCountry(greenland, { ...base, lon: 35, lat: 45 }),
      );
      assert.ok(
        Math.abs(a / b - 1) < 0.005,
        `${info.id}: equal-area projection changed area`,
      );
    }
    const home = g.homePiece(base, greenland);
    assert.ok(g.isHome(home, greenland, projection, 1));
    assert.ok(
      !g.isHome({ ...home, lat: home.lat - 20 }, greenland, projection, 1),
    );
    assert.equal(g.homePiece({ ...base, angle: 55 }, greenland).angle, 0);
  }
  const dictionarySource = await fs.readFile(
    path.join(web, "components/clanek/TrueSizeGame/countries.ts"),
    "utf8",
  );
  const dictionaryJs = ts.transpileModule(dictionarySource, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const { COUNTRIES } = await import(
    "data:text/javascript;base64," +
      Buffer.from(dictionaryJs).toString("base64")
  );
  const roundsSource = await fs.readFile(
    path.join(web, "components/clanek/TrueSizeGame/rounds.ts"),
    "utf8",
  );
  const dictionaryUrl =
    "data:text/javascript;base64," +
    Buffer.from(dictionaryJs).toString("base64");
  const roundsJs = ts
    .transpileModule(roundsSource, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace('"./countries"', JSON.stringify(dictionaryUrl))
    .replace("'./countries'", JSON.stringify(dictionaryUrl));
  const { drawRound, ROUND_POOL, LATIN_AMERICA } = await import(
    "data:text/javascript;base64," + Buffer.from(roundsJs).toString("base64")
  );
  assert.ok(
    ROUND_POOL.every((name) => byName.has(name)),
    "Every pool country exists",
  );
  const pool = ROUND_POOL;
  let seed = 42;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let previous = ["Greenland", "Brazil", "India", "Australia", "Madagascar"];
  for (let i = 0; i < 3000; i++) {
    const count = [5, 10, 15][i % 3];
    const next = drawRound(pool, previous, count, random);
    assert.equal(next.length, count);
    assert.equal(new Set(next).size, count);
    assert.ok(next.every((n) => byName.has(n)));
    assert.ok(
      next.filter((n) => previous.includes(n)).length <=
        Math.floor(count * 0.2),
      "Previous round repeated too often",
    );
    assert.ok(
      new Set(next.map((name) => COUNTRIES[name].continent)).size >=
        (count === 5 ? 4 : 5),
    );
    assert.ok(
      next.filter((name) => LATIN_AMERICA.includes(name)).length >=
        (count >= 10 ? 2 : 1),
    );
    previous = next;
  }
  console.log(
    `PASS: ${rotations} area-preserving rotations, ${g.PROJECTIONS.length} projections, snapping, dissolved Crimea and 3000 balanced rounds (pool: ${pool.length}).`,
  );
} finally {
  await fs.unlink(temporary);
}

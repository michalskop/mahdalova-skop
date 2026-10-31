// Úhrnná plodnost ve Švédsku, Francii, Maďarsku a Česku 2000–2024 pro graf
// FertilityComparisonChart (článek 04 Skandinávská past).
//
// Zdroj: Eurostat, demo_find (indic_de=TOTFERRT), staženo 27. 10. 2026
// https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_find?indic_de=TOTFERRT&geo=CZ&geo=SE&geo=FR&geo=HU&sinceTimePeriod=2000
// soubor vstupy/eurostat_demo_find_tfr.json
//
// Spuštění: node plodnost_zeme.cjs  → vypíše klíčové hodnoty a uloží
// components/dpbp/FertilityComparisonChart/data.json
const fs = require('fs');
const path = require('path');

const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'vstupy', 'eurostat_demo_find_tfr.json'), 'utf8'));
const geoIdx = src.dimension.geo.category.index;
const timeIdx = src.dimension.time.category.index;
const nTime = Object.keys(timeIdx).length;

const out = {};
for (const [geo, gi] of Object.entries(geoIdx)) {
  out[geo] = Object.entries(timeIdx)
    .map(([year, ti]) => ({ rok: Number(year), tfr: src.value[gi * nTime + ti] }))
    .filter((r) => r.tfr != null && r.rok <= 2024)
    .sort((a, b) => a.rok - b.rok);
  const s = out[geo];
  const max = s.reduce((m, r) => (r.tfr > m.tfr ? r : m));
  console.log(geo, 'první', s[0].rok, s[0].tfr, '| maximum', max.rok, max.tfr, '| poslední', s.at(-1).rok, s.at(-1).tfr);
}

const target = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'components', 'dpbp', 'FertilityComparisonChart', 'data.json');
fs.writeFileSync(target, JSON.stringify({ zdroj: 'Eurostat demo_find, stav k ' + src.updated.slice(0, 10), zeme: out }, null, 1) + '\n');
console.log('uloženo', path.relative(process.cwd(), target));

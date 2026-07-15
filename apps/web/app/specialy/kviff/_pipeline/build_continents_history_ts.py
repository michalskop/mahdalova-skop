# Z kviff_continents_corrected_all_years.csv vygeneruje ../continents-history.ts.
# Zdroj CSV je ručně opravený tak, aby koprodukce se dvěma zeměmi ze stejného
# kontinentu (např. USA + Brazílie + Argentina) nezapočítávala kontinent
# vícekrát – na rozdíl od countries-history.ts, kde se dvojí počítání děje,
# protože se tam sčítají jednotlivé země, ne unikátní kontinenty na film.

import csv
import json
from collections import OrderedDict
from pathlib import Path

HERE = Path(__file__).parent
rows = OrderedDict()
with (HERE / 'kviff_continents_corrected_all_years.csv').open(encoding='utf-8') as f:
    for row in csv.DictReader(f):
        year = int(row['year'])
        rows.setdefault(year, {})[row['continent']] = int(row['value'])

out_rows = [{'year': year, 'continents': continents} for year, continents in sorted(rows.items())]

ts = ['// GENEROVANO: _pipeline/build_continents_history_ts.py',
      '// (zdroj: kviff_continents_corrected_all_years.csv, rucne opravene proti',
      '// dvojimu pocitani kontinentu u koprodukci se dvema a vice zememi ze',
      '// stejneho kontinentu)',
      '',
      'export type ContinentYearRow = {',
      '  year: number;',
      '  continents: Record<string, number>;',
      '};',
      '',
      'export const continentHistory: ContinentYearRow[] = ' + json.dumps(out_rows, ensure_ascii=False, indent=1) + ';',
      '']
(HERE.parent / 'continents-history.ts').write_text('\n'.join(ts), encoding='utf-8')
print('zapsano continents-history.ts,', len(out_rows), 'rocniku')

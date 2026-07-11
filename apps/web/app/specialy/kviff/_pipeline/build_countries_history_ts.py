# Z countries_history.json vygeneruje ../countries-history.ts pro web.
# Spouštět po scrape_film_archive.py.

import json
from pathlib import Path

HERE = Path(__file__).parent
DATA = json.loads((HERE / 'countries_history.json').read_text(encoding='utf-8'))

# Regiony pro agregaci (historické entity nechávané dobově)
REGION = {
    'Europe': [
        'France', 'Czech Republic', 'Germany', 'United Kingdom', 'Belgium', 'Spain', 'Italy',
        'Slovak Republic', 'Slovakia', 'Austria', 'Netherlands', 'Poland', 'Norway', 'Greece',
        'Lithuania', 'Luxembourg', 'Bulgaria', 'Denmark', 'Switzerland', 'Croatia', 'Cyprus',
        'Czechoslovakia', 'Hungary', 'Ireland', 'Latvia', 'Romania', 'Slovenia', 'Sweden',
        'Finland', 'North Macedonia', 'Macedonia', 'Serbia', 'Albania', 'Estonia', 'Kosovo',
        'Ukraine', 'Portugal', 'Iceland', 'Russia', 'Belarus', 'Moldova', 'Malta',
        'Bosnia and Herzegovina', 'Montenegro', 'Yugoslavia', 'USSR', 'Soviet Union',
        'West Germany', 'East Germany', 'Serbia and Montenegro', 'Federal Republic of Yugoslavia',
        'Greenland', 'Faroe Islands', 'Monaco', 'Liechtenstein', 'Andorra', 'San Marino',
    ],
    'Severní Amerika': ['USA', 'Canada'],
    'Latinská Amerika': [
        'Argentina', 'Mexico', 'Brazil', 'Chile', 'Colombia', 'Uruguay', 'Peru', 'Cuba',
        'Venezuela', 'Bolivia', 'Ecuador', 'Paraguay', 'Costa Rica', 'Guatemala', 'Panama',
        'Dominican Republic', 'Puerto Rico', 'Haiti', 'Nicaragua', 'Honduras', 'El Salvador',
    ],
    'Asie': [
        'Japan', 'India', 'China', 'South Korea', 'Korea', 'Nepal', 'Indonesia', 'Myanmar',
        'Philippines', 'Singapore', 'Hong Kong', 'Taiwan', 'Thailand', 'Vietnam', 'Bangladesh',
        'Sri Lanka', 'Mongolia', 'Kazakhstan', 'Kyrgyzstan', 'Uzbekistan', 'Tajikistan',
        'Turkmenistan', 'Afghanistan', 'Malaysia', 'Cambodia', 'Laos', 'North Korea', 'Bhutan',
        'Georgia', 'Armenia', 'Azerbaijan',
    ],
    'Blízký východ': [
        'Saudi Arabia', 'Lebanon', 'Qatar', 'Iran', 'Jordan', 'Palestine', 'Turkey', 'Yemen',
        'Israel', 'Iraq', 'Syria', 'United Arab Emirates', 'Kuwait', 'Egypt', 'Bahrain', 'Oman',
    ],
    'Afrika': [
        'Gabon', 'Guinea-Bissau', 'Ivory Coast', 'Rwanda', 'Senegal', 'Morocco', 'Tunisia',
        'Algeria', 'South Africa', 'Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'Mali',
        'Burkina Faso', 'Cameroon', 'Congo', 'Democratic Republic of the Congo', 'Angola',
        'Mozambique', 'Zimbabwe', 'Tanzania', 'Uganda', 'Sudan', 'Chad', 'Niger', 'Somalia',
        'Libya', 'Mauritania', 'Madagascar', 'Lesotho', 'Zambia', 'Benin', 'Togo',
    ],
    'Oceánie': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa'],
}
COUNTRY_TO_REGION = {c: r for r, cs in REGION.items() for c in cs}
COUNTRY_TO_REGION.update({c: 'Evropa' for c in REGION['Europe']})
# doplňky map po prvním běhu
COUNTRY_TO_REGION.update({
    'Pakistan': 'Asie', 'Barma': 'Asie', 'Burma': 'Asie',
    'Guinea': 'Afrika', 'Malawi': 'Afrika', 'Namibia': 'Afrika', 'Sierra Leone': 'Afrika',
    'Iraqi Kurdistan': 'Blízký východ', 'Kurdistan': 'Blízký východ',
    'Jamaica': 'Latinská Amerika',
})

# Očista parserových úniků: u vícerežisérských filmů se do "země" dostane
# i jméno režiséra ("Jmeno / Russia") – bereme část za posledním lomítkem.
def clean_country(c: str):
    if '/' in c:
        c = c.split('/')[-1].strip()
    if c in ('various countries', 'various directors', ''):
        return None
    return c

for r in DATA:
    cleaned = {}
    for c, n in r['countries'].items():
        cc = clean_country(c)
        if cc is None:
            continue
        cleaned[cc] = cleaned.get(cc, 0) + n
    r['countries'] = cleaned

REGION_EXTRA = {
    'Asie': ['Pakistan', 'Barma', 'Burma'],
    'Afrika': ['Guinea', 'Malawi', 'Namibia', 'Sierra Leone'],
    'Blízký východ': ['Iraqi Kurdistan', 'Kurdistan'],
    'Latinská Amerika': ['Jamaica'],
}

rows = sorted(DATA, key=lambda r: r['year'])
unknown = set()
out_rows = []
top_countries_total = {}
for r in rows:
    regions = {}
    for c, n in r['countries'].items():
        reg = COUNTRY_TO_REGION.get(c)
        if reg is None:
            unknown.add(c)
            reg = 'Ostatní'
        regions[reg] = regions.get(reg, 0) + n
        top_countries_total[c] = top_countries_total.get(c, 0) + n
    out_rows.append({
        'year': r['year'],
        'films': r['filmsWithCountry'],
        'coproductions': r['coproductions'],
        'coproductionShare': r['coproductionShare'],
        'avgCountriesPerFilm': r['avgCountriesPerFilm'],
        'regions': regions,
        'top': sorted(r['countries'].items(), key=lambda kv: -kv[1])[:12],
    })

top_all = sorted(top_countries_total.items(), key=lambda kv: -kv[1])[:15]
if unknown:
    print('NEZARAZENE ZEME (doplnit do REGION):', sorted(unknown))

ts = ['// GENEROVANO: _pipeline/build_countries_history_ts.py (zdroj: oficialni Archiv filmu KVIFF)',
      '// Metodika: vyskyty produkcnich zemi (koprodukce se pocita kazde zemi),',
      '// koprodukce = film se 2+ zememi. Pokryti archivu: 1992-2026 (bez 1993 a 2020).',
      '',
      'export type CountryYearRow = {',
      '  year: number;',
      '  films: number;',
      '  coproductions: number;',
      '  coproductionShare: number | null;',
      '  avgCountriesPerFilm: number | null;',
      '  regions: Record<string, number>;',
      '  top: Array<[string, number]>;',
      '};',
      '',
      'export const countryHistory: CountryYearRow[] = ' + json.dumps(out_rows, ensure_ascii=False, indent=1) + ';',
      '',
      'export const countryHistoryTopCountries: Array<[string, number]> = ' + json.dumps(top_all, ensure_ascii=False) + ';',
      '']
(HERE.parent / 'countries-history.ts').write_text('\n'.join(ts), encoding='utf-8')
print('zapsano countries-history.ts,', len(out_rows), 'rocniku')

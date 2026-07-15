# Doplneni souradnic/regionu pro zeme, ktere se v raw archivu (film_archive_raw.json)
# objevuji, ale countries.ts pro ne nemel zadne souradnice -> byly na historicke
# mape neviditelne. Zdroj souradnic: puvodni TSV export s lat/lon per zeme.
import re
from pathlib import Path

HERE = Path(__file__).parent
TS_PATH = HERE.parent / 'countries.ts'
text = TS_PATH.read_text(encoding='utf-8')

# (anglicky, lat, lon, region_enum, cesky_nazev_nebo_None_pokud_uz_existuje)
NEW = [
    ('Israel', 31, 35, 'Middle East', None),
    ('Iceland', 64.9, -18.6, 'Europe', None),
    ('Portugal', 39.4, -8.2, 'Europe', None),
    ('Taiwan', 23.7, 121, 'Asia', None),
    ('Georgia', 42.3, 43.4, 'Asia', None),
    ('Thailand', 15.9, 101, 'Asia', None),
    ('Tunisia', 33.9, 9.5, 'Africa', None),
    ('Peru', -9.2, -75, 'Latin America', None),
    ('New Zealand', -40.9, 174.9, 'Oceania', None),
    ('Morocco', 31.8, -7.1, 'Africa', None),
    ('South Africa', -30.6, 22.9, 'Africa', None),
    ('Belarus', 53.7, 27.9, 'Europe', None),
    ('Iraq', 33.2, 43.7, 'Middle East', None),
    ('Armenia', 40.1, 45, 'Asia', None),
    ('United Arab Emirates', 23.4, 53.8, 'Middle East', None),
    ('Kyrgyzstan', 41.2, 74.8, 'Asia', 'Kyrgyzstán'),
    ('Vietnam', 14.1, 108.3, 'Asia', None),
    ('Azerbaijan', 40.1, 47.6, 'Asia', None),
    ('Montenegro', 42.7, 19.3, 'Europe', None),
    ('Uzbekistan', 41.4, 64.6, 'Asia', 'Uzbekistán'),
    ('Mongolia', 46.9, 103.8, 'Asia', None),
    ('Pakistan', 30.4, 69.3, 'Asia', 'Pákistán'),
    ('Cambodia', 12.6, 104.9, 'Asia', 'Kambodža'),
    ('Malaysia', 4.2, 101.9, 'Asia', 'Malajsie'),
    ('Moldova', 47.4, 28.4, 'Europe', None),
    ('Chad', 15.5, 18.7, 'Africa', 'Čad'),
    ('Venezuela', 6.4, -66.6, 'Latin America', None),
    ('Monaco', 43.7, 7.4, 'Europe', 'Monako'),
    ('Algeria', 28, 1.7, 'Africa', None),
    ('Afghanistan', 33.9, 67.7, 'Asia', None),
    ('Cuba', 21.5, -79.4, 'Latin America', None),
    ('Bolivia', -16.3, -63.6, 'Latin America', None),
    ('Nigeria', 9.1, 8.7, 'Africa', None),
    ('Zimbabwe', -19, 29.2, 'Africa', 'Zimbabwe'),
    ('Turkmenistan', 38.9, 59.6, 'Asia', 'Turkmenistán'),
    ('Dominican Republic', 18.7, -70.2, 'Latin America', 'Dominikánská republika'),
    ('Sri Lanka', 7.9, 80.8, 'Asia', None),
    ('Bhutan', 27.5, 90.4, 'Asia', 'Bhútán'),
    ('Tajikistan', 38.9, 71, 'Asia', 'Tádžikistán'),
    ('Ethiopia', 9.1, 40.5, 'Africa', None),
    ('Paraguay', -23.4, -58.4, 'Latin America', 'Paraguay'),
    ('Sudan', 12.9, 30.2, 'Africa', 'Súdán'),
    ('Zambia', -13.1, 27.8, 'Africa', 'Zambie'),
    ('Uganda', 1.4, 32.3, 'Africa', 'Uganda'),
    ('Iraqi Kurdistan', 36.2, 44, 'Middle East', 'Irácký Kurdistán'),
    ('North Korea', 40.3, 127.5, 'Asia', 'Severní Korea'),
    ('Guinea', 9.9, -9.7, 'Africa', 'Guinea'),
    ('Malta', 35.9, 14.4, 'Europe', None),
    ('Namibia', -22.9, 18.5, 'Africa', 'Namibie'),
    ('Angola', -11.2, 17.9, 'Africa', 'Angola'),
    ('Liechtenstein', 47.2, 9.6, 'Europe', 'Lichtenštejnsko'),
    ('Guatemala', 15.8, -90.2, 'Latin America', 'Guatemala'),
    ('Jamaica', 18.1, -77.3, 'Latin America', 'Jamajka'),
    ('Sierra Leone', 8.5, -11.8, 'Africa', 'Sierra Leone'),
    ('Malawi', -13.3, 34.3, 'Africa', 'Malawi'),
    ('Democratic Republic of the Congo', -4, 21.8, 'Africa', 'Demokratická republika Kongo'),
    ('Ghana', 7.9, -1, 'Africa', 'Ghana'),
    ('Somalia', 5.2, 46.2, 'Africa', 'Somálsko'),
    ('Kurdistan', 36.2, 44, 'Middle East', 'Kurdistán'),
    ('Bangladesh', 23.7, 90.4, 'Asia', None),
    ('Kenya', 0, 37.9, 'Africa', None),
    ('Burkina Faso', 12.2, -1.6, 'Africa', 'Burkina Faso'),
    ('Costa Rica', 9.7, -84.2, 'Latin America', 'Kostarika'),
    ('Mauritania', 21, -10.9, 'Africa', 'Mauritánie'),
    ('Tanzania', -6.4, 34.9, 'Africa', 'Tanzanie'),
    ('Syria', 34.8, 38.9, 'Middle East', None),
]

# --- 1) doplnit historicalOnlyCoordinates ---
coord_block_re = re.compile(r'(const historicalOnlyCoordinates:.*?=\s*\{)(.*?)(\n\};)', re.S)
m = coord_block_re.search(text)
assert m, 'historicalOnlyCoordinates block not found'
existing_keys = set(re.findall(r"^\s*(?:'([^']+)'|(\w+)):", m.group(2), re.M))
existing_keys = {a or b for a, b in existing_keys}

new_coord_lines = []
for name, lat, lon, region, _ in NEW:
    if name in existing_keys:
        continue
    key = f"'{name}'" if not name.isidentifier() else name
    new_coord_lines.append(f"  {key}: {{ lat: {lat}, lon: {lon}, region: '{region}' }},")

text = coord_block_re.sub(
    lambda mm: mm.group(1) + mm.group(2) + '\n' + '\n'.join(new_coord_lines) + mm.group(3),
    text, count=1,
)

# --- 2) doplnit countryNamesCz ---
names_block_re = re.compile(r'(export const countryNamesCz:.*?=\s*\{)(.*?)(\n\};)', re.S)
m2 = names_block_re.search(text)
assert m2, 'countryNamesCz block not found'
existing_names_keys = set(re.findall(r"(?:'([^']+)'|(\w+)):\s*'", m2.group(2)))
existing_names_keys = {a or b for a, b in existing_names_keys}

new_name_lines = []
for name, _, _, _, cz in NEW:
    if cz is None or name in existing_names_keys:
        continue
    key = f"'{name}'" if not name.isidentifier() else name
    new_name_lines.append(f"  {key}: '{cz}',")

text = names_block_re.sub(
    lambda mm: mm.group(1) + mm.group(2) + '\n' + '\n'.join(new_name_lines) + mm.group(3),
    text, count=1,
)

TS_PATH.write_text(text, encoding='utf-8')
print(f'coordinates added: {len(new_coord_lines)}')
print(f'cz names added: {len(new_name_lines)}')

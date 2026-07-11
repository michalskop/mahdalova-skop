# Stažení historie filmového programu KVIFF z oficiálního archivu
# https://www.kviff.com/en/programme/archive-of-films/{rok}/{pismeno}
#
# Pro každý ročník (1992–2026, bez nekonaných 1993 a 2020) projde abecední
# stránky a z každého filmu vytáhne produkční země. Výstup:
#   film_archive_raw.json   – všechny filmy (rok, titul, země, rok výroby)
#   countries_history.json  – agregace po ročnících (výskyty zemí, koprodukce)
#
# Metodika (shodná s mapou katalogu 2026):
# - koprodukční film se počítá KAŽDÉ uvedené zemi (výskyty, ne unikátní filmy),
# - do programu patří i retrospektivy, proto se objevují historické entity
#   (Czechoslovakia, USSR, Yugoslavia…) – nechávají se tak, jak je uvádí archiv,
# - koprodukce = film se dvěma a více produkčními zeměmi.
#
# Spuštění:  python scrape_film_archive.py
# Trvá několik minut (zdvořilá prodleva 0,15 s mezi požadavky).

import json
import re
import time
import urllib.request
from collections import Counter
from pathlib import Path

BASE = 'https://www.kviff.com/en/programme/archive-of-films/{year}/{letter}'
LETTERS = list('abcdefghijklmnopqrstuvwxyz') + ['*']
YEARS = [y for y in range(1992, 2027) if y not in (1993, 2020)]
UA = 'Mozilla/5.0 (DataTimes research; kontakt: datovazurnalistika@gmail.com)'
OUT = Path(__file__).parent

# Titul je v archivu nad řádkem "Directed by:"; struktura HTML se může měnit,
# proto se parsuje defenzivně: řádek režie nese vše podstatné.
ENTRY_RE = re.compile(
    r'Directed by:\s*(?P<directors>[^/<]*)/\s*(?P<tail>[^<]+)'
)
TAIL_RE = re.compile(r'^(?P<countries>.*?),\s*(?P<prodyear>\d{4})(?:,|$)')
TITLE_BLOCK_RE = re.compile(
    r'class="film-name"[^>]*>(?P<title>[^<]+)</a>', re.I
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', errors='replace')


def parse_page(html: str):
    films = []
    # bloky filmů: rozsekat po výskytech "Directed by:" a k nim dohledat titul zpětně
    positions = [m.start() for m in re.finditer(r'Directed by:', html)]
    for i, pos in enumerate(positions):
        chunk_start = positions[i - 1] if i > 0 else max(0, pos - 4000)
        before = html[chunk_start:pos]
        after = html[pos:pos + 600]
        m = ENTRY_RE.search(after)
        if not m:
            continue
        tail = m.group('tail').replace('&nbsp;', ' ').strip()
        tm = TAIL_RE.match(tail)
        if not tm:
            continue
        countries = [c.strip() for c in tm.group('countries').split(',') if c.strip()]
        titles = TITLE_BLOCK_RE.findall(before)
        title = titles[-1].strip() if titles else ''
        films.append({
            'title': title,
            'countries': countries,
            'prodYear': int(tm.group('prodyear')),
        })
    return films


def main():
    raw = {}
    for year in YEARS:
        year_films = []
        seen = set()
        for letter in LETTERS:
            url = BASE.format(year=year, letter=letter)
            try:
                html = fetch(url)
            except Exception as e:  # stránka písmene nemusí existovat
                print(f'  {year}/{letter}: {e}')
                continue
            for f in parse_page(html):
                key = (f['title'], tuple(f['countries']), f['prodYear'])
                if key in seen:
                    continue
                seen.add(key)
                year_films.append(f)
            time.sleep(0.15)
        raw[year] = year_films
        print(f'{year}: {len(year_films)} filmu')

    (OUT / 'film_archive_raw.json').write_text(
        json.dumps(raw, ensure_ascii=False), encoding='utf-8')

    history = []
    for year, films in raw.items():
        occ = Counter()
        coprod = 0
        withc = 0
        for f in films:
            cs = f['countries']
            if not cs:
                continue
            withc += 1
            if len(cs) >= 2:
                coprod += 1
            for c in cs:
                occ[c] += 1
        history.append({
            'year': int(year),
            'films': len(films),
            'filmsWithCountry': withc,
            'coproductions': coprod,
            'countryOccurrences': sum(occ.values()),
            'avgCountriesPerFilm': round(sum(occ.values()) / withc, 2) if withc else None,
            'coproductionShare': round(100 * coprod / withc, 1) if withc else None,
            'countries': dict(occ.most_common()),
        })

    (OUT / 'countries_history.json').write_text(
        json.dumps(history, ensure_ascii=False, indent=1), encoding='utf-8')
    print('hotovo:', OUT / 'countries_history.json')


if __name__ == '__main__':
    main()

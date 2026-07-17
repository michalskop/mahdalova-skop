# -*- coding: utf-8 -*-
"""
KROK 0 – čištění dat pro mapu zemí KVIFF 1992–2026.

Vstup:  countries_map_raw.tsv  (export s českými názvy ve sloupci Země
                                a stabilním anglickým klíčem v DetailKey)
Výstup: countries_map_clean.json  (agregovaná roční data po zemích)
        countries_map_clean.tsv   (kontrolní tabulka)
        + report na stdout

Zásadní: agreguje se podle DetailKey (anglický klíč), NE podle českého názvu –
v překladu jsou kolize (např. Irák přeložený omylem jako „Írán" by se slil
se skutečným Íránem).

Spuštění:  python clean_countries_map.py
"""

import csv
import io
import json
import sys
from collections import defaultdict
from pathlib import Path

import ftfy

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = Path(__file__).parent
RAW = HERE / "countries_map_raw.tsv"
OUT_JSON = HERE / "countries_map_clean.json"
OUT_TSV = HERE / "countries_map_clean.tsv"

# Sloupce (pozor: dva sloupce se jmenují "První účast na KVIFF" – první je
# datum 07.01.RRRR, kde RRRR je rok ŘÁDKU; jedenáctý je skutečný rok první
# účasti). Čteme pozičně.
COL_ROW_DATE = 0
COL_COUNTRY_CS = 1
COL_LAT = 2
COL_LON = 3
COL_APPEARANCES = 4     # roční hodnota; duplicitní řádky (země+rok) se SČÍTAJÍ
COL_TOTAL = 5           # informativní, přepočítáme vlastní
COL_CUMULATIVE = 6      # NEPOUŽÍVÁME, přepočítává se nanovo
COL_COPROD_SHARE = 7
COL_COPROD_CZ = 8
COL_CONTINENT = 9
COL_FIRST_YEAR = 10
COL_LAST_YEAR = 11
COL_PEAK_YEAR = 12
COL_TOP_PARTNERS = 13
COL_SAMPLE_FILMS = 14
COL_DETAIL_KEY = 15

TEXT_COLS = [COL_COUNTRY_CS, COL_TOP_PARTNERS, COL_SAMPLE_FILMS, COL_DETAIL_KEY]

# Ručně potvrzené opravy tagování kontinentu
CONTINENT_FIXES = {
    "Gabon": ("Austrálie", "Afrika"),
}

# Opravy překlepů/chybných překladů v českých názvech (klíč = DetailKey).
# Irák: v datech omylem "Írán" – kolize se skutečným Íránem.
NAME_FIXES = {
    "Iraq": "Irák",
    "Czechoslovakia": "Československo",   # v datech překlep "Českolosvensko"
    "Kyrgyzstan": "Kyrgyzstán",           # v datech "Kyrgysztán"
    "Iraqi Kurdistan": "Irácký Kurdistán",  # v datech "Kurdistán" – kolize s Kurdistan (2003)
    "Taiwan": "Tchaj-wan",
    "Myanmar": "Myanmar",                 # sjednotí i řádky původní Barmy po sloučení
}

# Sloučení historických/dvojích záznamů téže země (schváleno 2026-07-14).
KEY_MERGES = {
    "Burma": "Myanmar",
}


def fix_text(value: str) -> str:
    fixed = ftfy.fix_text(value)
    # ftfy je konzervativní u řetězců mísících platný Unicode s mojibake –
    # zbylé "Â " je rozbitá pevná mezera (např. "Franz Kafka's AÂ Country").
    fixed = fixed.replace("Â ", " ")
    return fixed.replace(" ", " ").strip()


def parse_int(value: str, default: int = 0) -> int:
    value = value.strip()
    if not value:
        return default
    return int(value)


def main() -> None:
    if not RAW.exists():
        sys.exit(f"CHYBA: vstupní soubor {RAW.name} neexistuje.")

    rows = []
    ftfy_changes = []
    with RAW.open(encoding="utf-8", newline="") as fh:
        reader = csv.reader(fh, delimiter="\t")
        header = next(reader)
        for line_no, row in enumerate(reader, start=2):
            if not row or not row[COL_COUNTRY_CS].strip():
                continue
            for col in TEXT_COLS:
                original = row[col]
                fixed = fix_text(original)
                if fixed != original.strip():
                    ftfy_changes.append((line_no, header[col], original.strip(), fixed))
                row[col] = fixed
            rows.append(row)

    print(f"Načteno {len(rows)} datových řádků.")

    # kontrola: zbylo něco podezřelého po ftfy?
    suspicious = []
    for row in rows:
        for col in TEXT_COLS:
            if any(marker in row[col] for marker in ("Ã", "â€", "Â", "&amp;", "&#")):
                suspicious.append((row[COL_DETAIL_KEY], row[col]))

    # opravy kontinentů (zalogované)
    continent_log = []
    for row in rows:
        key = row[COL_DETAIL_KEY]
        if key in CONTINENT_FIXES:
            wrong, right = CONTINENT_FIXES[key]
            if row[COL_CONTINENT].strip() == wrong:
                continent_log.append(f"{key}: kontinent '{wrong}' -> '{right}'")
                row[COL_CONTINENT] = right

    # sloučení klíčů (zalogované) – např. Burma -> Myanmar
    merge_log = []
    for row in rows:
        key = row[COL_DETAIL_KEY]
        if key in KEY_MERGES:
            if key not in [m[0] for m in merge_log]:
                merge_log.append((key, KEY_MERGES[key]))
            row[COL_DETAIL_KEY] = KEY_MERGES[key]

    # opravy českých názvů (zalogované)
    name_log = []
    for row in rows:
        key = row[COL_DETAIL_KEY]
        if key in NAME_FIXES and row[COL_COUNTRY_CS] != NAME_FIXES[key]:
            if (key, row[COL_COUNTRY_CS]) not in [(k, o) for k, o, _ in name_log]:
                name_log.append((key, row[COL_COUNTRY_CS], NAME_FIXES[key]))
            row[COL_COUNTRY_CS] = NAME_FIXES[key]

    # agregace duplicit (DetailKey + rok) součtem appearances
    by_key_year = defaultdict(list)
    for row in rows:
        year = int(row[COL_ROW_DATE].strip().split(".")[-1])
        by_key_year[(row[COL_DETAIL_KEY], year)].append(row)

    duplicates = {k: len(v) for k, v in by_key_year.items() if len(v) > 1}

    countries = {}
    meta_variants = defaultdict(list)  # key -> [(coprod_share, total, partners, films, coprod_cz)]
    for (key, year), group in sorted(by_key_year.items()):
        appearances = sum(parse_int(r[COL_APPEARANCES]) for r in group)
        meta = group[0]
        entry = countries.setdefault(key, {
            "key": key,
            "country_cs": meta[COL_COUNTRY_CS],
            "lat": float(meta[COL_LAT]),
            "lon": float(meta[COL_LON]),
            "continent": meta[COL_CONTINENT].strip(),
            "years": {},
        })
        entry["years"][year] = appearances
        for r in group:
            variant = (r[COL_COPROD_SHARE].strip(), parse_int(r[COL_TOTAL]),
                       r[COL_TOP_PARTNERS].strip(), r[COL_SAMPLE_FILMS].strip(),
                       parse_int(r[COL_COPROD_CZ]))
            if variant not in meta_variants[key]:
                meta_variants[key].append(variant)

    # kumulativní součty a odvozená metadata nanovo z agregovaných dat
    # (u sloučených zemí – Barma+Myanmar – by původní sloupce lhaly)
    for key, entry in countries.items():
        cumulative = 0
        cumulative_by_year = {}
        for year in sorted(entry["years"]):
            cumulative += entry["years"][year]
            cumulative_by_year[year] = cumulative
        entry["cumulative"] = cumulative_by_year
        entry["total"] = cumulative
        entry["first_year"] = min(entry["years"])
        entry["last_year"] = max(entry["years"])
        peak_year = max(sorted(entry["years"]), key=lambda y: entry["years"][y])
        entry["peak_year"] = f"{peak_year} ({entry['years'][peak_year]})"

        variants = meta_variants[key]
        entry["coprod_cz"] = sum(v[4] for v in variants)
        partners = [v[2] for v in variants if v[2]]
        films = [v[3] for v in variants if v[3]]
        entry["top_partners"] = "; ".join(dict.fromkeys(partners))
        entry["sample_films"] = "; ".join(dict.fromkeys(films))
        # podíl koprodukcí: u sloučených zemí vážený průměr podle počtu filmů
        weighted = [(float(v[0].replace("%", "").replace(",", ".").strip()), v[1])
                    for v in variants if v[0] and v[1]]
        if len(weighted) == 1:
            entry["coprod_share"] = variants[0][0] or ""
        elif weighted:
            share = sum(p * t for p, t in weighted) / sum(t for _, t in weighted)
            entry["coprod_share"] = f"{share:.1f} %".replace(".", ",")
        else:
            entry["coprod_share"] = ""

    # nepřeložené názvy: český název == anglický klíč (a nejde o shodu typu Peru)
    naturally_same = {
        "Peru", "Chile", "Paraguay", "Uruguay", "Argentina", "Guatemala",
        "Kosovo", "Malta", "Gabon", "USA", "Hong Kong", "Vietnam", "Myanmar",
        "Kurdistan", "Taiwan", "Monaco",
    }
    untranslated = sorted(
        e["key"] for e in countries.values()
        if e["country_cs"] == e["key"] and e["key"] not in naturally_same
    )

    # kolize: dva různé klíče se stejným českým názvem
    cs_to_keys = defaultdict(set)
    for e in countries.values():
        cs_to_keys[e["country_cs"]].add(e["key"])
    collisions = {cs: keys for cs, keys in cs_to_keys.items() if len(keys) > 1}

    # ---- výstupy ----
    OUT_JSON.write_text(
        json.dumps(list(countries.values()), ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    with OUT_TSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh, delimiter="\t")
        writer.writerow(["key", "country_cs", "continent", "year",
                         "appearances", "cumulative"])
        for entry in sorted(countries.values(), key=lambda e: e["key"]):
            for year in sorted(entry["years"]):
                writer.writerow([entry["key"], entry["country_cs"],
                                 entry["continent"], year,
                                 entry["years"][year], entry["cumulative"][year]])

    # ---- report ----
    print(f"\n=== ftfy opravy ({len(ftfy_changes)} změněných buněk) ===")
    seen = set()
    shown = 0
    for _line, _col, orig, fixed in ftfy_changes:
        sig = (orig[:50], fixed[:50])
        if sig in seen:
            continue
        seen.add(sig)
        print(f"  '{orig[:60]}' -> '{fixed[:60]}'")
        shown += 1
        if shown >= 20:
            print(f"  ... (unikátních vzorů celkem {len(set((o, f) for _, _, o, f in ftfy_changes))})")
            break

    print(f"\n=== Podezřelé zbytky po ftfy: {len(suspicious)} ===")
    for key, text in suspicious[:10]:
        print(f"  {key}: {text[:100]}")

    print("\n=== Opravy kontinentů ===")
    for line in continent_log or ["(žádné)"]:
        print(f"  {line}")

    print("\n=== Sloučení zemí ===")
    for old, new in merge_log or []:
        merged = countries[new]
        print(f"  {old} -> {new}: roky {sorted(merged['years'])}, "
              f"celkem {merged['total']}, koprodukce {merged['coprod_share']}")
    if not merge_log:
        print("  (žádné)")

    print("\n=== Opravy českých názvů ===")
    for key, old, new in name_log or []:
        print(f"  {key}: '{old}' -> '{new}'")
    if not name_log:
        print("  (žádné)")

    print(f"\n=== Kolize českých názvů (po opravách): {len(collisions)} ===")
    for cs, keys in collisions.items():
        print(f"  '{cs}' <- {sorted(keys)}")

    print(f"\n=== Zůstává v angličtině ({len(untranslated)}) ===")
    for key in untranslated:
        print(f"  {key}")

    print(f"\n=== Agregace duplicit: {len(duplicates)} kombinací země+rok mělo víc řádků ===")
    for (key, year), count in sorted(duplicates.items()):
        merged = countries[key]["years"][year]
        print(f"  {key} {year}: {count} řádky -> součet {merged}")

    print("\n=== Souhrn ===")
    print(f"  zemí: {len(countries)}")
    print(f"  kombinací země+rok: {len(by_key_year)} (z {len(rows)} řádků)")
    years_all = sorted({y for e in countries.values() for y in e["years"]})
    print(f"  roky v datech: {years_all[0]}–{years_all[-1]}")
    present = set(years_all)
    gaps = [y for y in range(years_all[0], years_all[-1] + 1) if y not in present]
    print(f"  roky bez jediného záznamu (kandidáti na výpadky festivalu): {gaps}")
    total_all = sum(e["total"] for e in countries.values())
    print(f"  součet všech výskytů: {total_all}")
    by_continent = defaultdict(int)
    for e in countries.values():
        by_continent[e["continent"]] += e["total"]
    for continent, total in sorted(by_continent.items()):
        print(f"    {continent}: {total}")

    print(f"\nZapsáno: {OUT_JSON.name}, {OUT_TSV.name}")


if __name__ == "__main__":
    main()

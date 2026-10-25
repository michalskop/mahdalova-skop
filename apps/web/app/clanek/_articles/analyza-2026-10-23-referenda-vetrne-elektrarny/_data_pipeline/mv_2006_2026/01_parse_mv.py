# -*- coding: utf-8 -*-
"""
Krok 1: převede neuklizenou tabulku MV ČR „Místní referenda v ČR (od r. 2006)“
na seznam otázek (jeden řádek = jedna otázka).

Vstup:  ../zapisy/MV_mistni-referenda-tabulka-hlaseni-20260708.xlsx (list List1, aktualizováno k 16. 10. 2026)
Výstup: mv_otazky_vsechny.csv (UTF-8 s BOM, středník)

Pravidla:
- Řádek s číslem ve sloupci A = nové referendum (č. MV).
- Řádek bez čísla, ale s textem otázky = pokračovací řádek (další otázka téhož referenda);
  obec, datum, oprávnění a účast se přebírají z hlavního řádku, pokud v pokračovacím chybí.
  Výjimka: řádek bez čísla, ale s vlastní obcí (Lešná, ř. 330) = samostatné referendum bez čísla.
- Datum: datetime → ISO; text („03.-04.10.2025“, „20. -21.10.2006“) → první a poslední den.
- ANO/NE: text „počet (%)“ → počet a procento; víc otázek v buňce („ad 1) … ad 2) …“)
  se zde NErozkládá – zůstává surový text a příznak `vice_otazek_v_bunce` (řeší se ručně v kroku 2).
Spouštět: python 01_parse_mv.py  (bez -I, pandas/openpyxl jsou v uživatelském site-packages)
"""
import re
import datetime as dt
from pathlib import Path

import openpyxl
import pandas as pd

BASE = Path(__file__).resolve().parent.parent
SRC = BASE / "zapisy" / "MV_mistni-referenda-tabulka-hlaseni-20260708.xlsx"
OUT = Path(__file__).resolve().parent / "mv_otazky_vsechny.csv"


def clean(s):
    if s is None:
        return None
    s = str(s).replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s or None


def parse_obec(s):
    """'Mikuleč (Svitavy, PAK)' -> ('Mikuleč', 'Svitavy', 'PAK')"""
    s = clean(s)
    if not s:
        return None, None, None
    m = re.match(r"^(.*?)\s*\(([^()]*),\s*([^(),]+)\)\s*$", s)
    if m:
        return m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
    return s, None, None


def parse_datum(v):
    """Vrátí (datum_od, datum_do, surový text)."""
    if v is None:
        return None, None, None
    if isinstance(v, dt.datetime):
        d = v.date().isoformat()
        return d, d, d
    s = clean(v)
    # najdi poslední úplné datum d.m.yyyy
    full = re.findall(r"(\d{1,2})\.\s*(\d{1,2})\.?\s*(\d{4})", s)
    if not full:
        return None, None, s
    d2, m2, y2 = full[-1]
    do = dt.date(int(y2), int(m2), int(d2))
    # první den: číslo na začátku řetězce
    m1 = re.match(r"^\s*(\d{1,2})\.\s*(?:(\d{1,2})\.)?\s*[-–]", s)
    if m1:
        mon = int(m1.group(2)) if m1.group(2) else do.month
        od = dt.date(do.year, mon, int(m1.group(1)))
    else:
        d1, m1_, y1 = full[0]
        od = dt.date(int(y1), int(m1_), int(d1))
    return od.isoformat(), do.isoformat(), s


def parse_ucast(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v) * 100 if v <= 1.5 else float(v)
    s = clean(v)
    if not s:
        return None
    s = s.replace(",", ".").replace("%", "")
    try:
        x = float(s)
        return x * 100 if x <= 1.5 else x
    except ValueError:
        return None


def parse_int(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return int(v)
    s = re.sub(r"[\s ]", "", str(v))
    return int(s) if s.isdigit() else None


RE_HLASY = re.compile(r"^\s*(\d[\d ]*?)\s*\(\s*(\d+(?:[.,]\d+)?)\s*%?\s*\)?\s*$")


def parse_hlasy(v):
    """'1 041 (75,38 %)' -> (1041, 75.38). Číslo bez závorky -> (n, None)."""
    if v is None:
        return None, None
    if isinstance(v, (int, float)):
        return int(v), None
    s = clean(v)
    m = RE_HLASY.match(s)
    if m:
        return int(m.group(1).replace(" ", "")), float(m.group(2).replace(",", "."))
    if re.fullmatch(r"\d[\d ]*", s):
        return int(s.replace(" ", "")), None
    return None, None


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb["List1"]
    rows = []
    cur = None
    q_in_ref = 0
    for i, r in enumerate(ws.iter_rows(min_row=3, values_only=True), start=3):
        r = list(r[:10])
        a = r[0]
        if isinstance(a, str) and a.startswith("Aktualizováno"):
            break
        if all(x is None for x in r):
            continue
        # nové referendum = vyplněná obec (sl. B); číslo v sl. A bez obce (Lešná, ř. 331)
        # je pokračovací řádek, číslo se připíše k referendu
        is_new = r[1] is not None
        if not is_new and isinstance(a, (int, float)) and cur is not None and cur["mv_c"] is None:
            cur["mv_c"] = int(a)
            for prev in rows:
                if prev["mv_radek"] == cur["mv_radek"]:
                    prev["mv_c"] = int(a)
        if is_new:
            obec, okres, kraj = parse_obec(r[1])
            od, do, draw = parse_datum(r[3])
            cur = dict(
                mv_c=int(a) if isinstance(a, (int, float)) else None,
                mv_radek=i,
                obec_mv=obec, okres_mv=okres, kraj_mv=kraj,
                datum_od=od, datum_do=do, datum_raw=draw,
                opravneni=parse_int(r[4]),
                ucast_pct_mv=parse_ucast(r[5]),
                platnost_mv=clean(r[6]),
            )
            q_in_ref = 1
        else:
            if cur is None:
                continue
            q_in_ref += 1
        ano_n, ano_p = parse_hlasy(r[7])
        ne_n, ne_p = parse_hlasy(r[8])
        rec = dict(cur)
        rec.update(
            radek=i,
            otazka_poradi=q_in_ref,
            otazka=clean(r[2]),
            # pokračovací řádek může mít vlastní platnost/účast (např. ř. 247)
            platnost_mv=clean(r[6]) if (not is_new and r[6] is not None) else cur["platnost_mv"],
            ucast_pct_mv=parse_ucast(r[5]) if (not is_new and r[5] is not None) else cur["ucast_pct_mv"],
            ano_raw=clean(r[7]), ne_raw=clean(r[8]),
            ano_n=ano_n, ano_pct=ano_p, ne_n=ne_n, ne_pct=ne_p,
            zavaznost_raw=clean(r[9]),
            vice_otazek_v_bunce=bool(re.search(r"ad\s*\d", clean(r[7]) or "", re.I)),
            # textové poznámky MV (zrušení, soudní rozhodnutí) – nečíselný text ve sl. E–G
            # nebo zmínka „zruš…/neplatn…“ v otázce či závaznosti
            poznamka_mv=" | ".join(
                t for t in (
                    [clean(x) for x in r[4:7] if isinstance(x, str) and parse_int(x) is None
                     and parse_ucast(x) is None and clean(x) not in ("ANO", "NE")]
                    + [m.group(0) for x in (r[2], r[9]) if isinstance(x, str)
                       for m in [re.search(r"(Zrušeno|zrušeno|BYLO ZRUŠENO|neplatné).*$", clean(x))] if m]
                ) if t
            ) or None,
        )
        rows.append(rec)
    df = pd.DataFrame(rows)
    df.to_csv(OUT, sep=";", index=False, encoding="utf-8-sig", decimal=",")
    print(f"otázek: {len(df)}, referend (č. MV): {df['mv_c'].nunique()}, "
          f"nečíslovaných hlavních řádků: {df.loc[df.mv_c.isna() & (df.otazka_poradi == 1)].shape[0]}")
    print("nerozparsované datum:", df.loc[df.datum_od.isna(), ['radek', 'datum_raw']].drop_duplicates().to_string())


if __name__ == "__main__":
    main()

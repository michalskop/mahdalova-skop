"""Řady pro motiv coveru, carousel a animaci: index počtu obyvatel kolem začátku genocidy (rok před = 100).

Čísla se nepřepisují ručně: bere je funkce rady() z ../_data_pipeline/krivky.py, která počítá z
../_data_pipeline/zdroj/worldbank_SP.POP.TOTL.json (Světová banka WDI, ukazatel SP.POP.TOTL; odhady UN WPP 2024).
Výstup: krivky.json vedle tohoto souboru (čte ho motiv.cjs).
Spuštění: python -I krivky_export.py
"""
import json
import sys
from pathlib import Path

TU = Path(__file__).resolve().parent
sys.path.insert(0, str(TU.parent / "_data_pipeline"))
from krivky import PRIPADY, PRED, PO, rady  # noqa: E402

out = {
    "zdroj": "Světová banka, WDI SP.POP.TOTL (odhady UN World Population Prospects 2024); "
    "spočítáno v _data_pipeline/krivky.py, funkce rady()",
    "od": -PRED,
    "do": PO,
    "pripady": [{"zeme": z, "rok0": r0, "skupina": s} for _, z, r0, s in PRIPADY],
    "rady": rady(),
}
(TU / "krivky.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
for p in out["pripady"]:
    r = [x for x in out["rady"] if x["zeme"] == p["zeme"]]
    print(p["zeme"], p["rok0"], " ".join(f"{x['t']:+d}:{x['index']}" for x in r))

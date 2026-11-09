"""Cover data: STAN share in the 30 largest towns, 2022 and 2026 (same metric as the article and its charts).

Input: koalice30_detail.csv from sila-stran-kv/koalice_30.py (coalition votes split by who nominated the elected).
Run:   python _cover_pipeline/mesta.py [path/to/koalice30_detail.csv]
Output: _cover_pipeline/mesta.json  [{nazev, obyv, stan22, stan26}]
"""
import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / (
    "Desktop/Mahdalova & Skop/Volby/Volby - predikce/Predikce - komunální a senát 2026/"
    "sila-stran-kv/vystupy/koalice30_detail.csv")

rows = [r for r in csv.DictReader(open(SRC, encoding="utf-8-sig")) if r["strana"] == "STAN"]
out = [{"nazev": r["obec"], "obyv": int(r["obyv"]), "stan22": float(r["pct_mand_22"] or 0),
        "stan26": float(r["pct_mand_26"] or 0)} for r in rows]
if len(out) != 30:
    raise SystemExit(f"expected 30 towns, got {len(out)}")
(HERE / "mesta.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"{len(out)} towns; STAN up in {sum(o['stan26'] > o['stan22'] for o in out)}, "
      f"zero in both years {sum(o['stan26'] == 0 and o['stan22'] == 0 for o in out)}")

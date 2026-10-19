"""Interaktivní mapa síly stran v obcích (images/mapa-stran.html) ze sablona-mapa.html.

Vstupy: mapa_data.json (z build.py: za každou obec a stranu, která tam kandidovala, [křesla, zastoupení voliči]),
poloha obcí z ../_cover_pipeline/body.json (body.py) a obrys republiky z teček mapy článku o predikci senátu.
Spuštění: python mapa.py (po build.py a body.py)
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).parent
ART = HERE.parent
d = json.loads((HERE / "mapa_data.json").read_text(encoding="utf-8"))
poloha = {b["kod"]: (b["lon"], b["lat"]) for b in json.loads((ART / "_cover_pipeline" / "body.json").read_text(encoding="utf-8"))}
dots = json.loads((ART.parent / "volby-cr-2026-10-10-senat-komunalni-2026-predikce" / "senat-mapa.json").read_text(encoding="utf-8"))["dots"]

chybi = [o["n"] for k, o in d["obce"].items() if k not in poloha]
for k, o in d["obce"].items():
    if k in poloha:
        o["x"], o["y"] = poloha[k]
d["obce"] = {k: o for k, o in d["obce"].items() if "x" in o}
d["dots"] = [[lo, la] for lo, la, *_ in dots]
data = "window.DATA=" + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";"
sab = (HERE / "sablona-mapa.html").read_text(encoding="utf-8")
(ART / "images" / "mapa-stran.html").write_text(sab.replace("/*DATA*/", data), encoding="utf-8")
print("obcí v mapě:", len(d["obce"]), "| bez polohy:", chybi)
for s, v in d["souhrn"].items():
    print(f"  {s:20} {v}")

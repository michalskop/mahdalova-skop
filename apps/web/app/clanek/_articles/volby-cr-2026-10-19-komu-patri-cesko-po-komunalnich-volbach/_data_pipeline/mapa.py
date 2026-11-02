"""Data mapy síly stran v obcích pro <ObceVoliciMap> (../mapa-stran.json, build.py → mapa_data.json).

Mapa kreslí hranice obcí ze sdílené geometrie (volby-cr-2026-09-24-…/obce-geo.json, volební okrsky ČSÚ 2022
sloučené do obcí) a do každé obce, kde strana kandidovala, puntík: plocha ∝ voliči, které tam zastupují
její zastupitelé, prázdný kroužek = kandidovala bez křesla. Klíče obcí = kód obce jako v geometrii.
Spuštění: python mapa.py (po build.py)
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).parent
ART = HERE.parent
d = json.loads((HERE / "mapa_data.json").read_text(encoding="utf-8"))
geo = json.loads((ART.parent / "volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence" / "obce-geo.json").read_text(encoding="utf-8"))
v_geo = {str(g.get("id") or g["properties"]["id"]) for g in geo["objects"]["obce"]["geometries"]}

chybi = [o["n"] for k, o in d["obce"].items() if k not in v_geo]
(ART / "mapa-stran.json").write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("obcí v mapě:", len(d["obce"]), "| bez geometrie:", chybi)
for s, v in d["souhrn"].items():
    print(f"  {s:20} {v}")

# Přidá příspěvek do online reportáže (zive.json) a obnoví odhad pro mapu.
# python pridej_prispevek.py "<text>" [screenshot.png] [nazev-souboru] [alt]
# Screenshot se uloží jako images/zive/<nazev>-HHMM.jpg (JPEG 85 %, max. šířka 1400 px).
import datetime, json, os, subprocess, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
text = sys.argv[1]
src = sys.argv[2] if len(sys.argv) > 2 else None
name = sys.argv[3] if len(sys.argv) > 3 else "prispevek"
alt = sys.argv[4] if len(sys.argv) > 4 else ""

now = datetime.datetime.now()
cas = now.strftime("%H:%M")
item = {"cas": cas, "text": text}
if src:
    im = Image.open(src).convert("RGB")
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    rel = f"images/zive/{name}-{now.strftime('%H%M')}.jpg"
    im.save(os.path.join(HERE, rel), "JPEG", quality=85, optimize=True)
    item.update({"obrazek": rel, "alt": alt})

f = os.path.join(HERE, "zive.json")
d = json.load(open(f, encoding="utf-8"))
d["zive"].append(item)
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("přidáno", cas, item.get("obrazek", ""))
subprocess.run([sys.executable, os.path.join(HERE, "aktualizuj_odhad.py")], check=False)

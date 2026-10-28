"""Podíl žen v dolních komorách parlamentů zemí EU podle IPU Parline (stránky https://www.ipu.org/parlement/<KOD>, stažené 28. 10. 2026).
Vstup: adresář s uloženými stránkami <KOD>.html (27 států EU). Výstup: data/ipu_eu.csv, vystup_ipu.txt.
Použití: python -X utf8 -I ipu_eu.py [adresář, výchozí C:/tmp/dpbp-06/raw/ipu]"""
import csv, glob, html, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
raw = sys.argv[1] if len(sys.argv) > 1 else "C:/tmp/dpbp-06/raw/ipu"
rows = []
for f in sorted(glob.glob(os.path.join(raw, "*.html"))):
    t = open(f, encoding="utf-8", errors="replace").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"\s+", " ", t)
    pct = re.search(r"Women in parliament ([\d.]+)% of MPs", t)
    last = re.search(r"Last election ([A-Za-z]+ \d{4})", t)
    n = re.search(r"Number of MPs (\d+)", t)
    rows.append([os.path.basename(f)[:2], float(pct.group(1)), last.group(1), int(n.group(1))])
rows.sort(key=lambda r: -r[1])
with open(os.path.join(here, "data", "ipu_eu.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh)
    w.writerow(["kod", "podil_zen_pct", "posledni_volby", "pocet_poslancu", "poradi"])
    for i, r in enumerate(rows, 1):
        w.writerow(r + [i])
cz = next(i for i, r in enumerate(rows, 1) if r[0] == "CZ")
msg = f"Zemí EU: {len(rows)}; Česko {rows[cz - 1][1]} % je na {cz}. místě. Prvních 3: {rows[:3]}; posledních 3: {rows[-3:]}"
open(os.path.join(here, "vystup_ipu.txt"), "w", encoding="utf-8").write(msg + "\n")
print(msg)

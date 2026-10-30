"""Článek 08 – vyhledá v programech stran a ve vládním prohlášení pasáže, o které se text opírá.

Spuštění: python -X utf8 -I citace_programu.py <složka_s_PDF_a_html>
Očekává soubory: ano.pdf, spolu.pdf, stan.pdf, pirati.pdf (viz README) a vlada.html.
Výstup: data/citace_programu.txt (číslo PDF stránky + řádky s hledanými výrazy).
Kontroluje také, že v programech chybí zmínka o plodnosti a o cílové hodnotě 2,1.
"""
import html
import os
import re
import sys

import pymupdf

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "citace_programu.txt")

PATTERNS = {
    "rodičovský příspěvek": r"rodičovsk\w+ příspěv|rodičovsk\w+ 400|rodičovského příspěvku",
    "předškolní péče": r"školk|jesl|dětsk\w+ skupin|předškoln|mateřsk",
    "první bydlení mladých": r"hypot|akontac|prvního bydlení|první bydlení|bezúročn",
    "pracovní migrace": r"zahraničních pracovn|pracovní víz|bodový systém|potřeby trhu práce|zaměstnávání cizinc",
    "plodnost / porodnost": r"plodnost|porodnost|dětí na ženu|2,1\b",
}

out = []


def scan(name, pages):
    out.append(f"##### {name}")
    for label, pat in PATTERNS.items():
        hits = []
        for no, text in pages:
            flat = re.sub(r"\s+", " ", text.replace("­", ""))
            for m in re.finditer(pat, flat, flags=re.I):
                a = max(0, m.start() - 110)
                b = min(len(flat), m.end() + 160)
                hits.append(f"  s. {no}: …{flat[a:b]}…")
        out.append(f"== {label}: {len(hits)} zásahů")
        out.extend(hits[:6])


for name in ("ano", "spolu", "stan", "pirati"):
    doc = pymupdf.open(os.path.join(SRC, f"{name}.pdf"))
    scan(name.upper(), [(i + 1, p.get_text()) for i, p in enumerate(doc)])

t = open(os.path.join(SRC, "vlada.html"), encoding="utf-8", errors="replace").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
t = re.sub(r"</(p|li|h\d|div)>", "\n", t)
t = html.unescape(re.sub("<[^>]+>", "", t))
scan("PROGRAMOVÉ PROHLÁŠENÍ VLÁDY (HTML, bez stran)", [("-", t)])

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("\n".join(out)[:6000])

"""Sestaví článek 06-zeny-rozhodovani.html: do sablona.html vloží dva SVG grafy v paletě webu (DESIGN.md) a upraví pevné mezery.
Data: data/snemovna_zeny_podle_voleb.csv (zeny_snemovna.py), ČSÚ (kraje 2024, obce 2026), IPU (Švédsko).
Použití: python -X utf8 -I build_html.py"""
import csv, os, re

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.normpath(os.path.join(here, "../../_content/01-demografie/articles/06-zeny-rozhodovani.html"))
NB = " "
INK, RED, TEAL, BEIGE, WASH, GRID, TXT = "#101432", "#de1743", "#0e839e", "#bcbcb0", "#f8f6f0", "#e8e8dc", "#333333"
FONT = "var(--font-roboto-condensed), Arial, sans-serif"


def cz(x, nd=1):
    return f"{x:.{nd}f}".replace(".", ",")


def svg_open(h, label):
    return (f'<svg viewBox="0 0 660 {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}" '
            f'style="width:100%;font-family:{FONT}"><rect width="660" height="{h}" fill="{WASH}" rx="6"/>')


# ---- A: podíl žen mezi zvolenými poslanci
data = list(csv.DictReader(open(os.path.join(here, "data", "snemovna_zeny_podle_voleb.csv"), encoding="utf-8")))
H, top, base, scale = 300, 70, 240, 3.2  # 50 % = 160 px
s = svg_open(H, "Podíl žen mezi zvolenými poslanci Poslanecké sněmovny 2002 až 2025 stoupl z 17 na 33,5 procenta")
s += f'<text x="20" y="28" font-size="17" font-weight="700" fill="{INK}">Po volbách 2025 je ve Sněmovně 33,5 % žen, předtím nejvíc 25 %</text>'
s += f'<text x="20" y="48" font-size="13" fill="{TXT}">Podíl žen mezi 200 zvolenými poslanci, volby 2002–2025</text>'
for v in (0, 25, 50):
    y = base - v * scale
    s += f'<line x1="60" y1="{y}" x2="640" y2="{y}" stroke="{GRID}" stroke-width="1"/><text x="54" y="{y + 4}" text-anchor="end" font-size="12" fill="{TXT}">{v}{NB}%</text>'
n = len(data)
slot = 560 / n
for i, r in enumerate(data):
    p, z, yr = float(r["podil_pct"]), int(r["zeny"]), r["rok"]
    x = 70 + i * slot + slot * 0.15
    w = slot * 0.7
    h = p * scale
    last = i == n - 1
    s += f'<rect x="{x:.1f}" y="{base - h:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{RED if last else BEIGE}" rx="2"/>'
    s += f'<text x="{x + w / 2:.1f}" y="{base - h - 18:.1f}" text-anchor="middle" font-size="14" font-weight="700" fill="{RED if last else INK}">{cz(p)}{NB}%</text>'
    s += f'<text x="{x + w / 2:.1f}" y="{base - h - 5:.1f}" text-anchor="middle" font-size="11" fill="{TXT}">{z}{NB}žen</text>'
    s += f'<text x="{x + w / 2:.1f}" y="{base + 18}" text-anchor="middle" font-size="13" fill="{INK}">{yr}</text>'
s += "</svg>"
svg_a = s

# ---- B: úrovně zastoupení žen (poslední dostupné volby)
bars = [("Švédsko, Riksdag (IPU, 2026)", 46.4, TEAL), ("Sněmovna (volby 2025)", 33.5, RED),
        ("Zastupitelstva obcí (2026)", 17810 / (17810 + 41289) * 100, RED), ("Zastupitelstva krajů (2024)", 145 / 685 * 100, RED)]
H = 250
s = svg_open(H, "Podíl žen: Švédsko 46,4 %, Sněmovna 33,5 %, obecní zastupitelstva 30,1 %, krajská zastupitelstva 21,2 %")
s += f'<text x="20" y="28" font-size="17" font-weight="700" fill="{INK}">Krajská zastupitelstva mají o více než třetinu méně žen než Sněmovna</text>'
s += f'<text x="20" y="48" font-size="13" fill="{TXT}">Podíl žen mezi zvolenými, poslední dostupné volby</text>'
x0, sc = 250, 7.0  # 50 % = 350 px do x=600
for v in (0, 25, 50):
    x = x0 + v * 7.0 * 1.0
    s += f'<line x1="{x}" y1="62" x2="{x}" y2="{H - 28}" stroke="{GRID}" stroke-width="1"/><text x="{x}" y="{H - 10}" text-anchor="middle" font-size="12" fill="{TXT}">{v}{NB}%</text>'
for i, (name, v, col) in enumerate(bars):
    y = 70 + i * 36
    s += f'<text x="{x0 - 10}" y="{y + 17}" text-anchor="end" font-size="13" fill="{INK}">{name}</text>'
    s += f'<rect x="{x0}" y="{y}" width="{v * sc:.1f}" height="26" fill="{col}" rx="2"/>'
    s += f'<text x="{x0 + v * sc + 7:.1f}" y="{y + 18}" font-size="14" font-weight="700" fill="{INK}">{cz(v)}{NB}%</text>'
s += "</svg>"
svg_b = s

html = open(os.path.join(here, "sablona.html"), encoding="utf-8").read()
html = html.replace("<!--SVG_A-->", svg_a).replace("<!--SVG_B-->", svg_b)


# ---- pevné mezery v textových uzlech (ne v tazích, atributech a stylech)
def fix(t):
    t = re.sub(r"(?<![\wÀ-ž])([AaIiKkOoSsUuVvZz]) (?=\S)", "\\1" + NB, t)
    t = re.sub(r"(?<![\d,])(\d{1,3}) (\d{3})(?!\d)", "\\1" + NB + "\\2", t)
    return t.replace(" %", NB + "%")


parts = re.split(r"(<style.*?</style>|<[^>]*>)", html, flags=re.S)
html = "".join(p if (p.startswith("<")) else fix(p) for p in parts)
open(out, "w", encoding="utf-8").write(html)
print(out, len(html))

"""Grafy kapitoly „Zdraví a délka života“ (Vega-Lite → ../data/*.json).

Čísla bere jen z cisla.json, které z primárních tabulek ČSÚ počítá cisla.py.
Spuštění:  python cisla.py && python grafy.py

Piktogramy: ikony Tabler (MIT, https://tabler.io/icons, outline, viewBox 24) převedené do
souřadnic −1…1, které Vega čeká u vlastního tvaru bodu (`shape` = SVG path).
"""
import json
from decimal import ROUND_HALF_UP, Decimal
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, INK, GRID, MUTED = "#de1743", "#6267a3", "#101432", "#d4d4c8", "#bcbcb0"
ZENY, MUZI = "#f76800", "#06677d"  # závazné barvy pohlaví (nikdy růžová × modrá)
PUB = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"

C = {k: {int(y): v for y, v in s.items()} for k, s in json.loads((HERE / "cisla.json").read_text(encoding="utf-8")).items()}
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    """Česky formátované číslo, zaokrouhlení half-up z desítkového zápisu (19,45 → 19,5)."""
    q = Decimal(str(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)
    return f"{q:,.{d}f}".replace(",", " ").replace(".", ",")


def base(title, subtitle, source, layers, height=260, values=None, extra=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "height": height,
         "config": {"view": {"stroke": None}, "scale": {"zero": False}},
         "layer": layers, "_source": source}
    if values is not None:
        s["data"] = {"values": values}
    if extra:
        s.update(extra)
    return s


def osa_x(domena, hodnoty):
    return {"field": "rok", "type": "quantitative", "scale": {"domain": list(domena)},
            "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
                     "values": list(hodnoty), "labelFontSize": 11}}


def osa_y(domena, hodnoty):
    return {"field": "v", "type": "quantitative", "scale": {"domain": list(domena)},
            "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
                     "values": list(hodnoty)}}


def rada(nazev, s, fmt, jednotka):
    return [{"rada": nazev, "rok": y, "v": v, "t": f"{cz(v, fmt)}{jednotka}"} for y, v in sorted(s.items())]


def cara(nazev, barva, xdom, xval, ydom, yval, dash=None, width=2.5):
    mark = {"type": "line", "color": barva, "strokeWidth": width, "interpolate": "monotone",
            "point": {"filled": True, "size": 16, "color": barva}}
    if dash:
        mark["strokeDash"] = dash
    return {"transform": [{"filter": f"datum.rada == '{nazev}'"}], "mark": mark,
            "encoding": {"x": osa_x(xdom, xval), "y": osa_y(ydom, yval),
                         "tooltip": [{"field": "rada", "title": "Řada"}, {"field": "rok", "title": "Rok"},
                                     {"field": "t", "title": "Hodnota"}]}}


def popisek(rok, v, text, barva=INK, align="left", baseline="bottom", dx=0, dy=-6, bold=True, size=11.5):
    return {"data": {"values": [{"rok": rok, "v": v, "text": text}]},
            "mark": {"type": "text", "align": align, "baseline": baseline, "dx": dx, "dy": dy,
                     "fontSize": size, "fontWeight": 700 if bold else 400, "color": barva},
            "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "v", "type": "quantitative"},
                         "text": {"field": "text"}}}


# ---------- Graf 1: naděje dožití ----------
M, Z = C["dozit_muzi"], C["dozit_zeny"]
v1 = rada("muži", M, 1, " let") + rada("ženy", Z, 1, " let")
xd, xv = (1989, 2025), (1989, 2000, 2010, 2025)
yd, yv = (64, 86), (65, 70, 75, 80, 85)
rok_m = min(y for y in M if M[y] > Z[1989])
g1 = base(f"Muži se dnes dožívají déle, než se v roce 1989 dožívaly {{ženy|{ZENY}}}",
          "Naděje dožití při narození v letech, 1989–2025",
          f"ČSÚ, [Česko od roku 1989 v číslech]({PUB})",
          [{"data": {"values": [{"v": Z[1989]}]}, "mark": {"type": "rule", "color": ZENY, "strokeDash": [3, 3], "opacity": 0.8},
            "encoding": {"y": {"field": "v", "type": "quantitative"}}},
           cara("ženy", ZENY, xd, xv, yd, yv),
           cara("muži", MUZI, xd, xv, yd, yv),
           popisek(1989, Z[1989], f"ženy v roce 1989: {cz(Z[1989])}", barva=ZENY, baseline="top", dy=6),
           popisek(1989, M[1989], f"muži {cz(M[1989])}", barva=MUZI, baseline="top", dy=8),
           popisek(2025, Z[2025], cz(Z[2025]), barva=ZENY, align="right", dy=-8),
           popisek(2025, M[2025], cz(M[2025]), barva=MUZI, align="right", baseline="top", dy=8),
           popisek(2021, M[2021], f"covid", barva="#333333", align="center", baseline="top", dy=8, bold=False, size=10.5),
           ], height=270, values=v1)
log("G1 dožití", "muži", M[1989], M[rok_m], rok_m, M[2021], M[2025], "ženy", Z[1989], Z[2025])

# ---------- Graf 2: příčiny smrti ----------
posl = max(C["obeh"])
R2 = [("nemoci oběhové soustavy", "obeh", CRIMSON, None), ("nádory", "novotvary", INK, None),
      ("z toho akutní infarkt", "infarkt", CRIMSON, [4, 3])]
v2 = []
for nazev, k, *_ in R2:
    v2 += rada(nazev, {y: v / 1000 for y, v in C[k].items()}, 1, " tis.")
xd, xv = (1989, posl), (1989, 2000, 2010, posl)
yd, yv = (0, 80), (0, 20, 40, 60, 80)
O, N, I = ({y: v / 1000 for y, v in C[k].items()} for k in ("obeh", "novotvary", "infarkt"))
ubytek = 100 * (1 - C["obeh"][posl] / C["obeh"][1989])
lay2 = [{"data": {"values": [{"rok": 1993.5}]}, "mark": {"type": "rule", "color": INK, "strokeDash": [2, 3], "opacity": 0.5},
         "encoding": {"x": {"field": "rok", "type": "quantitative"}}},
        popisek(1993.5, 80, "MKN-9 | MKN-10", align="center", baseline="top", dy=0, bold=False, size=10)]
for nazev, k, barva, dash in R2:
    lay2.append(cara(nazev, barva, xd, xv, yd, yv, dash=dash, width=2.5 if not dash else 2))
lay2 += [
    popisek(1989, O[1989], cz(O[1989]), barva=CRIMSON, baseline="top", dy=8),
    popisek(posl, O[posl], f"oběhová soustava {cz(O[posl])}", barva=CRIMSON, align="right", baseline="top", dy=8),
    popisek(posl, N[posl], f"nádory {cz(N[posl])}", align="right", baseline="bottom", dy=-8),
    popisek(1989, N[1989], cz(N[1989]), dy=-8),
    popisek(1989, I[1989], cz(I[1989]), barva=CRIMSON, dy=-8, bold=False),
    popisek(posl, I[posl], f"infarkt {cz(I[posl])}", barva=CRIMSON, align="right", dy=-8, bold=False),
]
g2 = base(f"Na nemoci srdce a cév umírá o {{{ubytek:.0f} %|{CRIMSON}}} lidí méně než v roce 1989, na nádory stejně",
          f"Zemřelí podle příčiny smrti v tisících, 1989–{posl}; do roku 1993 podle MKN-9, od roku 1994 podle MKN-10",
          f"ČSÚ, [Česko od roku 1989 v číslech]({PUB})",
          lay2, height=270, values=v2)
log("G2 příčiny", "oběh", C["obeh"][1989], C["obeh"][posl], f"−{ubytek:.1f} %", "nádory", C["novotvary"][1989], C["novotvary"][posl],
    "infarkt", C["infarkt"][1989], C["infarkt"][posl])


# ---------- Graf 3: piktogram – pití a kouření ----------
def tabler_do_vegy(d):
    """Převede SVG path z viewBoxu 0–24 do −1…1 (měřítko 1/12, posun −1)."""
    tok = re.findall(r"[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?", d)
    s = 1 / 12
    outp, i, cmd = [], 0, None
    nargs = {"m": 2, "l": 2, "h": 1, "v": 1, "c": 6, "s": 4, "q": 4, "t": 2, "a": 7, "z": 0}

    def f(x):
        return f"{x:.4f}".rstrip("0").rstrip(".") or "0"

    while i < len(tok):
        if re.match(r"[A-Za-z]", tok[i]):
            cmd = tok[i]
            i += 1
            outp.append(cmd)
            if cmd in "Zz":
                continue
        n = nargs[cmd.lower()]
        a = [float(x) for x in tok[i:i + n]]
        i += n
        absol = cmd.isupper()
        lo = cmd.lower()
        if lo == "a":
            rx, ry, rot, la, sw, x, y = a
            vals = [rx * s, ry * s, rot, la, sw, x * s - (1 if absol else 0), y * s - (1 if absol else 0)]
            outp.append(" ".join(f(v) if k not in (2, 3, 4) else str(int(v)) for k, v in enumerate(vals)))
        elif lo == "h":
            outp.append(f(a[0] * s - (1 if absol else 0)))
        elif lo == "v":
            outp.append(f(a[0] * s - (1 if absol else 0)))
        else:
            outp.append(" ".join(f(v * s - (1 if absol else 0)) for v in a))
        if cmd == "m":
            cmd = "l"
        elif cmd == "M":
            cmd = "L"
    return " ".join(outp)


IKONY = {  # Tabler outline (bez rámečku „M0 0h24v24H0z“)
    "beer": "M9 21h6a1 1 0 0 0 1 -1v-3.625c0 -1.397 .29 -2.775 .845 -4.025l.31 -.7c.556 -1.25 .845 -2.253 .845 -3.65v-4a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v4c0 1.397 .29 2.4 .845 3.65l.31 .7a9.931 9.931 0 0 1 .845 4.025v3.625a1 1 0 0 0 1 1z M6 8h12",
    "glass-full": "M8 21l8 0 M12 15l0 6 M17 3l1 7c0 3.012 -2.686 5 -6 5s-6 -1.988 -6 -5l1 -7h10z M6 10a5 5 0 0 1 6 0a5 5 0 0 0 6 0",
    "bottle": "M10 5h4v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2z M14 3.5c0 1.626 .507 3.212 1.45 4.537l.05 .07a8.093 8.093 0 0 1 1.5 4.694v6.199a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-6.2c0 -1.682 .524 -3.322 1.5 -4.693l.05 -.07a7.823 7.823 0 0 0 1.45 -4.537 M7 14.803a2.4 2.4 0 0 0 1 -.803a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 1 -.805",
    "smoking": "M3 13m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z M8 13l0 4 M16 5v.5a2 2 0 0 0 2 2a2 2 0 0 1 2 2v.5",
}
SHAPE = {k: tabler_do_vegy(v) for k, v in IKONY.items()}

POL = [  # (klíč, ikona, nadpis řádku, jednotka ikony, dělitel, jednotka hodnoty)
    ("pivo", "beer", "Pivo, 1 ikona = 10 litrů", 10, "l", 1),
    ("vino", "glass-full", "Víno, 1 ikona = 1 litr", 1, "l", 1),
    ("lihoviny", "bottle", "Lihoviny (40 %), 1 ikona = 1 litr", 1, "l", 1),
    ("cigarety", "smoking", "Cigarety, 1 ikona = 100 kusů", 100, "ks", 0),
]
body, texty = [], []
y = 0.0
for k, ikona, nadpis, delitel, jedn, des in POL:
    s = C[k]
    r1 = max(s)
    n0 = int(s[1989] / delitel + 0.5)
    n1 = int(s[r1] / delitel + 0.5)
    nmax = max(n0, n1)
    texty.append({"x": 0, "y": y, "t": nadpis, "druh": "nadpis"})
    for rok, val, n, stav in ((1989, s[1989], n0, "1989"), (r1, s[r1], n1, "dnes")):
        y += 1
        texty.append({"x": 0, "y": y, "t": str(rok), "druh": "rok_" + stav})
        hodn = f"{cz(val, des if val != int(val) else 0)} {jedn}"
        texty.append({"x": 2.0 + nmax + 0.2, "y": y, "t": hodn, "druh": "hodnota_" + stav})
        for j in range(nmax):
            body.append({"x": 2.0 + j + 0.5, "y": y, "ikona": ikona,
                         "stav": stav if j < n else "chybí",
                         "popis": nadpis.split(",")[0], "rok": str(rok), "hodnota": hodn + " na obyvatele"})
    log("G3 piktogram", k, 1989, s[1989], f"{n0} ikon", "→", r1, s[r1], f"{n1} ikon")
    y += 1.75
ymax = y - 0.75
X_MAX = 25.5
x3 = {"field": "x", "type": "quantitative", "scale": {"domain": [0, X_MAX]}, "axis": None}
y3 = {"field": "y", "type": "quantitative", "scale": {"domain": [-0.6, ymax], "reverse": True}, "axis": None}
barvy = {"domain": ["1989", "dnes", "chybí"], "range": [BLUE, CRIMSON, GRID]}
lay3 = []
for ikona, path in SHAPE.items():
    lay3.append({"data": {"values": [b for b in body if b["ikona"] == ikona]},
                 "mark": {"type": "point", "shape": path, "filled": False, "strokeWidth": 1.7, "opacity": 1,
                          "size": {"expr": f"pow(min(width / {X_MAX} * 0.92, 24), 2)"}},
                 "encoding": {"x": x3, "y": y3,
                              "color": {"field": "stav", "type": "nominal", "legend": None, "scale": barvy},
                              "tooltip": [{"field": "popis", "title": "Položka"}, {"field": "rok", "title": "Rok"},
                                          {"field": "hodnota", "title": "Spotřeba"}]}})
for druh, styl in [("nadpis", {"fontSize": 12.5, "fontWeight": 700, "color": INK}),
                   ("rok_1989", {"fontSize": 11, "color": BLUE, "fontWeight": 700}),
                   ("rok_dnes", {"fontSize": 11, "color": CRIMSON, "fontWeight": 700}),
                   ("hodnota_1989", {"fontSize": 11.5, "color": BLUE, "fontWeight": 700}),
                   ("hodnota_dnes", {"fontSize": 11.5, "color": CRIMSON, "fontWeight": 700})]:
    lay3.append({"data": {"values": [t for t in texty if t["druh"] == druh]},
                 "mark": {"type": "text", "align": "left", "baseline": "middle", **styl},
                 "encoding": {"x": x3, "y": y3, "text": {"field": "t"}}})
r_alk, r_cig = max(C["pivo"]), max(C["cigarety"])
pivo_zm = 100 * (1 - C["pivo"][r_alk] / C["pivo"][1989])
vino_zm = 100 * (C["vino"][r_alk] / C["vino"][1989] - 1)
g3 = base(f"Piva vypijeme o sedminu méně, vína skoro o polovinu víc než v roce {{1989|{BLUE}}}",
          f"Spotřeba za rok na obyvatele včetně dětí; alkohol {r_alk}, cigarety {r_cig} (novější údaj ČSÚ nevydal); šedá = rozdíl",
          f"ČSÚ, [Česko od roku 1989 v číslech]({PUB}); ikony Tabler",
          lay3, height=int(ymax * 26) + 20)
log("G3 změny", f"pivo −{pivo_zm:.1f} %", f"víno +{vino_zm:.1f} %")

DATA.mkdir(exist_ok=True)
for name, s in [("nadeje-doziti", g1), ("priciny-smrti", g2), ("piti-a-koureni", g3)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

vystup = (HERE / "vystup.txt").read_text(encoding="utf-8").split("\n== GRAFY ==")[0].rstrip("\n")
(HERE / "vystup.txt").write_text(vystup + "\n\n== GRAFY ==\n" + "\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))

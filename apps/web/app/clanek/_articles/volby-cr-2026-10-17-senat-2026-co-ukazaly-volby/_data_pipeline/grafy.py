# Grafy článku (../grafy/*.html, vkládají se přes <HtmlEmbed … title subtitle source />) a karty pro sítě (../social/social.json).
# Čísla jsou z vystup.txt, který vypisuje senat_hist.py z primárních dat ČSÚ (registr kandidátů 1996–2025, výsledky 2026).
# Spuštění: python grafy.py && node tools/social-cards/generate.mjs volby-cr-2026-10-17-senat-2026-co-ukazaly-volby
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))

NAVY, INK, MUTED, CRIMSON, GRID, ORANGE = '#272a59', '#101432', '#4c4f8e', '#de1743', '#e2ddcf', '#f76800'
FONT = "font-family='IBM Plex Sans, Arial, sans-serif'"
ROKY = [1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026]

def svg(inner):
    return f"<svg viewBox='0 0 600 240' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{inner}</svg>"

def sloupce(roky, hodnoty, vmax, barva, zvyraznit=2026, fmt=str, popisky_let=None):
    """Sloupcový graf 600×240: osa dole, hodnoty nad sloupci, roky pod osou; zvýrazněný rok karmínově."""
    x0, x1, y0, y1 = 20, 580, 196, 30
    n = len(roky); krok = (x1 - x0) / n; w = krok * 0.62
    out = [f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='{INK}' stroke-width='2'/>"]
    for i, (r, v) in enumerate(zip(roky, hodnoty)):
        cx = x0 + krok * (i + .5); h = (y0 - y1) * v / vmax
        hl = r == zvyraznit
        b = CRIMSON if hl else barva
        if v > 0:
            out.append(f"<rect x='{cx - w/2:.1f}' y='{y0 - h:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{b}' rx='2'/>")
        out.append(f"<text x='{cx:.1f}' y='{y0 - h - 7:.1f}' text-anchor='middle' {FONT} font-size='{17 if hl else 13}' font-weight='700' fill='{CRIMSON if hl else INK}'>{fmt(v)}</text>")
        lab = (popisky_let or {}).get(r, f"’{str(r)[2:]}")
        out.append(f"<text x='{cx:.1f}' y='{y0 + 22}' text-anchor='middle' {FONT} font-size='{14 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>{lab}</text>")
    return svg(''.join(out))

def vlada():
    """Karta „vládní strany poprvé bez senátora“: sloupce + čára většiny + premiéři pod osou + vysvětlivka (600×330)."""
    hod = [3, 1, 9, 4, 14, 3, 9, 4, 19, 11, 2, 1, 18, 14, 0]
    # premiér v den voleb (vlada.gov.cz / ČTK, viz RESERSE.md): (jméno, první a poslední index sloupce)
    premieri = [('Zeman', 0, 1), ('Špidla', 2, 2), ('Gross', 3, 3), ('Topolánek', 4, 5), ('Nečas', 6, 7),
                ('Sobotka', 8, 9), ('Babiš', 10, 11), ('Fiala', 12, 13), ('Babiš', 14, 14)]
    x0, x1, y0, y1, vmax = 20, 580, 200, 40, 19
    krok = (x1 - x0) / len(ROKY); w = krok * 0.62
    X = lambda i: x0 + krok * (i + .5); Y = lambda v: y0 - (y0 - y1) * v / vmax
    out = [f"<line x1='{x0}' y1='{Y(14):.1f}' x2='{x1}' y2='{Y(14):.1f}' stroke='#c9c2ad' stroke-width='1.5' stroke-dasharray='6 5'/>",
           f"<text x='{x0 + 2}' y='{Y(14) - 7:.1f}' {FONT} font-size='12' fill='{MUTED}'>většina obvodů (14 z 27)</text>",
           f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='{INK}' stroke-width='2'/>"]
    for i, (r, v) in enumerate(zip(ROKY, hod)):
        hl = r == 2026; cx = X(i)
        if v: out.append(f"<rect x='{cx - w/2:.1f}' y='{Y(v):.1f}' width='{w:.1f}' height='{y0 - Y(v):.1f}' fill='{NAVY}' rx='2'/>")
        out.append(f"<text x='{cx:.1f}' y='{Y(v) - 7:.1f}' text-anchor='middle' {FONT} font-size='{19 if hl else 13}' font-weight='700' fill='{CRIMSON if hl else INK}'>{v}</text>")
        out.append(f"<text x='{cx:.1f}' y='{y0 + 20}' text-anchor='middle' {FONT} font-size='{13 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>’{str(r)[2:]}</text>")
    for jm, a, b in premieri:
        hl = b == len(ROKY) - 1; c = CRIMSON if hl else MUTED
        xa, xb = X(a) - w / 2, X(b) + w / 2
        out.append(f"<path d='M{xa:.1f},{y0 + 30} v5 H{xb:.1f} v-5' fill='none' stroke='{c}' stroke-width='1.3'/>")
        out.append(f"<text x='{(xa + xb) / 2:.1f}' y='{y0 + 51}' text-anchor='middle' {FONT} font-size='{12 if hl else 11.5}' font-weight='{700 if hl else 600}' fill='{c if hl else INK}'>{jm}</text>")
    out.append(f"<text x='{x0}' y='{y0 + 86}' {FONT} font-size='12.5' fill='{MUTED}'>Sloupec = kolik z 27 obvodů vyhráli kandidáti, které navrhly strany tehdejší vlády.</text>"
               f"<text x='{x0}' y='{y0 + 104}' {FONT} font-size='12.5' fill='{MUTED}'>Pod osou rok voleb a premiér v den hlasování. Volí se vždy třetina Senátu.</text>")
    return f"<svg viewBox='0 0 600 312' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(out)}</svg>"

def obhajoby():
    """Sloupec = všech 27 senátorů a senátorek, kterým v daném roce končil mandát (1998: dvouleté mandáty z roku 1996).
    Zarovnání na osu X podle tmavých teček: plné tmavé (obhájil/a) stojí na ose a jdou nahoru, nad nimi prázdné kroužky
    (obhajoval/a a prohrál/a); světlé tečky (ve svém obvodu neobhajoval/a) visí pod osou. Pořadí odspodu: světlá, tmavá, prázdná.
    Všechny značky stejně velké. % u plných = obhájili / obhajovali."""
    # (obhajovalo, obhájilo) – senat_hist.py, sekce 4 (senátor obvodu kandidoval ve stejném obvodu)
    d = [(18, 11), (20, 6), (17, 6), (13, 5), (16, 8), (19, 4), (20, 6), (19, 8), (22, 5), (19, 10), (14, 6), (21, 7), (22, 12), (23, 9), (21, 15)]
    SVETLA, KRUH = '#c5c7e6', '#7d80b8'
    nad = max(n for n, _ in d); pod = max(27 - n for n, _ in d)
    x0, x1, dy, r = 44, 566, 6.7, 2.9
    yA = 14 + nad * dy  # osa X: tmavé tečky stojí na ní
    krok = (x1 - x0) / len(ROKY)
    out = [f"<line x1='{x0}' y1='{yA:.1f}' x2='{x1}' y2='{yA:.1f}' stroke='{INK}' stroke-width='2'/>",
           f"<text transform='translate(12 {yA:.1f}) rotate(-90)' text-anchor='middle' {FONT} font-size='11.5' fill='{MUTED}'>"
           f"<tspan x='0'>senátoři a senátorky, kterým</tspan><tspan x='0' dy='13'>v daném roce končil mandát</tspan></text>"]
    for i, (rok, (n, ok)) in enumerate(zip(ROKY, d)):
        hl = rok == 2026; cx = x0 + krok * (i + .5); plna = CRIMSON if hl else NAVY
        for k in range(ok):        # tmavé od osy nahoru
            out.append(f"<circle cx='{cx:.1f}' cy='{yA - (k + .5) * dy - 1:.1f}' r='{r}' fill='{plna}'/>")
        for k in range(ok, n):     # prázdné nad nimi
            out.append(f"<circle cx='{cx:.1f}' cy='{yA - (k + .5) * dy - 1:.1f}' r='{r - .6}' fill='none' stroke='{KRUH}' stroke-width='1.2'/>")
        for k in range(27 - n):    # světlé pod osou
            out.append(f"<circle cx='{cx:.1f}' cy='{yA + (k + .5) * dy + 1:.1f}' r='{r}' fill='{SVETLA}'/>")
        pct = round(100 * ok / n); ty = yA - (ok - .5) * dy + 3
        out.append(f"<text x='{cx + 5.5:.1f}' y='{ty:.1f}' {FONT} font-size='{12.5 if hl else 10.5}' font-weight='700' fill='{CRIMSON if hl else INK}' "
                   f"stroke='#fdfbf7' stroke-width='3' paint-order='stroke'>{pct} %</text>")
        out.append(f"<text x='{cx:.1f}' y='{yA + pod * dy + 20:.1f}' text-anchor='middle' {FONT} font-size='{13 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>’{str(rok)[2:]}</text>")
    ly = yA + pod * dy + 46; lx = x0
    out.append(f"<circle cx='{lx + 5}' cy='{ly - 4:.1f}' r='4' fill='{SVETLA}'/><text x='{lx + 14}' y='{ly:.1f}' {FONT} font-size='12.5' fill='{INK}'>neobhajoval/a</text>"
               f"<circle cx='{lx + 120}' cy='{ly - 4:.1f}' r='4' fill='{NAVY}'/><text x='{lx + 129}' y='{ly:.1f}' {FONT} font-size='12.5' fill='{INK}'>obhájil/a mandát</text>"
               f"<circle cx='{lx + 265}' cy='{ly - 4:.1f}' r='3.4' fill='none' stroke='{KRUH}' stroke-width='1.4'/><text x='{lx + 274}' y='{ly:.1f}' {FONT} font-size='12.5' fill='{INK}'>obhajoval/a a prohrál/a</text>"
               f"<text x='{lx}' y='{ly + 21:.1f}' {FONT} font-size='12.5' fill='{MUTED}'>Číslo = kolik % z těch, kdo obhajovali, mandát obhájilo.</text>")
    return f"<svg viewBox='0 0 600 {ly + 30:.0f}' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(out)}</svg>"

def cara(roky, hodnoty, vmin, vmax, barva=NAVY, fmt=lambda v: f'{v} %', zvyraznit=2026, ref=None):
    """Spojnicový graf s tečkami; ref = (hodnota, popisek) vodorovná béžová čára."""
    x0, x1, y0, y1 = 30, 570, 196, 34
    n = len(roky); X = lambda i: x0 + (x1 - x0) * i / (n - 1); Y = lambda v: y0 - (y0 - y1) * (v - vmin) / (vmax - vmin)
    out = [f"<line x1='{x0 - 10}' y1='{y0}' x2='{x1 + 10}' y2='{y0}' stroke='{INK}' stroke-width='2'/>"]
    if ref:
        out.append(f"<line x1='{x0 - 10}' y1='{Y(ref[0]):.1f}' x2='{x1 + 10}' y2='{Y(ref[0]):.1f}' stroke='{GRID}' stroke-width='2' stroke-dasharray='6 5'/>"
                   f"<text x='{x0 + 70}' y='{Y(ref[0]) - 8:.1f}' text-anchor='start' {FONT} font-size='12' fill='{MUTED}'>{ref[1]}</text>")
    pts = ' '.join(f'{X(i):.1f},{Y(v):.1f}' for i, v in enumerate(hodnoty))
    out.append(f"<polyline points='{pts}' fill='none' stroke='{barva}' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/>")
    for i, (r, v) in enumerate(zip(roky, hodnoty)):
        hl = r == zvyraznit
        out.append(f"<circle cx='{X(i):.1f}' cy='{Y(v):.1f}' r='{9 if hl else 5}' fill='{CRIMSON if hl else barva}' stroke='#fdfbf7' stroke-width='2'/>")
        if hl or i in (0,):
            out.append(f"<text x='{X(i) + (-12 if hl else 0):.1f}' y='{Y(v) - 16:.1f}' text-anchor='{'end' if hl else 'middle'}' {FONT} font-size='{19 if hl else 13}' font-weight='700' fill='{CRIMSON if hl else INK}'>{fmt(v)}</text>")
        if i % 2 == 0 or hl:
            out.append(f"<text x='{X(i):.1f}' y='{y0 + 22}' text-anchor='middle' {FONT} font-size='{14 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>{r}</text>")
    return svg(''.join(out))

def ano():
    # ANO: postoupilo do 2. kola / vyhrálo 2. kolo (bez zvolených v 1. kole)
    d = {2014: (9, 4), 2016: (14, 3), 2018: (10, 1), 2020: (8, 1), 2022: (17, 2), 2024: (19, 6), 2026: (13, 0)}
    x0, x1, y0, y1, vmax = 30, 570, 196, 34, 19
    krok = (x1 - x0) / len(d); w = krok * 0.30
    out = [f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='{INK}' stroke-width='2'/>"]
    for i, (r, (p, v)) in enumerate(d.items()):
        cx = x0 + krok * (i + .5); hl = r == 2026
        hp = (y0 - y1) * p / vmax; hv = (y0 - y1) * v / vmax
        out.append(f"<rect x='{cx - w - 2:.1f}' y='{y0 - hp:.1f}' width='{w:.1f}' height='{hp:.1f}' fill='#c5c7e6' rx='2'/>")
        out.append(f"<text x='{cx - w/2 - 2:.1f}' y='{y0 - hp - 7:.1f}' text-anchor='middle' {FONT} font-size='13' fill='{MUTED}'>{p}</text>")
        if v: out.append(f"<rect x='{cx + 2:.1f}' y='{y0 - hv:.1f}' width='{w:.1f}' height='{hv:.1f}' fill='{NAVY}' rx='2'/>")
        out.append(f"<text x='{cx + w/2 + 2:.1f}' y='{y0 - hv - 7:.1f}' text-anchor='middle' {FONT} font-size='{19 if hl else 14}' font-weight='700' fill='{CRIMSON if hl else INK}'>{v}</text>")
        out.append(f"<text x='{cx:.1f}' y='{y0 + 22}' text-anchor='middle' {FONT} font-size='{14 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>{r}</text>")
    out.append(f"<rect x='{x0}' y='6' width='14' height='14' fill='#c5c7e6'/><text x='{x0 + 20}' y='18' {FONT} font-size='13' fill='{MUTED}'>ve 2. kole</text>"
               f"<rect x='{x0 + 110}' y='6' width='14' height='14' fill='{NAVY}'/><text x='{x0 + 130}' y='18' {FONT} font-size='13' fill='{MUTED}'>vyhráli</text>")
    return svg(''.join(out))

def hlasy_ano():
    """Kolik hlasů z 1. kola měli finalisté ve 2. kole (%): kandidáti ANO × jejich soupeři, 2014–2026.
    Čísla z ucast_okrsky.py (registr ČSÚ HLASY_K1/K2, 2026 výsledky po obvodech)."""
    d = [(2014, 84, 83), (2016, 96, 108), (2018, 75, 86), (2020, 68, 124), (2022, 78, 96), (2024, 83, 108), (2026, 67, 90)]
    SOUP = '#f76800'  # brandOrange.6 – s navy ANO rozliší i barvoslepí
    x0, x1, y0, y1, vmax = 30, 580, 210, 40, 130
    krok = (x1 - x0) / len(d); w = krok * 0.34
    Y = lambda v: y0 - (y0 - y1) * v / vmax
    out = [f"<line x1='{x0}' y1='{Y(100):.1f}' x2='{x1}' y2='{Y(100):.1f}' stroke='#c9c2ad' stroke-width='1.5' stroke-dasharray='6 5'/>",
           f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='{INK}' stroke-width='2'/>"]
    for i, (r, a, b) in enumerate(d):
        hl = r == 2026; cx = x0 + krok * (i + .5)
        for dx, v, c in ((-w / 2 - 2, a, NAVY), (w / 2 + 2, b, SOUP)):
            out.append(f"<rect x='{cx + dx - w/2:.1f}' y='{Y(v):.1f}' width='{w:.1f}' height='{y0 - Y(v):.1f}' fill='{c}' rx='2'/>")
            out.append(f"<text x='{cx + dx:.1f}' y='{Y(v) - 6:.1f}' text-anchor='middle' {FONT} font-size='{15 if hl else 12}' font-weight='700' fill='{CRIMSON if hl and c == NAVY else INK}'>{v}</text>")
        out.append(f"<text x='{cx:.1f}' y='{y0 + 20}' text-anchor='middle' {FONT} font-size='{13 if hl else 12}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>{r}</text>")
    out.append(f"<rect x='{x0}' y='{y0 + 34}' width='13' height='13' fill='{NAVY}'/><text x='{x0 + 19}' y='{y0 + 45}' {FONT} font-size='13' fill='{INK}'>kandidáti ANO ve 2. kole</text>"
               f"<rect x='{x0 + 190}' y='{y0 + 34}' width='13' height='13' fill='{SOUP}'/><text x='{x0 + 209}' y='{y0 + 45}' {FONT} font-size='13' fill='{INK}'>jejich soupeři</text>"
               f"<line x1='{x0 + 320}' y1='{y0 + 40}' x2='{x0 + 344}' y2='{y0 + 40}' stroke='#c9c2ad' stroke-width='2' stroke-dasharray='6 4'/><text x='{x0 + 350}' y='{y0 + 45}' {FONT} font-size='13' fill='{INK}'>100 % = stejně hlasů jako v 1. kole</text>")
    return f"<svg viewBox='0 0 600 262' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(out)}</svg>"

def kluby():
    """Amfiteátr 81 křesel (stejná geometrie jako SenatDruheKolo.tsx: 5 řad).
    Bloky podle Kateřiny a Michala (17. 10. 2026): JISTÝ protivládní blok = kluby ODS a TOP 09, KDU-ČSL, STAN
    (předpokládané podle kluby.json, Ošťádal a Půta ve STAN) + Václav Láska (SEN 21) + nezařazení Přemysl Rabas, Martin Krsek a nově zvolený Petr Kazík (Karviná, Osobnosti pro kraj) = 65.
    Provládní = klub ANO 14 + nezařazená Daniela Kovářová = 15. Petr Korč (Frýdek-Místek, Naše Město F-M) zatím nezařazen – nic o něm nevíme (1)."""
    import math
    # (popisek, počet, barva, plná tečka?)
    poradi = [('ODS a TOP 09', 31, '#5e66d5', True), ('KDU-ČSL', 12, '#ffcf02', True), ('STAN', 18, '#ff1a4a', True),
              ('Láska, Rabas, Krsek, Kazík', 4, '#9a9a92', True),  # Láska (SEN 21) šedě: klub SEN 21 a Piráti zanikl; teal #0e839e jen pro budoucí klub SEN 21
              ('Korč', 1, '#9a9a92', False),
              ('Kovářová', 1, '#9a9a92', True), ('ANO', 14, NAVY, True)]
    PROTI, PRO = 4, 2   # první 4 skupiny = protivládní blok, posledních 2 = provládní
    cx, cy, rows, r0, r1 = 300, 252, 5, 100, 220
    radii = [r0 + (r1 - r0) * i / (rows - 1) for i in range(rows)]
    counts = [round(81 * r / sum(radii)) for r in radii]; counts[-1] += 81 - sum(counts)
    P = lambda a, r: (cx + r * math.cos(a), cy - r * math.sin(a))
    kum = []; t = 0
    for _, n, _, _ in poradi: t += n; kum.append(t)
    def rozdel(C):
        q = [C * k / 81 for k in counts]; m = [int(x) for x in q]
        for i in sorted(range(rows), key=lambda i: -(q[i] - m[i]))[:C - sum(m)]: m[i] += 1
        return m
    hran = [rozdel(C) for C in kum]
    n_proti = kum[PROTI - 1]; n_pro = 81 - kum[-PRO - 1]
    rb = r1 + 22; out = []
    def zavorka(a_od, a_do):
        (xa, ya), (xb, yb) = P(a_od, rb), P(a_do, rb)
        return (f"<path d='M{P(a_od, rb - 8)[0]:.1f},{P(a_od, rb - 8)[1]:.1f} L{xa:.1f},{ya:.1f} "
                f"A{rb},{rb} 0 0 1 {xb:.1f},{yb:.1f} L{P(a_do, rb - 8)[0]:.1f},{P(a_do, rb - 8)[1]:.1f}' fill='none' stroke='{INK}' stroke-width='2'/>")
    out.append(zavorka(math.pi - 0.02, math.pi * (1 - n_proti / 81) + 0.015))
    out.append(zavorka(math.pi * n_pro / 81 - 0.015, 0.02))
    for ri, (r, k) in enumerate(zip(radii, counts)):
        for j in range(k):
            a = math.pi - j * math.pi / (k - 1)
            g = next(gi for gi, h in enumerate(hran) if j < h[ri])
            x, y = P(a, r); _, _, c, plna = poradi[g]
            out.append(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='11' fill='{c}'/>" if plna else
                       f"<circle cx='{x:.1f}' cy='{y:.1f}' r='9.6' fill='none' stroke='{c}' stroke-width='2.6'/>")
    # popisky do oblouku nad závorkami, vystředěné na výseč
    ra = rb + 9
    def oblouk(pid, a_od, a_do):
        (xa, ya), (xb, yb) = P(a_od, ra), P(a_do, ra)
        return f"<path id='{pid}' d='M{xa:.1f},{ya:.1f} A{ra},{ra} 0 0 1 {xb:.1f},{yb:.1f}' fill='none'/>"
    out.append("<defs>" + oblouk('obl-proti', math.pi, math.pi * (1 - n_proti / 81)) + oblouk('obl-pro', math.pi * n_pro / 81, 0) + "</defs>")
    for pid, txt in (('obl-proti', f'protivládní {n_proti}'), ('obl-pro', f'provládní {n_pro}')):
        out.append(f"<text {FONT} font-size='15' font-weight='700' fill='{INK}' letter-spacing='.04em'>"
                   f"<textPath href='#{pid}' startOffset='50%' text-anchor='middle'>{txt}</textPath></text>")
    out.append(f"<text x='{cx}' y='{cy - 28}' text-anchor='middle' {FONT} font-size='52' font-weight='700' fill='{INK}'>{n_proti}</text>"
               f"<text x='{cx}' y='{cy - 6}' text-anchor='middle' {FONT} font-size='14' fill='{MUTED}'>protivládních z 81</text>")
    # legenda: 1. řádek velké kluby s počty, 2. řádek jednotlivci bez čísel (přání Kateřiny 17. 10.)
    def leg(items, y, gap=18):
        txt = lambda nazev, n: f'{nazev} {n}' if n is not None else nazev
        w = lambda t: 19 + 7.4 * len(t) + gap
        x = 300 - (sum(w(txt(a, n)) for a, n, _, _ in items) - gap) / 2; o = []
        for nazev, n, c, plna in items:
            dot = (f"<circle cx='{x + 7:.1f}' cy='{y - 5}' r='7' fill='{c}'/>" if plna else
                   f"<circle cx='{x + 7:.1f}' cy='{y - 5}' r='6' fill='none' stroke='{c}' stroke-width='2'/>")
            cislo = f" <tspan font-weight='700'>{n}</tspan>" if n is not None else ''
            o.append(dot + f"<text x='{x + 19:.1f}' y='{y}' {FONT} font-size='13.5' fill='{INK}'>{nazev}{cislo}</text>")
            x += w(txt(nazev, n))
        return o
    G = {g[0]: g for g in poradi}
    velke = [G['ODS a TOP 09'], G['KDU-ČSL'], G['STAN'], G['ANO']]
    # nezařazení šedě bez jmen (Láska, Rabas, Krsek, Kazík vlevo, Kovářová vpravo), Korč prázdným kolečkem
    jednotlivci = [('nezařazení', None, '#9a9a92', True), ('Korč', None, '#9a9a92', False)]
    out += leg(velke, 292, 26) + leg(jednotlivci, 320, 26)
    return f"<svg viewBox='0 -30 600 370' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(out)}</svg>"

cards = [
    dict(id='vlada-nula', eyebrow='Senát 2026 • vláda',
         headline='Vládní strany poprvé<br>bez jediného senátora',
         caption='ANO, SPD a Motoristé: <b>0 z 27</b> křesel. Dosud nejhůř dopadly vlády ČSSD (2000) a ANO + ČSSD (2020), shodně s jedním křeslem.',
         chartSvg=vlada(),
         formats=['og', 'x-square', 'bluesky-landscape', 'bluesky-square', 'ig-portrait']),
    dict(id='hlasy-ano', eyebrow='Senát 2026 • 2. kolo',
         headline='Voliče ANO<br>přetáhli soupeři',
         caption='Kandidáti ANO přišli mezi koly o <b>třetinu hlasů</b>, jejich soupeři jen o desetinu. Voliče vyřazených kandidátů získali hlavně soupeři ANO.',
         chartSvg=hlasy_ano(), formats=['og', 'x-square', 'bluesky-square', 'ig-portrait']),
    dict(id='ano-druha-kola', eyebrow='Senát 2026 • ANO',
         headline='ANO prohrálo<br>všech 13 druhých kol',
         caption='Ještě v roce 2024 vyhrálo 6 z 19 soubojů. Letos <b>0 z 13</b>, žádná strana dosud neprohrála tolik druhých kol bez jediné výhry.',
         chartSvg=ano(), formats=['x-square', 'bluesky-square', 'ig-portrait']),
    dict(id='zeny', eyebrow='Senát 2026 • ženy',
         headline='Zvolena jediná žena,<br>nejméně v historii Senátu',
         caption='Zuzana Ceralová Petrofová (ODS). Žen v Senátu ubylo ze 17 na <b>14 z 81</b>. Sedm z 11 žen ve 2. kole kandidovalo za ANO.',
         chartSvg=sloupce(ROKY, [3, 4, 3, 3, 6, 5, 4, 5, 5, 6, 2, 4, 9, 4, 1], 9, ORANGE),
         formats=['x-square', 'bluesky-square', 'ig-portrait']),
    dict(id='obhajoby', eyebrow='Senát 2026 • obhajoby',
         headline='Senátoři letos<br>obhájili mandát<br>rekordně často',
         caption='Ve svém obvodu obhájilo <b>15 z 21</b> senátorů. Dosud nejvýš to bylo 61 % v roce 1998, obvykle uspěla třetina až polovina.',
         chartSvg=obhajoby(),
         formats=['x-square', 'bluesky-square', 'ig-portrait']),
    dict(id='ucast', eyebrow='Senát 2026 • účast',
         headline='Druhé kolo: nejvyšší<br>účast od roku 2010',
         caption='Účast ve 2. kole <b>21,12 %</b>. Minimum bylo 15,38 % v roce 2016. První kolo letos 43,31 %, druhé nejvíc v historii.',
         chartSvg=cara(ROKY, [20.36, 21.56, 32.55, 18.41, 20.73, 29.85, 24.64, 18.6, 16.69, 15.38, 16.49, 16.74, 19.44, 17.54, 21.12], 10, 35,
                       fmt=lambda v: f'{v:.2f} %'.replace('.', ',')),
         formats=['x-square', 'bluesky-square', 'ig-portrait']),
    dict(id='kluby-49', eyebrow='Senát 2026 • síly',
         headline='Silný protivládní blok:<br>65 z 81 senátorů/senátorek',
         caption='Kluby ODS a TOP 09, KDU-ČSL a STAN a nezařazení Václav Láska (SEN 21), Rabas, Krsek a Kazík. Ústavní zákon potřebuje 49 hlasů. Počty senátorů a senátorek v klubech se ustálí po volbách.',
         chartSvg=kluby(), formats=['x-square', 'bluesky-square', 'ig-portrait']),
]
def nbsp(t):  # jednopísmenné předložky a spojky nikdy na konci řádku
    return re.sub(r'(?<=[\s>(])([kKsSvVzZoOuUaAiI]) ', lambda m: m.group(1) + '&nbsp;', t)
for c in cards:
    c['headline'] = nbsp(c['headline']); c['caption'] = nbsp(c['caption'])
cfg = dict(site='DataTimes.cz', eyebrow='Senát 2026',
           footer='Zdroj: ČSÚ, volby.gov.cz (registr kandidátů 1996–2025, výsledky 2026), senat.cz • výpočet DataTimes.cz',
           cards=cards)
os.makedirs(os.path.join(H, '..', 'social'), exist_ok=True)
json.dump(cfg, open(os.path.join(H, '..', 'social', 'social.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('social.json:', len(cards), 'karet')

# Grafy do článku: stejné SVG jako na kartách, bez titulku (ten nese ChartCard v článku)
os.makedirs(os.path.join(H, '..', 'grafy'), exist_ok=True)
for c in cards:
    # na mobilu by se SVG zmenšilo pod čitelnost – min. šířka 540 px a vodorovné posouvání uvnitř rámečku
    svg_el = c['chartSvg'].replace('<svg ', '<svg role="img" style="width:100%;min-width:540px;height:auto;display:block" ', 1)
    open(os.path.join(H, '..', 'grafy', f"{c['id']}.html"), 'w', encoding='utf-8').write(
        '<div style="max-width:760px;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch">' + svg_el + '</div>\n')
print('grafy:', ', '.join(c['id'] for c in cards))

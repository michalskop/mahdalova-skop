#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Citátový cover k článku o Václavu Havlovi (90 let od narození).

Zdrojová fotka je malá (370×455, černobílý portrét na černém pozadí), takže ji
nepřes celou plochu neroztahujeme: převedeme ji do duotónu navy → papír
(černé pozadí fotky splyne s navy plochou coveru), přidáme jemné zrno, které
zakryje zvětšení, a dáme ji doleva – Havel se dívá k textu. Vpravo citát
v IBM Plex Serif (--align left|right), odznak DataTimes.cz vlevo dole přes fotku.
Fotku nezrcadlíme (skutečná osoba), jen ji umisťujeme.

Výstupy (do ../images/, nebo do --out-dir):
  cover-vaclav-havel-5x4-datatimes.jpg  1500×1200  (coverImage, karta 5:4)
  cover-vaclav-havel-datatimes.jpg      1200×630   (ogImage)

Spuštění z rootu repa:
  python apps/web/app/clanek/_articles/kontext-2026-10-05-vaclav-havel-odkaz-vyroci-90-let/_cover/havel-quote-cover.py \
    --photo "C:/Users/datov/Desktop/Mahdalova & Skop/vaclav-havel.webp" [--align left|right] [--out-dir DIR]

Fonty a typografii bere z tools/photo-cover.py (IBM Plex complete TTF, nbsp
u jednopísmenných předložek).
"""
import argparse
import importlib.util
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ARTICLE = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(ARTICLE, "..", "..", "..", "..", "..", ".."))

spec = importlib.util.spec_from_file_location("photo_cover", os.path.join(REPO, "tools", "photo-cover.py"))
pc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pc)

NAVY = pc.NAVY            # brandNavy[9] #101432
PAPER = pc.PAPER          # background[2] #f8f6f0
CRIMSON = pc.PALETTE["crimson"]  # brand[6] #de1743

QUOTE = ("Vím, jak to zní nepopulárně, ale nemohu si pomoct: nejvíc ublížíme "
         "sami sobě, když se budeme starat jen sami o sebe.")
# zalomení po smyslu (redakce, 2026-10-12); "" = mezera mezi dvěma částmi citátu
QUOTE_LINES = [
    "Vím, jak to zní nepopulárně,",
    "ale nemohu si pomoct:",
    "",
    "nejvíc ublížíme sami sobě,",
    "když se budeme starat",
    "jen sami o sebe.“",
]


def duotone(photo, w, h, grain, seed=7):
    """Černobílá fotka -> navy…papír, zvětšená na w×h, se zrnem."""
    g = photo.convert("L").resize((w, h), Image.LANCZOS)
    a = np.asarray(g, dtype=np.float32) / 255.0
    a = np.clip((a - 0.04) / 0.92, 0, 1) ** 1.08          # černé pozadí -> čistá navy
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, grain, a.shape).astype(np.float32)
    noise = np.asarray(Image.fromarray(((noise + 0.5) * 255).clip(0, 255).astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float32) / 255.0 - 0.5
    a = np.clip(a + noise * (0.35 + 0.65 * a), 0, 1)       # zrno hlavně ve světlech
    n, p = np.array(NAVY, np.float32), np.array(PAPER, np.float32)
    rgb = n[None, None, :] + (p - n)[None, None, :] * a[..., None]
    return Image.fromarray(rgb.clip(0, 255).astype(np.uint8), "RGB")


def render(photo, out, W, H, S, *, photo_h, photo_x, text_x, text_top, text_w, align,
           quote_size, badge_lift, badge_x, fade_w, attribution, source, top_fade=0):
    cache = pc.ensure_fonts()
    serif = lambda s: pc.font(cache, "IBMPlexSerif-SemiBold.ttf", int(s))
    sans = lambda s: pc.font(cache, "IBMPlexSans-SemiBold.ttf", int(s))

    img = Image.new("RGBA", (W, H), (*NAVY, 255))

    # fotka vlevo; pravý okraj (směrem k textu) a spodní pás rozpuštěné do navy
    pw = round(photo.width * photo_h / photo.height)
    ph = duotone(photo, pw, photo_h, grain=0.045).convert("RGBA")
    xs = np.clip((pw - 1 - np.arange(pw, dtype=np.float32)) / fade_w, 0, 1) ** 1.6
    bot = int(photo_h * 0.32)
    ys = np.ones(photo_h, np.float32)
    ys[photo_h - bot:] = np.linspace(1, 0, bot) ** 1.3
    if top_fade:  # horní okraj do navy (IG: citát nad fotkou)
        ys[:top_fade] = np.minimum(ys[:top_fade], np.linspace(0, 1, top_fade) ** 1.4)
    # spodní pás mizí po celé šířce – pod odznakem DataTimes.cz (vlevo dole) nesmí svítit manžeta
    m = np.minimum(xs[None, :], ys[:, None])
    ph.putalpha(Image.fromarray((m * 255).astype(np.uint8), "L"))
    img.alpha_composite(ph, (photo_x, H - photo_h))

    d = ImageDraw.Draw(img)

    def width(text, fnt, ls=0):
        return sum(d.textlength(c, font=fnt) + ls for c in text) - ls

    def x_for(w):
        return text_x if align == "left" else text_x + text_w - w

    def shadow_text(xy, text, fnt, fill, ls=0):
        x, y = xy
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        cx = x
        for ch in text:
            ld.text((cx + 2, y + 2), ch, font=fnt, fill=(6, 8, 20, 170))
            cx += ld.textlength(ch, font=fnt) + ls
        img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(3 * S)))
        dd = ImageDraw.Draw(img)
        cx = x
        for ch in text:
            dd.text((cx, y), ch, font=fnt, fill=fill)
            cx += dd.textlength(ch, font=fnt) + ls

    def wrap(text, fnt, max_w):
        out_lines, cur = [], ""
        for w in text.split(" "):
            t = (cur + " " + w).strip()
            if d.textlength(t, font=fnt) <= max_w:
                cur = t
            else:
                out_lines.append(cur)
                cur = w
        return out_lines + [cur]

    # kicker + linka
    kf = sans(23 * S)
    ls_k, ls_s = int(6 * S), int(5 * S)
    k1, k2 = "KONTEXT", "VÁCLAV HAVEL · 90"
    w1, w2, gap = width(k1, kf, ls_k), width(k2, kf, ls_s), 14 * S
    kx = x_for(w1 + gap + w2)
    shadow_text((kx, text_top), k1, kf, (*CRIMSON, 255), ls=ls_k)
    shadow_text((kx + w1 + gap, text_top), k2, kf, (*PAPER, 235), ls=ls_s)
    rule_w = 54 * S
    rx0 = x_for(rule_w)
    d.rectangle([rx0, text_top + 42 * S, rx0 + rule_w, text_top + 46 * S], fill=(*CRIMSON, 255))

    # velká uvozovka „ (crimson) + citát
    # řádkování po smyslu (QUOTE_LINES, "" = mezera mezi částmi); písmo se zmenší, aby se vešel nejdelší řádek
    lines = [pc.fix_czech_typography(ln) for ln in QUOTE_LINES]
    while max(d.textlength(ln, font=serif(quote_size)) for ln in lines if ln) > text_w:
        quote_size -= 1
    qf = serif(quote_size)
    y = text_top + 78 * S
    mark = serif(quote_size * 2.6)
    mb = d.textbbox((0, 0), "„", font=mark)
    shadow_text((x_for(mb[2] - mb[0]) - mb[0], y - mb[1]), "„", mark, (*CRIMSON, 255))
    y += (mb[3] - mb[1]) + 18 * S
    LH = int(quote_size * 1.22)
    for ln in lines:
        if not ln:
            y += int(LH * 0.5)
            continue
        shadow_text((x_for(d.textlength(ln, font=qf)), y), ln, qf, (*PAPER, 255))
        y += LH

    # podpis
    y += int(16 * S)
    af = sans(27 * S)
    at = "– " + attribution
    shadow_text((x_for(d.textlength(at, font=af)), y), at, af, (*PAPER, 255))
    if source:
        y += int(38 * S)
        sf = sans(19 * S)
        for ln in wrap(pc.fix_czech_typography(source), sf, text_w):
            shadow_text((x_for(d.textlength(ln, font=sf)), y), ln, sf, (*PAPER, 190))
            y += int(26 * S)

    # odznak DataTimes.cz vlevo dole – zleva kolečko, pak nápis
    RH = int(74 * S)
    bf = sans(34 * S)
    btxt = "DataTimes.cz"
    bx = int(badge_x)
    by = int(H - 40 * S - RH - badge_lift)
    ring = Image.open(os.path.join(REPO, "logo.png")).convert("RGBA").resize((RH, RH), Image.LANCZOS)
    asc, desc = bf.getmetrics()
    img.alpha_composite(ring, (bx, by))
    shadow_text((bx + RH + int(14 * S), by + (RH - (asc + desc)) // 2), btxt, bf, (*PAPER, 255))

    img.convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"OK {out} — {os.path.getsize(out)} B, {W}×{H}, text končí y={y}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--attribution", default="Václav Havel")
    # ověřeno: cs.wikisource (zdroj hrad.cz), Novoroční projev prezidenta republiky 2000
    ap.add_argument("--source", default="novoroční projev, 1. 1. 2000")
    ap.add_argument("--align", choices=["left", "right"], default="right", help="zarovnání textu vpravo od fotky")
    ap.add_argument("--out-dir", default=os.path.join(ARTICLE, "images"))
    ap.add_argument("--suffix", default="", help="přípona názvu souboru (pro náhledy variant)")
    a = ap.parse_args()
    photo = Image.open(a.photo).convert("RGB")
    os.makedirs(a.out_dir, exist_ok=True)

    # OG 1200×630 – obsah v bezpečné zóně x 100–1100 / y 35–555
    render(photo, os.path.join(a.out_dir, f"cover-vaclav-havel-datatimes{a.suffix}.jpg"), 1200, 630, 1.0,
           photo_h=630, photo_x=-20, text_x=560, text_top=58, text_w=540, align=a.align,
           quote_size=34, badge_lift=55, badge_x=100, fade_w=180,
           attribution=a.attribution, source=a.source)
    # karta 5:4 1500×1200 – text až pod štítkem rubriky (y ≥ ~300)
    render(photo, os.path.join(a.out_dir, f"cover-vaclav-havel-5x4-datatimes{a.suffix}.jpg"), 1500, 1200, 1.55,
           photo_h=1200, photo_x=-110, text_x=700, text_top=310, text_w=740, align=a.align,
           quote_size=60, badge_lift=10, badge_x=60, fade_w=300,
           attribution=a.attribution, source=a.source)
    # Instagram 4:5 1080×1350 – citát nahoře vpravo, fotka dole vlevo (Havel se dívá vzhůru k textu)
    render(photo, os.path.join(a.out_dir, f"cover-vaclav-havel-instagram-datatimes{a.suffix}.jpg"), 1080, 1350, 1.15,
           photo_h=860, photo_x=-40, text_x=80, text_top=110, text_w=920, align=a.align,
           quote_size=56, badge_lift=0, badge_x=70, fade_w=260, top_fade=260,
           attribution=a.attribution, source=a.source)


if __name__ == "__main__":
    main()
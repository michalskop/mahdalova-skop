#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
photo-cover.py — generátor fotografického cover / og:image pro článek DataTimes.

Vyrobí 1200×630 JPEG z fotky: ztmavený snímek + navy scrim + kicker (sekce),
eyebrow (místo/subjekt), serifový headline a odznak „DataTimes.cz" vpravo dole.
Typografie IBM Plex (Serif headline, Sans kicker/odznak), barvy z palety
ThemeProvider. Doplněk k interaktivnímu tools/poster-editor.html — tenhle skript
dává spolehlivý, optimalizovaný soubor bez ručního nahrávání fotky.

Použití:
  python tools/photo-cover.py \
    --photo apps/web/app/clanek/_articles/<slug>/images/foto.jpg \
    --out   apps/web/app/clanek/_articles/<slug>/images/cover-<slug>-datatimes.jpg \
    --kicker KONTEXT \
    --section "VIZUÁLNÍ INVESTIGACE" \
    --eyebrow "Nemocnice Al-Ahli" \
    --headline "Dost záběrů na desítky analýz, málo na jediný verdikt" \
    [--accent crimson] [--crop-bias 0.42] [--width 1200] [--height 630] [--quality 86]

Ve frontmatteru článku pak:
  coverImage: "images/cover-<slug>-datatimes.jpg"
  coverFit: "contain"          # 1,9:1 se na kartě 5:4 jinak ořízne přes text
  coverBg: "brandNavy.9"       # navy pruhy splynou se scrimem
og:image se z coverImage vezme automaticky.

Závislosti: Pillow + numpy (na stroji jsou). Fonty IBM Plex se při prvním běhu
stáhnou do cache (jen tento zdroj funguje — jsdelivr vrací stuby):
  https://raw.githubusercontent.com/IBM/plex/master/packages/plex-*/fonts/complete/ttf/
"""
import argparse
import os
import re
import sys
import tempfile
import urllib.request

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --- Česká typografie: jednopísmenné předložky/spojky (k s v z o u a i) NIKDY
#     nenechat na konci řádku. Zrcadlí packages/ui/src/lib/remark-czech-typography.js
#     (nbsp U+00A0 se v PIL kreslí jako běžná mezera, ale wrap() na něm nezalomí).
NBSP = " "
_ONE_LETTER_RE = re.compile(r'(^|[\s(\[{„"\'–—])([ksvzouaiKSVZOUAI])[ \t]+')


def fix_czech_typography(s):
    if not isinstance(s, str) or not s:
        return s
    s = _ONE_LETTER_RE.sub(lambda m: m.group(1) + m.group(2) + NBSP, s)
    s = _ONE_LETTER_RE.sub(lambda m: m.group(1) + m.group(2) + NBSP, s)
    s = re.sub(r'([(\[{])[ \t]+', lambda m: m.group(1) + NBSP, s)
    s = re.sub(r'[ \t]+([)\]}])', lambda m: NBSP + m.group(1), s)
    return s

# --- Paleta (ThemeProvider.tsx) — accent barva kickeru/linky --------------
PALETTE = {
    "crimson":  (222, 23, 67),    # brand[6]  #de1743  (výchozí)
    "orange":   (247, 104, 0),    # brandOrange[6] #f76800
    "yellow":   (255, 207, 2),    # brandYellow[6] #ffcf02
    "teal":     (14, 131, 158),   # brandTeal[6]  #0e839e
    "amethyst": (159, 49, 158),   # brandAmethyst[6] #9f319e
    "royal":    (74, 81, 171),    # brandRoyalBlue[6] #4a51ab
}
NAVY = (16, 20, 50)     # brandNavy[9] #101432 — pozadí/scrim
PAPER = (248, 246, 240)  # background[2] #f8f6f0 — světlý text

# Barva scrimu/pozadí (ztmavení fotky). Tmavé [9] odstíny z palety kvůli
# čitelnosti bílého textu; volí se přes --scrim, do frontmatteru pak jde
# odpovídající coverBg (např. --scrim deepred -> coverBg: "brandDeepRed.9").
SCRIMS = {
    "navy": (16, 20, 50),      # brandNavy[9]     #101432
    "deepred": (67, 19, 32),   # brandDeepRed[9]  #431320
    "amethyst": (53, 16, 64),  # brandAmethyst[9] #351040
    "forest": (23, 32, 2),     # brandForestGreen[9] #172002
    "chocolate": (36, 21, 11), # brandChocolate[9] #24150b
    "teal": (2, 52, 64),       # brandTeal[9]     #023440
}

# IBM Plex TTF — funkční zdroj (raw.githubusercontent, packages/ cesta)
FONT_BASE = "https://raw.githubusercontent.com/IBM/plex/master/packages"
FONTS = {
    "IBMPlexSerif-SemiBold.ttf": f"{FONT_BASE}/plex-serif/fonts/complete/ttf/IBMPlexSerif-SemiBold.ttf",
    "IBMPlexSans-SemiBold.ttf":  f"{FONT_BASE}/plex-sans/fonts/complete/ttf/IBMPlexSans-SemiBold.ttf",
}
FONT_CACHE = os.path.join(tempfile.gettempdir(), "datatimes-plex-fonts")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def ensure_fonts():
    os.makedirs(FONT_CACHE, exist_ok=True)
    for name, url in FONTS.items():
        path = os.path.join(FONT_CACHE, name)
        if not os.path.exists(path) or os.path.getsize(path) < 5000:
            urllib.request.urlretrieve(url, path)
        try:
            ImageFont.truetype(path, 40).getname()
        except Exception as exc:  # pragma: no cover
            sys.exit(f"Font {name} se nepodařilo stáhnout/otevřít ({url}): {exc}")
    return FONT_CACHE


def font(cache, name, size):
    return ImageFont.truetype(os.path.join(cache, name), size)


def main():
    ap = argparse.ArgumentParser(description="Fotografický cover/og:image pro článek DataTimes.")
    ap.add_argument("--photo", required=True, help="zdrojová fotka")
    ap.add_argument("--out", required=True, help="výstupní JPEG")
    ap.add_argument("--kicker", default="KONTEXT", help="rubrika (verzálky, accent barva)")
    ap.add_argument("--section", default="", help="název sekce vedle kickeru (off-white)")
    ap.add_argument("--eyebrow", default="", help="místo/subjekt nad headlinem")
    ap.add_argument("--headline", required=True, help="úderná (kratší) verze titulku")
    ap.add_argument("--accent", default="crimson", choices=sorted(PALETTE), help="barva kickeru/linky")
    ap.add_argument("--scrim", default="navy", choices=sorted(SCRIMS),
                    help="barva scrimu/pozadí (tmavý [9] odstín); do frontmatteru dej odpovídající coverBg")
    ap.add_argument("--crop-bias", type=float, default=0.42,
                    help="0=drž horní okraj, 1=spodní; kolik ubrat shora při cover-crop")
    ap.add_argument("--width", type=int, default=1200)
    ap.add_argument("--height", type=int, default=630)
    ap.add_argument("--quality", type=int, default=86)
    ap.add_argument("--badge-lift", type=int, default=70,
                    help="posun odznaku DataTimes.cz nahoru (px) kvůli titulku, který X/Twitter vykreslí přes spodní okraj náhledu")
    ap.add_argument("--logo", default=os.path.join(REPO_ROOT, "logo.png"),
                    help="prstenec DataTimes.cz (default: logo.png v rootu repa)")
    args = ap.parse_args()

    # Česká typografie: sváž jednopísmenné předložky/spojky s dalším slovem,
    # ať wrap() nikdy nezalomí za "k/s/v/z/o/u/a/i".
    args.headline = fix_czech_typography(args.headline)
    args.eyebrow = fix_czech_typography(args.eyebrow)
    args.section = fix_czech_typography(args.section)

    W, H = args.width, args.height
    accent = PALETTE[args.accent]
    scrim_col = SCRIMS[args.scrim]
    cache = ensure_fonts()
    serif_sb = lambda s: font(cache, "IBMPlexSerif-SemiBold.ttf", s)
    sans_sb = lambda s: font(cache, "IBMPlexSans-SemiBold.ttf", s)

    # 1) fotka -> cover-crop na W×H
    img = Image.open(args.photo).convert("RGB")
    sw, sh = img.size
    target = W / H
    if sw / sh > target:  # moc široká -> ořízni šířku
        new_w = int(sh * target)
        left = int((sw - new_w) * 0.5)
        img = img.crop((left, 0, left + new_w, sh))
    else:                 # moc vysoká -> ořízni výšku (s biasem)
        new_h = int(sw / target)
        top = int((sh - new_h) * args.crop_bias)
        img = img.crop((0, top, sw, top + new_h))
    img = img.resize((W, H), Image.LANCZOS)
    img = Image.blend(img, Image.new("RGB", (W, H), scrim_col), 0.14)

    # 2) navy scrim: gradient zleva + odspodu
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = scrim.load()
    for x in range(W):
        lx = max(0.0, 1.0 - (x / (W * 0.66)))
        a_left = int(232 * (lx ** 1.35))
        for y in range(H):
            by = max(0.0, (y - H * 0.6) / (H * 0.4))
            a_bot = int(150 * (by ** 1.6))
            a = min(240, max(a_left, a_bot))
            if a:
                sd[x, y] = (*scrim_col, a)
    img = Image.alpha_composite(img.convert("RGBA"), scrim)

    def shadow_text(xy, text, fnt, fill, ls=0, sh_alpha=165, sh_off=2):
        x, y = xy
        lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        cx = x
        for ch in text:
            ld.text((cx + sh_off, y + sh_off), ch, font=fnt, fill=(6, 8, 20, sh_alpha))
            cx += ld.textlength(ch, font=fnt) + ls
        lay = lay.filter(ImageFilter.GaussianBlur(3))
        img.alpha_composite(lay)
        d = ImageDraw.Draw(img)
        cx = x
        for ch in text:
            d.text((cx, y), ch, font=fnt, fill=fill)
            cx += d.textlength(ch, font=fnt) + ls

    def wrap(text, fnt, max_w):
        d = ImageDraw.Draw(img)
        lines, cur = [], ""
        for w in text.split(" "):
            t = (cur + " " + w).strip()
            if d.textlength(t, font=fnt) <= max_w:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    MX, MAXW = 66, int(W * 0.633)

    # 3) kicker + linka
    kf = sans_sb(23)
    shadow_text((MX, 70), args.kicker, kf, (*accent, 255), ls=6, sh_alpha=120)
    if args.section:
        kw = sum(ImageDraw.Draw(img).textlength(c, font=kf) + 6 for c in args.kicker)
        shadow_text((MX + kw + 8, 70), args.section, kf, (*PAPER, 235), ls=5, sh_alpha=120)
    ImageDraw.Draw(img).rectangle([MX, 112, MX + 54, 116], fill=(*accent, 255))

    # 4) eyebrow + headline
    y = 138
    if args.eyebrow:
        shadow_text((MX, y), args.eyebrow, serif_sb(40), (*PAPER, 255))
        y = 202
    hf = serif_sb(58)
    for ln in wrap(args.headline, hf, MAXW):
        shadow_text((MX, y), ln, hf, (*PAPER, 255))
        y += int(58 * 1.18)

    # 5) odznak DataTimes.cz vpravo dole
    if os.path.exists(args.logo):
        RH = 74
        ring = Image.open(args.logo).convert("RGBA").resize((RH, RH), Image.LANCZOS)
        rx, ry = W - 40 - RH, H - 40 - RH - args.badge_lift
        img.alpha_composite(ring, (rx, ry))
        bf = sans_sb(34)
        btxt = "DataTimes.cz"
        bw = ImageDraw.Draw(img).textlength(btxt, font=bf)
        asc, desc = bf.getmetrics()
        shadow_text((rx - 14 - bw, ry + (RH - (asc + desc)) // 2), btxt, bf, (*PAPER, 255))

    # 6) export
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    img.convert("RGB").save(args.out, "JPEG", quality=args.quality, optimize=True, progressive=True)
    print(f"OK {args.out} — {os.path.getsize(args.out)} B, {W}×{H}")


if __name__ == "__main__":
    main()

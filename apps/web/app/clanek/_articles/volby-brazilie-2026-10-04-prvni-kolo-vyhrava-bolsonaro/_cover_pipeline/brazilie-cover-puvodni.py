"""Cover k článku volby-brazilie-2026-10-05-flavio-bolsonaro-vyhraje-prvni-kolo.

Stejná sazba jako cover CDU Meklenbursko (volby-nemecko-2026-09-20-cdu-meklenbursko):
navy pásy nahoře/dole, motiv uprostřed, tag VOLBY V …, serifový podtitulek,
titulek v karmínovém boxu, claim a odznak DataTimes.cz (kolečko vlevo).
Výstup: cover-homepage.jpg (1448×1086, 4:3 ≈ karta) a cover-og.jpg (1200×630).

python brazilie-cover.py <výstupní složka>
"""
import os, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
REPO_LOGO = r'C:/Users/datov/Desktop/datatimes/mahdalova-skop/logo.png'
FONTS = os.path.join(tempfile.gettempdir(), 'datatimes-plex-fonts')

NAVY = (16, 20, 50)        # brandNavy.9
CRIMSON = (222, 23, 67)    # brand.6
OFFWHITE = (248, 246, 240) # background.2

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

def nbsp(s):
    # jednopísmenné předložky/spojky nesmí zůstat na konci řádku
    out = []
    for w in s.split(' '):
        if out and out[-1].lower() in {'k', 's', 'v', 'z', 'o', 'u', 'a', 'i'}:
            out[-1] += '\u00a0' + w
        else:
            out.append(w)
    return ' '.join(out)

def map_layer():
    im = np.asarray(Image.open(os.path.join(HERE, 'brazil-flag-contour.webp')).convert('RGB')).astype(float)
    a = np.clip(im.max(axis=2) / 110.0, 0, 1)[..., None]
    fg = np.clip(im / np.maximum(a, 1e-3), 0, 255)
    return Image.fromarray(np.uint8(np.concatenate([fg, a * 255], axis=2)), 'RGBA')

def shadow_text(base, xy, text, fnt, fill, blur=3, offset=(0, 2), alpha=170):
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((xy[0] + offset[0], xy[1] + offset[1]), text, font=fnt, fill=(0, 0, 0, alpha))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(base).text(xy, text, font=fnt, fill=fill)

def badge(base, x, y, h, fnt):
    logo = Image.open(REPO_LOGO).convert('RGBA').resize((h, h), Image.LANCZOS)
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 140), (x, y + 2), logo)
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4)))
    base.alpha_composite(logo, (x, y))
    tb = fnt.getbbox('DataTimes.cz')
    ty = y + (h - (tb[3] - tb[1])) // 2 - tb[1]
    shadow_text(base, (x + int(h * 1.22), ty), 'DataTimes.cz', fnt, OFFWHITE)

def tag(base, x, y, size, underline=True):
    f = font('IBMPlexSans-SemiBold.ttf', size)
    d = ImageDraw.Draw(base)
    sp = size * 0.18
    cx = x
    for i, word in enumerate(['VOLBY', 'V', 'BRAZÍLII']):
        col = CRIMSON if i == 0 else OFFWHITE
        for ch in word:
            d.text((cx, y), ch, font=f, fill=col)
            cx += f.getlength(ch) + sp
        if i == 0:
            w0 = cx - x - sp
        cx += size * 0.55
    if underline:
        d.rectangle([x, y + size * 1.45, x + w0 * 0.98, y + size * 1.45 + max(3, size // 9)], fill=CRIMSON)

def compose(W, H, band_top, band_bot, text_x, map_box, sizes, lines, out_name, veil=0.38, map_alpha=1.0, scrim=None):
    base = Image.new('RGBA', (W, H), NAVY + (255,))
    # motiv: mapa ve vlajce, mírně ztmavená závojem navy
    m = map_layer()
    mx, my, mh = map_box
    s = mh / m.height
    m = m.resize((int(m.width * s), int(m.height * s)), Image.LANCZOS)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    layer.paste(m, (mx, my), m)
    arr = np.asarray(layer).astype(float)
    arr[..., :3] = arr[..., :3] * (1 - veil) + np.array(NAVY) * veil
    arr[..., 3] *= map_alpha
    base.alpha_composite(Image.fromarray(np.uint8(arr), 'RGBA'))
    if scrim:
        # navy závoj zleva, aby titulek bez boxu zůstal čitelný i přes vlajku
        x0, x1, amax = scrim
        xs = np.arange(W, dtype=float)
        al = np.clip((x1 - xs) / max(1, x1 - x0), 0, 1) * amax * 255
        g = np.zeros((H, W, 4), np.uint8); g[..., :3] = NAVY; g[..., 3] = al[None, :].astype(np.uint8)
        base.alpha_composite(Image.fromarray(g, 'RGBA'))
    # navy pásy nahoře a dole (jako u CDU)
    d = ImageDraw.Draw(base)
    if band_top:
        d.rectangle([0, 0, W, band_top], fill=NAVY)
    if band_bot:
        d.rectangle([0, H - band_bot, W, H], fill=NAVY)

    tag(base, text_x, sizes['tag_y'], sizes['tag'])
    y = sizes['sub_y']
    fsub = font('IBMPlexSerif-SemiBold.ttf', sizes['sub'])
    for l in lines['sub']:
        shadow_text(base, (text_x, y), nbsp(l), fsub, OFFWHITE)
        y += int(sizes['sub'] * 1.3)
    # titulek bez podkladového boxu (uživatelka 2026-10-05: „bez zvýrazněného pozadí“)
    fh = font('IBMPlexSerif-Bold.ttf', sizes['head'])
    y += int(sizes['head'] * 0.22)
    lh = int(sizes['head'] * 1.12)
    for l in lines['head']:
        shadow_text(base, (text_x, y), nbsp(l), fh, OFFWHITE, blur=5, offset=(0, 3), alpha=200)
        y += lh
    y += int(sizes['claim'] * 0.7)
    fc = font('IBMPlexSerif-SemiBold.ttf', sizes['claim'])
    for l in lines['claim']:
        shadow_text(base, (text_x, y), nbsp(l), fc, OFFWHITE)
        y += int(sizes['claim'] * 1.3)
    badge(base, sizes['badge_x'], sizes['badge_y'], sizes['badge'], font('IBMPlexSans-SemiBold.ttf', int(sizes['badge'] * 0.52)))
    base.convert('RGB').save(os.path.join(OUT, out_name), 'JPEG', quality=86, optimize=True, progressive=True)
    print(out_name, base.size)

LINES = {
    'sub': ['Prezidentské volby v Brazílii,', 'predikce DataTimes.cz:'],
    'head': ['První kolo vyhrává', 'Flávio Bolsonaro'],
    'claim': ['Druhé kolo se bude konat 25. října 2026', 'Lula ztratil pozici mírného favorita'],
}

# homepage 1448×1086 – text i odznak v centrálním pásu, který zůstává vidět v bočních dlaždicích
compose(1448, 1086, 108, 110, 285, (560, 110, 866),
        {'tag': 30, 'tag_y': 34, 'sub': 44, 'sub_y': 250, 'head': 82, 'claim': 40,
         'badge': 72, 'badge_x': 840, 'badge_y': 880},
        LINES, 'cover-homepage.jpg', veil=0.30, scrim=(1000, 1180, 0.55))

# OG 1200×630 – obsah jen v bezpečné zóně x 100–1100, y 35–555
compose(1200, 630, 0, 0, 110, (640, 20, 590),
        {'tag': 22, 'tag_y': 48, 'sub': 30, 'sub_y': 110, 'head': 58, 'claim': 28,
         'badge': 56, 'badge_x': 845, 'badge_y': 480},
        LINES, 'cover-og.jpg', veil=0.30, scrim=(640, 760, 0.45))

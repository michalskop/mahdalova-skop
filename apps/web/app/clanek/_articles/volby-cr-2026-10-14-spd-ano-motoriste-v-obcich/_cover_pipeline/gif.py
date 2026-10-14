"""Animovaný GIF na sítě ze dvou snímků (volby 2022 → 2026) s plynulým prolnutím.

Snímky vyrobí dlazdice.cjs v režimu gif (stejná šablona jako dlaždice v článku),
tady se jen skládají – grafika se v Pillow nekreslí.
Spuštění: python gif.py spd [ano ksc …]  → ../_social/<strana>-2022-2026.gif
"""
import sys
from pathlib import Path

from PIL import Image

SOCIAL = Path(__file__).parent.parent / '_social'
DRZ_A, DRZ_B, KROK, KROKU = 2000, 3000, 70, 10   # ms: výdrž 2022, výdrž 2026, krok prolnutí, počet kroků


def gif(strana):
    a = Image.open(SOCIAL / f'{strana}-2022.png').convert('RGB')
    b = Image.open(SOCIAL / f'{strana}-2026.png').convert('RGB')
    prolni = lambda x, y: [Image.blend(x, y, i / KROKU) for i in range(1, KROKU)]
    snimky = [a, *prolni(a, b), b, *prolni(b, a)]
    trvani = [DRZ_A] + [KROK] * (KROKU - 1) + [DRZ_B] + [KROK] * (KROKU - 1)
    # společná paleta z obou krajních snímků, ať barvy stran neblikají
    paleta = Image.new('RGB', (a.width, a.height * 2))
    paleta.paste(a, (0, 0)); paleta.paste(b, (0, a.height))
    paleta = paleta.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
    snimky = [s.quantize(palette=paleta, dither=Image.Dither.NONE) for s in snimky]
    out = SOCIAL / f'{strana}-2022-2026.gif'
    snimky[0].save(out, save_all=True, append_images=snimky[1:], duration=trvani, loop=0, optimize=True)
    print(out.name, f'{out.stat().st_size // 1024} kB')


for s in sys.argv[1:]:
    gif(s)

# Převede karty na sítě (social/*/cover-*.png) na JPEG kvality 90 a PNG smaže. Volá socialni-site.cjs.
import glob, os, sys
from PIL import Image

for p in glob.glob(os.path.join(sys.argv[1], "*", "cover-*.png")):
    Image.open(p).convert("RGB").save(p[:-4] + ".jpg", quality=90, optimize=True)
    os.remove(p)

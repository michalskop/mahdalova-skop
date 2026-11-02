"""Počet obyvatel zemí kolem začátku uznaných genocid, přepočtený na index (rok před začátkem = 100).

Data: zdroj/worldbank_SP.POP.TOTL.json (stahni.py; World Bank WDI, odhady UN World Population Prospects 2024).
Výstup: vypíše tabulku a vrací řady pro grafy.py. Spuštění: python -I krivky.py
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
WB = json.loads((Path(__file__).parent / "zdroj" / "worldbank_SP.POP.TOTL.json").read_text(encoding="utf-8"))["data"]

# kód země, popisek, rok začátku genocidy (rok 0), cílová skupina
PRIPADY = [
    ("KHM", "Kambodža", 1975, "Rudí Khmerové, 1975–1979"),
    ("RWA", "Rwanda", 1994, "Tutsiové, 1994"),
    ("GTM", "Guatemala", 1981, "Ixilové, 1981–1983"),
    ("IRQ", "Irák", 2014, "Jezídové, 2014"),
    ("MMR", "Myanmar", 2017, "Rohingové, 2016–2017"),
]
PRED, PO = 5, 6  # roky před začátkem a po něm


def rady():
    out = []
    for kod, zeme, rok0, skupina in PRIPADY:
        zaklad = WB[kod][str(rok0 - 1)]
        for t in range(-PRED, PO + 1):
            n = WB[kod][str(rok0 + t)]
            out.append({"zeme": zeme, "skupina": skupina, "t": t, "rok": rok0 + t, "obyv": n, "index": round(n / zaklad * 100, 1)})
    return out


if __name__ == "__main__":
    r = rady()
    for kod, zeme, rok0, _ in PRIPADY:
        radek = [x for x in r if x["zeme"] == zeme]
        nejnizsi = min(radek, key=lambda x: x["index"])
        print(f"{zeme:10} rok0={rok0} rok před: {WB[kod][str(rok0 - 1)] / 1e6:.2f} mil. | minimum {nejnizsi['index']} ({nejnizsi['rok']}) | "
              + " ".join(f"{x['t']:+d}:{x['index']}" for x in radek))

"""Ikony pro piktogramové grafy (Vega-Lite `shape` = vlastní SVG cesta).

Tabler Icons 3.26.0 (outline, viewBox 24, licence MIT, https://tabler.io/icons).
Cesty `d` jsou zkopírované ze souborů node_modules/@tabler/icons/icons/outline/<název>.svg
(bez úvodního rámečku „M0 0h24v24H0z“). Vega potřebuje tvar v souřadnicích -1..1,
převod dělá vega_tvar().
"""
import re

TABLER = {
    "meat": 'M13.62 8.382l1.966 -1.967a2 2 0 1 1 3.414 -1.415a2 2 0 1 1 -1.413 3.414l-1.82 1.821 M5.904 18.596c2.733 2.734 5.9 4 7.07 2.829c1.172 -1.172 -.094 -4.338 -2.828 -7.071c-2.733 -2.734 -5.9 -4 -7.07 -2.829c-1.172 1.172 .094 4.338 2.828 7.071z M7.5 16l1 1 M12.975 21.425c3.905 -3.906 4.855 -9.288 2.121 -12.021c-2.733 -2.734 -8.115 -1.784 -12.02 2.121',
    "paper-bag": 'M8 3h8a2 2 0 0 1 2 2v1.82a5 5 0 0 0 .528 2.236l.944 1.888a5 5 0 0 1 .528 2.236v5.82a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-5.82a5 5 0 0 1 .528 -2.236l1.472 -2.944v-3a2 2 0 0 1 2 -2z M14 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M6 21a2 2 0 0 0 2 -2v-5.82a5 5 0 0 0 -.528 -2.236l-1.472 -2.944 M11 7h2',
    "milk": 'M8 6h8v-2a1 1 0 0 0 -1 -1h-6a1 1 0 0 0 -1 1v2z M16 6l1.094 1.759a6 6 0 0 1 .906 3.17v8.071a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8.071a6 6 0 0 1 .906 -3.17l1.094 -1.759 M12 16m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M10 10h4',
    "bread": 'M18 4a3 3 0 0 1 2 5.235v8.765a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-8.764a3 3 0 0 1 1.824 -5.231h12.176v-.005z',
    "cube": 'M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z M12 22v-10 M12 12l8.73 -5.04 M3.27 6.96l8.73 5.04',
    "egg": 'M19 14.083c0 4.154 -2.966 6.74 -7 6.917c-4.2 0 -7 -2.763 -7 -6.917c0 -5.538 3.5 -11.09 7 -11.083c3.5 .007 7 5.545 7 11.083z',
    "beer": 'M9 21h6a1 1 0 0 0 1 -1v-3.625c0 -1.397 .29 -2.775 .845 -4.025l.31 -.7c.556 -1.25 .845 -2.253 .845 -3.65v-4a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v4c0 1.397 .29 2.4 .845 3.65l.31 .7a9.931 9.931 0 0 1 .845 4.025v3.625a1 1 0 0 0 1 1z M6 8h12',
    "scissors": 'M6 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M6 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M8.6 8.6l10.4 10.4 M8.6 15.4l10.4 -10.4',
    "movie": 'M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z M8 4l0 16 M16 4l0 16 M4 8l4 0 M4 16l4 0 M4 12l16 0 M16 8l4 0 M16 16l4 0',
    "bus": 'M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8 M16 5l1.5 7l4.5 0 M2 10l15 0 M7 5l0 5 M12 5l0 5',
    "shoe": 'M4 6h5.426a1 1 0 0 1 .863 .496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114a4 4 0 0 1 3.074 3.89v2.27a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1z M14 13l1 -2 M8 18v-1a4 4 0 0 0 -4 -4h-1 M10 12l1.5 -3',
}

_NUM = r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?"
_POCET = {"M": 2, "L": 2, "T": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "A": 7, "Z": 0}


def vega_tvar(d: str) -> str:
    """Převede SVG cestu z viewBoxu 0..24 do souřadnic -1..1 (střed ikony = 0)."""
    tokeny = re.findall(r"[MmLlHhVvCcSsQqTtAaZz]|" + _NUM, d)
    out, i, cmd = [], 0, None
    f = lambda v: f"{v:.4f}".rstrip("0").rstrip(".") if abs(v) > 1e-9 else "0"
    while i < len(tokeny):
        t = tokeny[i]
        if re.fullmatch(r"[A-Za-z]", t):
            cmd = t
            i += 1
            out.append(cmd)
            if cmd in "Zz":
                continue
        n = _POCET[cmd.upper()]
        par = [float(x) for x in tokeny[i:i + n]]
        i += n
        abs_ = cmd.isupper()
        posun = (lambda v: (v - 12) / 12) if abs_ else (lambda v: v / 12)
        U = cmd.upper()
        if U == "H" or U == "V":
            nove = [posun(par[0])]
        elif U == "A":
            nove = [par[0] / 12, par[1] / 12, par[2], par[3], par[4], posun(par[5]), posun(par[6])]
        else:
            nove = [posun(v) for v in par]
        out.append(" ".join(f(v) if U != "A" or k not in (2, 3, 4) else str(int(v)) for k, v in enumerate(nove)))
    return " ".join(out)


def tvar(nazev: str) -> str:
    return vega_tvar(TABLER[nazev])

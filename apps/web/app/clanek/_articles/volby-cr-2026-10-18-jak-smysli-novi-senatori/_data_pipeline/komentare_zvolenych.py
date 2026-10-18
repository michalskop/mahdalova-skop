# Komentáře zvolených senátorů k 13 vybraným otázkám (Volební kalkulačka 2026) -> komentare_zvolenych.txt (bez PIN)
import openpyxl, re, os, sys
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(H, 'kalkulacka_index.py'), encoding='utf-8').read().split("print('odpovědí bez testu")[0])
ws = openpyxl.load_workbook(os.path.join(H, 'zdroj', 'kalkulacka-senat-2026-odpovedi.xlsx'), read_only=True).worksheets[0]
rows = list(ws.iter_rows(values_only=True)); hdr = rows[0]
ccol = {int(m.group(1)): i for i, h in enumerate(hdr) if h and (m := re.match(r'Případný komentář k otázce (\d+)', str(h)))}
zv = {(int(c['OBVOD']), c['PRIJMENI']) for c in reg if c['ZVOLEN_K1'] == '1' or c['ZVOLEN_K2'] == '1'}
for q in [8, 16, 23, 24, 2, 6, 14, 15, 17, 9, 13, 31, 33]:
    print(f'##### {q}')
    for r in rows[1:]:
        jm = str(r[1] or '')
        if 'Test' in jm: continue
        kj = klic(jm); kand = [v for (o, kk), v in K.items() if kk <= kj or len(kk & kj) >= 2]
        if len(kand) != 1: continue
        c = kand[0]
        if (int(c['OBVOD']), c['PRIJMENI']) in zv and r[ccol[q]] and str(r[ccol[q]]).strip() not in ('None', ''):
            print(f"- {c['JMENO']} {c['PRIJMENI']} ({c['OBVOD']}) [{r[qcol[q]]}]: {str(r[ccol[q]]).strip()}")

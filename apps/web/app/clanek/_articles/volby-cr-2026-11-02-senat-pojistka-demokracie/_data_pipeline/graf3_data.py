# Graf 3: návrhy zákonů, které Senát zamítl nebo vrátil s pozměňovacími návrhy, a co s nimi udělala Sněmovna, 1996–2026.
# Zdroj: otevřená data PSP ČR, https://www.psp.cz/eknih/cdrom/opendata/tisky.zip (tisky, hist, prechody, typ_akce, stavy).
# Senát: přechod ze stavu „Senát“ akcí 27 (zamítnut), 24 (vrácen) nebo 164 (zamítnuto – ústavní zákon).
# Sněmovna potom: akce 20 (setrváno = přehlasováno), 15 (pozm. přijat = přijata verze Senátu), 8 (nepřijat = zákon padl).
import sys, os, csv, collections
sys.stdout.reconfigure(encoding='utf-8')
T = sys.argv[1]; OUT = sys.argv[2]
def rd(n):
    with open(os.path.join(T, n + '.unl'), encoding='cp1250', errors='replace') as f:
        return [l.rstrip('\n').split('|') for l in f if l.strip()]
typ_stavu = {r[0]: r[1] for r in rd('typ_stavu')}
stavy = {r[0]: r for r in rd('stavy')}
prech = {r[0]: r for r in rd('prechody')}
SENAT = {k for k, r in stavy.items() if typ_stavu.get(r[1]) == 'Senát'}
SNEM_SEN = {k for k, r in stavy.items() if typ_stavu.get(r[1], '').startswith('Sněmovna (Senát)')}
tisky = {}
for r in rd('tisky'):
    # id_tisk|id_druh|id_stav|ct|cislo_za|id_navrh|id_org|id_org_obd|id_osoba|navrhovatel|nazev_tisku|predlozeno|rozeslano|dal|tech_nos_dat|uplny_nazev_tisku|...
    tisky[r[0]] = dict(obdobi_org=r[7], ct=r[3], nazev=r[10], uplny=r[15] if len(r) > 15 else '', id_navrh=r[5])
ev = collections.defaultdict(list)
for h in rd('hist'):
    # id_hist|id_tisk|datum|id_hlas|id_prechod|id_bod|schuze|usnes_ps|...
    p = prech.get(h[4])
    if not p: continue
    odkud, kam, akce = p[1], p[2], p[3]
    if odkud in SENAT and akce in ('27', '24', '164'):
        ev[h[1]].append(('senat', {'27': 'zamítnut', '24': 'vrácen', '164': 'zamítnut'}[akce], h[2][:10], h[3]))
    elif odkud in SNEM_SEN and akce in ('20', '15', '8'):
        ev[h[1]].append(('snem', {'20': 'přehlasováno', '15': 'verze Senátu', '8': 'nepřijato'}[akce], h[2][:10], h[3]))
rows = []
for t, e in ev.items():
    e.sort(key=lambda x: x[2])
    s = [x for x in e if x[0] == 'senat']
    if not s: continue
    s0 = s[0]
    po = [x for x in e if x[0] == 'snem' and x[2] >= s0[2]]
    vys = po[0][1] if po else ('nepřijato' if s0[1] == 'zamítnut' and any(True for _ in []) else 'bez rozhodnutí')
    tk = tisky.get(t, {})
    rows.append(dict(id_tisk=t, ct=tk.get('ct'), id_org_obd=tk.get('obdobi_org'), senat=s0[1], datum_senat=s0[2],
                     snemovna=vys, datum_snemovna=po[0][2] if po else '', id_hlas_snemovna=po[0][3] if po else '',
                     nazev=tk.get('nazev', ''), uplny_nazev=(tk.get('uplny', '') or '')[:300]))
rows.sort(key=lambda r: r['datum_senat'])
with open(OUT, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
c = collections.Counter((r['datum_senat'][:4], r['senat'], r['snemovna']) for r in rows)
print('celkem', len(rows))
for y in sorted({r['datum_senat'][:4] for r in rows}):
    z = {k[1:]: v for k, v in c.items() if k[0] == y}
    print(y, dict(z))
for r in rows[-25:]:
    print(r['datum_senat'], r['senat'], '->', r['snemovna'], r['datum_snemovna'], r['ct'], r['nazev'][:80])

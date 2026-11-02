import json,sys,collections,re
sys.stdout.reconfigure(encoding='utf-8')
CID={'524':'ano','525':'kdu','527':'ods-top09','523':'sen21-pirati','526':'stan','522':'nezarazeni'}
CNAME={'524':'Senátorský klub ANO 2011','525':'Senátorský klub KDU-ČSL a nezávislí','527':'Senátorský klub ODS a TOP 09','523':'Senátorský klub SEN 21 a Piráti','526':'Senátorský klub Starostové a nezávislí','522':'Senátoři nezařazení do klubu'}
def state(f):
    p=json.load(open(f,encoding='utf-8')); inc={i:CID[k] for k,ids in p['clubs'].items() for i in ids}
    return p,inc
p1,inc1=state('p_1.10.2026.json'); p17,inc17=state('p_17.10.2026.json')
kluby=[dict(id=CID[k],nazev=CNAME[k],pocet=len(v)) for k,v in p1['clubs'].items()]
kluby17=[dict(id=CID[k],nazev=CNAME[k],pocet=len(v)) for k,v in p17['clubs'].items()]
sen=[]
for pid,s in p1['sen'].items():
    sen.append(dict(obvod=s['obvod'],obvod_nazev=s['obvod_nazev'],jmeno=s['jmeno'],klub=inc1.get(pid),prislusnost_senat_cz=s['prislusnost'],konci2026=s['obvod']%3==0,senat_id=int(pid)))
sen.sort(key=lambda x:x['obvod'])
assert len(sen)==81 and len({s['obvod'] for s in sen})==81 and all(s['klub'] for s in sen)
chk=collections.Counter(s['klub'] for s in sen if s['konci2026']); print('konci2026',dict(chk))
print('all',dict(collections.Counter(s['klub'] for s in sen)))
byname={s['jmeno']:s for s in sen}
cvs={r[0]:r for r in json.load(open('dlv/cisel_cvs.json',encoding='utf-8'))['strany']}
def full(c): return cvs[c][2]
def norm(n):
    t=[x for x in n.split() if '.' not in x and x not in ('MBA','MHA','DiS','et')]
    return ' '.join([t[-1]]+t[:-1])
latest=json.load(open('latest.json',encoding='utf-8'))['se2']
kand=[]
for o in range(3,82,3):
    d=json.load(open(f'dlv/ob/{o}.json',encoding='utf-8'))
    z=d['zvoleny']; zl=z if isinstance(z,list) else ([z] if z else [])
    for r in d['vysledky']:
        if r[0] in (d['postupuje'] or []) or r[0] in zl:
            j=norm(r[1]); st=byname.get(j)
            kand.append(dict(obvod=o,obvod_nazev=d['obvodNazev'],cislo=r[0],jmeno=j,jmeno_s_tituly_csu=r[1],
              stav='zvolen_1_kolo' if r[0] in zl else '2_kolo',
              navrhujici=full(r[11]),navrhujici_zkratka=r[2],
              navrhujici_strana=full(r[12]),navrhujici_strana_zkratka=r[3],
              prislusnost='bez politické příslušnosti' if r[13]==99 else full(r[13]),prislusnost_zkratka=r[4],
              hlasy_1_kolo=r[5],procenta_1_kolo=r[6],
              senator_ted=inc1[str(st['senat_id'])] if st else None,
              senator_ted_obvod=st['obvod'] if st else None))
# cross-check names vs latest.json
for k in kand:
    L=latest[str(k['obvod'])]; names=[L[x]['name'] for x in ('a','b') if L.get(x)]+([L['winner']['name']] if L.get('winner') else [])
    if k['jmeno'] not in names: print('NAME MISMATCH',k['obvod'],k['jmeno'],names)
print(len(kand),'kandidatu;', sum(1 for k in kand if k['senator_ted']),'soucasnych senatoru')
for k in kand:
    if k['senator_ted']: print('  ',k['obvod'],k['jmeno'],k['senator_ted'],'(obvod',k['senator_ted_obvod'],')')
out=dict(
 popis='Senát PČR: složení klubů a senátoři před volbami 2026 (stav senat.cz k 1. 10. 2026, 81 senátorů) a kandidáti 2. kola + zvolení v 1. kole voleb 9.–10. 10. 2026 (registr ČSÚ, volby.gov.cz appdata).',
 stav_k='2026-10-01',vygenerovano='2026-10-17',
 kluby=kluby, kluby_stav_17_10_2026=dict(poznamka='Stav senat.cz k 17. 10. 2026: mandáty senátorů zvolených 2020 už vypršely (54 senátorů v klubech + 5 nově zvolených z 1. kola zatím bez klubu), klub SEN 21 a Piráti v tomto stavu neexistuje.',kluby=kluby17,senatoru_v_seznamu=len(p17['sen'])),
 senatori=sen,kandidati=kand,
 zdroje=['https://www.senat.cz/organy/index.php?par_1=K&lng=cz&ke_dni=1.10.2026&O=15',
  'https://www.senat.cz/organy/index.php?lng=cz&ke_dni=1.10.2026&O=15&par_2=522 (+ par_2=523, 524, 525, 526, 527 – stránky klubů)',
  'https://www.senat.cz/senatori/index.php?lng=cz&ke_dni=1.10.2026&O=15&par_2=2',
  'https://www.senat.cz/organy/index.php?par_1=K&lng=cz&ke_dni=17.10.2026&O=15 (+ stránky klubů a seznam senátorů k 17.10.2026, k 9.10. a 10.10.2026 pro kontrolu)',
  'https://www.senat.cz/senatori/index.php?lng=cz&ke_dni=17.10.2026&O=15&par_3=281 (Linhart – data mandátu)',
  'https://volby.gov.cz/appdata/senat/20261009/vysled/obvod/{3..81}.json',
  'https://volby.gov.cz/appdata/senat/20261009/cisel/cvs.json',
  'https://volby.gov.cz/appdata/senat/20261009/nastaveni.json'],
 poznamky=[
 'Ke dni 17. 10. 2026 už senat.cz neukazuje 81 senátorů: mandáty senátorů zvolených v roce 2020 (obvody dělitelné 3) skončily – u vítězů 1. kola 2020 kolem 3. 10. 2026 (např. Linhart mezi 2. a 4. 10. chybí v seznamu), u ostatních 10. 10. 2026. Proto jsou "kluby" a "senatori" vzaty ke dni 1. 10. 2026 (poslední plné složení 81). Stav k 17. 10. je zvlášť v kluby_stav_17_10_2026.',
 'Klub SEN 21 a Piráti ke 17. 10. 2026 v seznamu klubů senat.cz už není: jeho členům Láskovi (21), Suchardě Šípové (30) a Holáskovi (45) skončil mandát, zbylí dva (Krsek – 31, Rabas – 5) jsou ke 17. 10. vedeni jako nezařazení. Holásek ve 2. kole v obvodu 45 není.',
 'Kontrola: mezi obvody dělitelnými 3 (k 1. 10. 2026) STAN 11, ODS a TOP 09 9, KDU 3, SEN 21 a Piráti 3, ANO 1 – sedí se zadáním. Celkem k 1. 10.: ANO 15, KDU 12, ODS a TOP 09 30, SEN 21 a Piráti 5, STAN 18, nezařazení 1 = 81.',
 'navrhujici = plný název volební strany (kandidující subjekt, u koalic koalice, v JSON ČSÚ pole na indexu 2/11, tj. VSTRANA); navrhujici_strana = NSTRANA (strana z koalice, která kandidáta navrhla, index 3/12); prislusnost = PSTRANA (index 4/13, kód 99 = bez politické příslušnosti). Pořadí polí ve vysled/obvod/*.json odvozeno z dat, ČSÚ k němu nemá popis v souboru.',
 'Jména kandidátů převedena z formátu ČSÚ „Příjmení Jméno tituly“ na „Jméno Příjmení“ (tituly odstraněny); všechna sedí se jmény v latest.json.',
 'Zkratka koalice v Praze 1 (Čižinský) je v datech ČSÚ „KDU+Zel+PHASOBĚ“, latest.json ji má jako „KDU+Z+PRAHA+SEN“ – platí ČSÚ.',
 'Karel Zitterbart je současný senátor za obvod 57 Vyškov (ten nyní získal Jan Grolich), ve 2. kole kandiduje v obvodu 60 Brno-město proti současnému senátorovi Zdeňku Papouškovi.',
 'senator_ted = klub ke dni 1. 10. 2026 (před volbami). Pět vítězů 1. kola (Fiala, Linhart, Sobotka, Grulich, Grolich) má podle senat.cz nový mandát od 10. 10. 2026 a ke 17. 10. zatím nejsou v žádném klubu.',
 'Data volby.gov.cz jsou z 1. kola (generováno 2026-10-15); výsledky 2. kola (dnes) nejsou součástí.'
])
json.dump(out,open('senat-data.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)

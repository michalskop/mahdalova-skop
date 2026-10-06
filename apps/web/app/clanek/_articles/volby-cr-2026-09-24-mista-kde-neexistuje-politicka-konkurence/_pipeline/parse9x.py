import json, re, sys, pandas as pd
def num(s):
    s=s.replace('\xa0','').replace(' ','')
    try: return float(s)
    except: return None
def parse(Y):
    D=json.load(open(f'kv{Y}_raw.json',encoding='utf-8')); out=[]
    for r in D:
        rows=[x for x in r['rows'] if x]
        mand=None; lists=[]; vol=None; obal=None; obv=[]
        for i,x in enumerate(rows):
            n=[num(v) for v in x]
            # header row with mandates: first numeric row with >=8 numbers
            if mand is None and len(x)>=9 and all(v is not None for v in n[:9]):
                mand=int(n[0]); vol=n[-5] if len(n)>=10 else None
                hdr=x
            # list row: [por, name, hlasy, pct, kand, mand]
            if len(x)==6 and n[0] is not None and n[1] is None and n[4] is not None:
                lists.append(dict(por=int(n[0]),nazev=x[1],kand=int(n[4]),mand=int(n[5]) if n[5] is not None else None))
            # obce s volebními obvody: souhrn za strany bez počtu kandidátů [název, hlasy, %, mandáty, %]
            elif len(x)==5 and n[0] is None and n[1] is not None and n[3] is not None:
                obv.append(x[0])
        if not lists and obv:
            # počet kandidátů za obvody na stránce není; stran je víc → soutěž (KAND = -1 = neznámo)
            out.append(dict(obec=r['obec'],dz=r['dz'],name=r['name'],MANDATY=mand,LISTY=len(obv),KAND=-1,hdr=hdr if mand else None))
            continue
        out.append(dict(obec=r['obec'],dz=r['dz'],name=r['name'],MANDATY=mand,LISTY=len(lists),KAND=sum(l['kand'] for l in lists),hdr=hdr if mand else None))
    return pd.DataFrame(out)
if __name__=='__main__':
    d=parse(sys.argv[1]); print(len(d), d.MANDATY.isna().sum()); print(d.head(3).to_string()); print(d[d.MANDATY.isna()].head().to_string())

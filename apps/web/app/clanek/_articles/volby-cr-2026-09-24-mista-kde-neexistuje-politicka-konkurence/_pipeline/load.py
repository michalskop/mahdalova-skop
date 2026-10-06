import pandas as pd, glob, os
B=os.path.dirname(os.path.abspath(__file__))+'/d'
YEARS=[2002,2006,2010,2014,2018,2022,2026]
def rd(y,n):
    return pd.read_csv(f'{B}/{y}/csv/{n}.csv',sep=';',encoding='cp1250',dtype=str,keep_default_na=False)

def zast(y, typ='1'):
    """one row per zastupitelstvo (regular election), with lists/candidates/mandates"""
    rz=rd(y,'kvrzcoco'); rk=rd(y,'kvrk'); ro=rd(y,'kvros')
    if 'DATUMVOLEB' in rz:
        main=rz.DATUMVOLEB.mode()[0]
        rz=rz[rz.DATUMVOLEB==main]; rk=rk[rk.DATUMVOLEB==main]; ro=ro[ro.DATUMVOLEB==main]
    rz=rz[rz.TYPZASTUP==typ].copy()
    for c in ['MANDATY','POCOBYV','POCET_VS']: rz[c]=rz[c].astype(int)
    # u obcí s volebními obvody jsou v číselníku i řádky za celou obec (OBVODY=1) – beru jen řádky obvodů
    rz['OBVODY']=rz.OBVODY.astype(int)
    rzm=rz[rz.OBVODY==rz.groupby('KODZASTUP').OBVODY.transform('max')]
    mand=rzm.drop_duplicates(['KODZASTUP','COBVODU']).groupby('KODZASTUP').MANDATY.sum()
    g=rz.groupby('KODZASTUP').agg(NAZEV=('NAZEVZAST','first'),OBEC=('OBEC','first'),KRAJ=('KRAJ','first'),OKRES=('OKRES','first'),
        MANDATY=('MANDATY','sum'),POCOBYV=('POCOBYV','first'),NOBV=('COBVODU','nunique'))
    g['MANDATY']=mand
    rkA=rk[rk.PLATNOST=='A']
    g['KAND']=rkA.groupby('KODZASTUP').size().reindex(g.index).fillna(0).astype(int)
    # lists that have at least one valid candidate
    lists=rkA.groupby(['KODZASTUP','COBVODU'])['POR_STR_HL'].nunique()
    g['LISTY']=rkA.groupby('KODZASTUP').apply(lambda d: d[['COBVODU','POR_STR_HL']].drop_duplicates().shape[0]).reindex(g.index).fillna(0).astype(int)
    g['MAXLISTY_OBV']=lists.groupby('KODZASTUP').max().reindex(g.index).fillna(0).astype(int)
    g['YEAR']=y
    return g

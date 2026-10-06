import pandas as pd
d=pd.read_csv('oby02a_2026.csv',dtype=str)
cz=int(d[d.UZ01234596C=='CZ'].Hodnota.iloc[0])
ob=d[d.UZ01234596C.str.fullmatch(r'\d{6}')].rename(columns={'UZ01234596C':'kod_obce','Všechna území':'nazev','Hodnota':'obyvatel_2026'})[['kod_obce','nazev','obyvatel_2026']]
ob['obyvatel_2026']=ob.obyvatel_2026.astype(int)
x=pd.read_excel('csu2025/1300722503.xlsx',header=None).iloc[6:,[0,1,2,3]]
x.columns=['okres_nuts','kod_obce','nazev25','obyv_2025']; x=x.dropna(subset=['kod_obce']); x['kod_obce']=x.kod_obce.astype(int).astype(str)
krajn={'CZ010':'Hlavní město Praha','CZ020':'Středočeský','CZ031':'Jihočeský','CZ032':'Plzeňský','CZ041':'Karlovarský','CZ042':'Ústecký','CZ051':'Liberecký','CZ052':'Královéhradecký','CZ053':'Pardubický','CZ063':'Vysočina','CZ064':'Jihomoravský','CZ071':'Olomoucký','CZ072':'Zlínský','CZ080':'Moravskoslezský'}
okr=d[d.UZ01234596C.str.fullmatch(r'CZ\d{3}[\dA-C]')].set_index('UZ01234596C')['Všechna území'].to_dict()
ob=ob.merge(x[['kod_obce','okres_nuts','obyv_2025']],on='kod_obce',how='left')
print('bez okresu:',ob.okres_nuts.isna().sum())
ob['okres']=ob.okres_nuts.map(okr); ob.loc[ob.kod_obce=='554782','okres']='Hlavní město Praha'
ob['kraj_nuts']=ob.okres_nuts.str[:5]; ob['kraj']=ob.kraj_nuts.map(krajn)
v=pd.read_csv('vaz_orp.csv',dtype=str)[['chodnota1','chodnota2','text2']].rename(columns={'chodnota1':'kod_obce','chodnota2':'kod_orp','text2':'orp'})
ob=ob.merge(v,on='kod_obce',how='left')
print('bez ORP:',ob[ob.orp.isna()][['kod_obce','nazev']].values.tolist())
ob=ob[['kod_obce','nazev','obyvatel_2026','obyv_2025','kraj','kraj_nuts','okres','okres_nuts','orp','kod_orp']].rename(columns={'obyv_2025':'obyvatel_2025'})
ob['vojensky_ujezd']=ob.kod_obce.isin(['545422','592935','555177','503941'])
ob.to_csv('obce_cz_2026.csv',index=False,encoding='utf-8-sig')
ob=ob[~ob.vojensky_ujezd].copy()
print('obci',len(ob),'soucet',ob.obyvatel_2026.sum(),'CZ',cz)
print('median',ob.obyvatel_2026.median(),'prumer',round(ob.obyvatel_2026.mean(),1))
bins=[0,200,500,1000,2000,5000,10000,50000,10**8]; lab=['do 199','200–499','500–999','1 000–1 999','2 000–4 999','5 000–9 999','10 000–49 999','50 000+']
ob['sk']=pd.cut(ob.obyvatel_2026,bins,right=False,labels=lab)
g=ob.groupby('sk',observed=False).agg(pocet_obci=('kod_obce','count'),obyvatel=('obyvatel_2026','sum')).reset_index()
g['podil_obci_pct']=(100*g.pocet_obci/len(ob)).round(2); g['podil_obyvatel_pct']=(100*g.obyvatel/ob.obyvatel_2026.sum()).round(2)
g.rename(columns={'sk':'skupina'}).to_csv('velikost_skupiny.csv',index=False,encoding='utf-8-sig'); print(g.to_string())
print('pod 100:',(ob.obyvatel_2026<100).sum(),' pod 50:',(ob.obyvatel_2026<50).sum(), ' pod 1000 kumul:',(ob.obyvatel_2026<1000).sum(), round(100*(ob.obyvatel_2026<1000).mean(),1), 'obyv',ob[ob.obyvatel_2026<1000].obyvatel_2026.sum())
print(ob.nsmallest(6,'obyvatel_2026')[['kod_obce','nazev','obyvatel_2026','okres']].to_string())
print(ob.nlargest(6,'obyvatel_2026')[['nazev','obyvatel_2026']].to_string())
print('pod 500 kumul',(ob.obyvatel_2026<500).sum(),round(100*(ob.obyvatel_2026<500).mean(),1))
print(ob.groupby('kraj').kod_obce.count().sort_values().to_string())

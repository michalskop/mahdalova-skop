---
title: "Do obecních zastupitelstev i Senátu 2026 kandiduje nejméně lidí za víc než dvacet let"
date: "2026-08-27"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Komunální volby 2026 mají nejméně kandidátů od roku 2002, senátní od roku 2000. Za poklesem na obou úrovních stojí to samé: SOCDEM (ČSSD), KSČM a další zavedené strany přišly o dvě třetiny kandidátů, v obcích i v Senátu zároveň. Žen naopak přibývá, hlavně na radnicích – v Senátu jejich podíl zůstává stejně nestálý jako dřív."
coverImage: "images/main.png"
filter: ["analýza"]
tags: ["volby", "volby 2026", "komunální volby", "Senát", "kandidáti", "ženy", "muži", "politika", "data"]
promoted: 0
---

Na kandidátky obecních zastupitelstev se letos zapsalo 190 174 lidí, nejméně od roku 2002. Do Senátu kandiduje 154 lidí, nejméně od roku 2000. Obě volby se navíc konají ve stejný víkend, 9. a 10. října ([Přehled termínů a lhůt pro volby do Senátu 2026](https://mv.gov.cz/volby/soubor/prehled-terminu-a-lhut-pro-volby-do-senatu-2026.aspx)). Prošli jsme registry kandidátů z otevřených dat [volby.gov.cz](https://volby.gov.cz) od začátku obou typů voleb a podívali se, jak se v čase mění, kdo kandiduje.

<KeyNumbers yamlFile="key-stats.yaml" />

## Komunální volby: nejméně kandidátů od roku 2002

<VegaChart dataFile="data/muni_pocet.json" />

Počet komunálních kandidátů rostl do roku 2014, kdy se na kandidátky zapsalo 233 877 lidí, a od té doby klesá. V roce 2026 kandiduje 190 174 lidí: o 19 % méně než na vrcholu a o 1,6 % méně než v roce 2002, prvních volbách, pro které má Český statistický úřad otevřená data.

```infobox info
Počítáme kandidáty z hlavního termínu voleb každého ročníku (např. 2002: 1.–2. 11., 2026: 9.–10. 10.) se statusem „registrován" nebo „registrován, později odvolán". Nepočítáme drobné dodatečné a opakované volby, které se v jednotlivých obcích konají v následujících letech, když se zastupitelstvo nepodařilo ustavit napoprvé, nebo když došlo k opakovaným volbám.
```

Pokles se ale netýká všech obcí stejně: čím větší obec, tím víc kandidátů od roku 2014 ztratila. U obcí nad 50 tisíc obyvatel je propad 27 procent, u vesnic do 300 obyvatel 6 procenta.

Stejně jako v Senátu jde pokles vysledovat i ke konkrétním stranám. Nominující strana je v datech jeden název napříč celou zemí bez ohledu na obec, takže se dá sečíst přes všech 6 394 obcí a městských částí.

<ChartRow cols={5} title="Zavedené strany ztratily od roku 2014 dvě třetiny komunálních kandidátů" subtitle="Počet kandidátů nominovaných danou stranou v hlavním termínu komunálních voleb, 2002–2026. Nahoře současná vládní koalice a dvě strany, které se propadly nejvíc; dole současná opozice." source="volby.gov.cz – registry kandidátů KV2002–KV2026, hlavní den voleb">
<VegaChart dataFile="data/muni_strany_ano.json" />
<VegaChart dataFile="data/muni_strany_spd.json" />
<VegaChart dataFile="data/muni_strany_motoriste.json" />
<VegaChart dataFile="data/muni_strany_socdem.json" />
<VegaChart dataFile="data/muni_strany_kscm.json" />
<VegaChart dataFile="data/muni_strany_ods.json" />
<VegaChart dataFile="data/muni_strany_stan.json" />
<VegaChart dataFile="data/muni_strany_pirati.json" />
<VegaChart dataFile="data/muni_strany_kdu.json" />
<VegaChart dataFile="data/muni_strany_top09.json" />
</ChartRow>

Propad je tu ještě výraznější než v Senátu. Stejných pět starších stran (SOCDEM, KSČM, ODS, KDU-ČSL a TOP 09) mělo v roce 2014 dohromady 77 066 kandidátů, v roce 2026 25 355 – pokles o 67 procent. Samotná SOCDEM (dřív ČSSD) klesla z 18 429 na 1 351 kandidátů, tedy o 93 procent. ANO, STAN, SPD, Piráti a Motoristé dohromady za stejnou dobu narostly z 15 390 na 20 273 kandidátů, o 32 procent. To pokrývá jen zlomek toho, co starší strany ztratily. Zbytek, nezávislí a tisíce místních sdružení bez celostátní značky, naopak mírně přibyl: z 141 421 na 144 546 kandidátů.

Napříč obcemi platí ještě jedno pravidlo, tentokrát bez ohledu na to, jak se v čase mění: čím menší obec, tím větší podíl jejích obyvatel je na kandidátce. V Probulově na Písecku letos kandiduje 24 z 69 obyvatel, víc než každý třetí, počítaje v tom i děti, které kandidovat nemohou. V Praze naproti tomu kandiduje 1 060 lidí z 1 407 084 obyvatel, 0,08 procenta. Medián mezi všemi obcemi je kolem 3,4 procenta.

<VegaChart dataFile="data/muni_pop_rate.json" />

Probulov a Praha jsou jen krajní body jednoho pravidla: čím větší obec, tím menší procento jejích obyvatel obvykle kandiduje.

<VegaChart dataFile="data/muni_zeny.json" />

Podíl žen mezi kandidujícími na komunální úrovni roste nepřetržitě od roku 2002: z 28 na 35 procent, tedy o 7 procentních bodů.

<VegaChart dataFile="data/muni_vek.json" />

Typický kandidující zároveň mírně stárne, medián věku vzrostl z 46 na 48 let. Rozptyl je ale v obou pohlavích a v každém ročníku široký: ve vzorku jsou kandidáti od 18 let (zákonné minimum) po víc než 90.

## Senát: nejméně kandidátů od roku 2000

<VegaChart dataFile="data/senat_pocet.json" />

V řádných senátních volbách, kdy se obnovuje třetina z 81 obvodů, platí podobný vzorec jako u obcí: vrchol v roce 2014 (243 kandidátů) a pokles od té doby. Rok 2026 je se 154 kandidáty nejníž od roku 2000. Níž bylo jedině v roce 1998, při druhých volbách v historii Senátu. Propad od vrcholu je tu navíc výraznější než u komunálních voleb: 37 procent proti 19 procentům.

U Senátu jde tenhle pokles vysledovat až ke konkrétním stranám: obvodů je 27 a nominující stranu evidujeme jako jeden název napříč celou historií, takže se dá sledovat vývoj každé strany zvlášť.

<ChartRow cols={5} title="Stejné strany ztratily přes dvě třetiny kandidátů i v Senátu" subtitle="Počet kandidátů nominovaných danou stranou v řádných senátních volbách, 1998–2026 (osa 0–27, čárkovaně plná kandidátka na všech 27 obvodů). Nahoře současná vládní koalice a dvě strany, které se propadly nejvíc; dole současná opozice." source="volby.gov.cz – registry kandidátů SE1996–SE2026, řádné volby">
<VegaChart dataFile="data/senat_strany_ano.json" />
<VegaChart dataFile="data/senat_strany_spd.json" />
<VegaChart dataFile="data/senat_strany_motoriste.json" />
<VegaChart dataFile="data/senat_strany_cssd.json" />
<VegaChart dataFile="data/senat_strany_kscm.json" />
<VegaChart dataFile="data/senat_strany_ods.json" />
<VegaChart dataFile="data/senat_strany_stan.json" />
<VegaChart dataFile="data/senat_strany_pirati.json" />
<VegaChart dataFile="data/senat_strany_kdu.json" />
<VegaChart dataFile="data/senat_strany_top09.json" />
</ChartRow>

Mezi vrcholem v roce 2014 a rokem 2026 ubylo celkem 89 kandidátů. Pět tehdy zavedených stran na tom má samo o sobě podíl 81 kandidátů: SOCDEM (dřív ČSSD, stejná strana) spadla ze 27 kandidátů (plná kandidátka na všech 27 obvodů) na 2, KSČM z 27 na 8, ODS z 24 na 14, KDU-ČSL ze 17 na 5 a TOP 09 z 18 na 3. ANO, STAN a SPD naopak za stejnou dobu společně přibraly 25 kandidátů, tedy necelou třetinu toho, co ztratily předchozí strany. Zbylých 33 chybějících kandidátů připadá na nezávislé a na desítky menších hnutí, z nichž žádné jednotlivě nestaví víc než pár kandidátů v celé zemi.

Ze zbylých dvou současných sněmovních stran měli Piráti nejvíc kandidátů v letech 2018 a 2020 (13), letos mají 3. Motoristé, třetí strana vládní koalice, pod vlastní značkou senátního kandidáta prakticky nestaví: jediného měli v roce 2024, letos žádného.

<VegaChart dataFile="data/senat_zeny.json" />

Podíl žen mezi kandidujícími do senátu se za celou dobu, co Senát existuje, nedostal přes čtvrtinu. Pohybuje se od 9 procent v roce 1998 po 25 procent v roce 2022, letos je to 22,1 procenta. Na radnicích je to přesně obráceně: podíl žen tam roste každé volby znovu.

<VegaChart dataFile="data/senat_vek.json" />

Typický senátní kandidát je navíc podstatně starší než komunální. Medián věku se drží kolem 56 až 57 let už od roku 2010, o deset let výš než na radnicích.

## Co data neukazují

Nominující strana v datech znamená, kdo kandidáta oficiálně přihlásil. Neznamená to jeho členství ve straně, ani proč strana v dané obci či obvodu přestala kandidovat. Jestli za tím byl nedostatek lidí, peněz, nebo rozhodnutí podpořit místo vlastní kandidátky jinou, to z čísel samotných nevyčteme.

```infobox info
Pohlaví kandidátů v datech volby.gov.cz chybí, odhadli jsme ho z příjmení (ženská přechýlená příjmení na -á) a tam, kde příjmení nerozhodne, ze jména pomocí knihovny [gender-guesser](https://pypi.org/project/gender-guesser/). Metoda se u testovaných případů spletla výjimečně, u cizojazyčných jmen bez české koncovky ale může podíl žen mírně podhodnotit.
```

## Stejný kolaps stran, jiný osud uvolněného místa

Voliči budou 9. a 10. října vybírat z tenčí nabídky, než na jakou byli zvyklí ještě před deseti lety. Platí to pro obecní zastupitelstva i pro Senát stejně a stojí za tím do velké míry to samé: SOCDEM, KSČM, ODS, KDU-ČSL a TOP 09 ztratily od roku 2014 na obou úrovních zhruba dvě třetiny kandidátů. Liší se to, co po nich uvolněné místo zaplnilo. V obcích ho z velké části pokryli nezávislí a lokální sdružení bez celostátní značky, jejichž počet mírně vzrostl, takže tam celkový úbytek zůstal na 19 procentech. V Senátu taková náhrada chybí, a tak propad dosáhl 37 procent, přestože zavedené strany se tam propadly jen o něco víc než v obcích. Rostoucí podíl žen mezi kandidáty je pak jev, který se v obcích prohlubuje rok od roku, ale do Senátu se zatím nepropsal.

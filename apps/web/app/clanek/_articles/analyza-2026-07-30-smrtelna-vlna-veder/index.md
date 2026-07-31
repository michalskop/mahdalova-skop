---
title: "Horko v Německu zabíjelo, ale ve Španělsku nikoliv."
date: "2026-07-31"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Vlna veder zabila jen v Německu, Francii, Belgii a Nizozemsku zhruba 20 000 lidí navíc. Ve Španělsku a Bulharsku, zvyklých na horko, se nadúmrtnost neobjevila – a další vlna je na cestě během následujících dní."
coverImage: "images/main.png"
filter: ["analýza", "klima"]
tags: ["klimatická změna", "nadúmrtnost", "klima", "demografie"]
promoted: 1
---

Vlna veder na konci června zabila v Evropě desítky tisíc lidí. Jen v Německu, Francii, Belgii a Nizozemsku, odkud již máme data, jde o zhruba 20 000 lidí navíc za dva klíčové nejteplejší týdny než jiné roky.
Nezabíjela však samotná vysoká teplota, ale nepřipravenost na ni.

Podobné horko se do Evropy vrací i v nejbližších dnech. Data ukazují na rozdíl mezi zeměmi, kde jsou lidé na horko zvyklí, a těmi, kde horko zabíjí.

## V Berlíně bylo stejně horko jako v Madridu, umíralo se ale jen v Německu

V nejteplejším týdnu od 22. do 28. června vystoupala teplota v německém hlavním městě Berlíně i v hlavním městě Španělska Madridu na stejných maximálních 39 °C.

Ale v celém Německu ten týden zemřelo o třetinu víc lidí, než je pro tuhle dobu roku běžné, zatímco ve Španělsku se nic výjimečného nestalo.

<VegaChart dataFile="data/chart1a_temp_berlin_madrid.json" />

<VegaChart dataFile="data/chart1b_deaths_germany_spain.json" />

To znamená, že i při stejném vedru umírali lidí "navíc" jen v Německu – v stejně horkém Španělsku ne.

```infobox info
Co graf ukazuje a co ne: Světle barevný pruh je pro porovnání, je to rozmezí - nejteplejší a nejstudenější - z posledních čtyř let pro stejný týden v roce. Čísla jsou hrubá úmrtnost, tedy počet zemřelých na 1000 obyvatel přepočteno na celý rok – tam, kde srovnáváme více zemí, na to upozorňujeme zvlášť. Teplotu srovnáváme mezi konkrétními hlavními městy (Berlín, Madrid), jsou to ilustrační reprezentanti za celé země. Úmrtnost je přímo za celou zemi. Nejnovější týdny jsou v datech označené jako předběžné a mohou se ještě revidovat.
```

Vysvětlením může být, že Španělé jsou na vysoké teploty dlouhodobě zvyklí a přizpůsobili se jim – architekturou a vybavením budov (garniže, okenice), denním rytmem (siesta, pozdní večerní život) i klimatizací: tu má odhadem 40 % španělských domácností, v Německu podle odhadu spolkového úřadu pro životní prostředí je to jen asi 6 % ([Carbon Brief](https://www.carbonbrief.org/eight-facts-about-air-conditioning-amid-an-overheated-global-debate)). Německo zatím podobnou mnohaletou zkušenost oproti Španělsku s horky nemá.

## Francie a Nizozemsko na tom byly jako Německo, Bulharsko a Pobaltí ne

Stejně jako v Německu vlna veder zabíjela také ve Francii, Nizozemsku nebo Belgii, odkud již máme červnová data. Naopak Bulharsko, kde jsou na horka také již dávno zvyklí a připravení, na tom bylo podobně jako Španělsko. Litva se sice v tom týdnu také oteplila, ale jen na 32 °C, což neohrožuje lidské zdraví, nárůst úmrtí tam nebyl. Estonsko zůstalo chladnější a horko ho nezasáhlo vůbec.

<ChartRow title="Vlna veder měla různý dopad v zemích Evropy" subtitle="Roční úmrtnost přepočtená z dat daného týdne (na 1000 obyvatel): {line} 2026   {band} rozmezí 2022–2025" source="[Human Mortality Database – Short-term Mortality Fluctuations](https://www.mortality.org/Data/STMF)">
<VegaChart dataFile="data/chart2a_rate_germany_france.json" />
<VegaChart dataFile="data/chart2b_rate_spain_bulgaria.json" />
<VegaChart dataFile="data/chart2c_rate_lithuania_estonia.json" />
</ChartRow>

To znamená, že vlna veder zvýšila úmrtnost v Německu i ve Francii, ale ne ve Španělsku, Bulharsku, Litvě ani v Estonsku.

Rozdílné úrovně počtů úmrtí jsou dané hlavně rozdílnou věkovou strukturou v daných zemích – čísla pro jednoduchost nejsou přepočtená na stejnou věkovou strukturu (tzv. věková standardizace). Procentuální nárůst nad běžnou úmrtnost ale vždy porovnáváme vůči vlastní historii dané země, takže věková struktura není tak podstatná.

## Zda horko zabíjelo i v Česku, zatím nevíme. Ale tušíme.

Jak to bylo v Česku? Teplotně byla vlna veder stejně výjimečná jako v Německu – v Praze stejně jako v Berlíně bylo 39 °C. Čísla o úmrtích za konec června ale ještě nejsou k dispozici. Pokud teplota a úmrtnost souvisí stejně jako v Německu, uvidíme podobný nárůst, až data dorazí.

## Horko zabíjelo čtyřicátníky skoro stejně jako devadesátníky

Horko v Německu nebo ve Francii zabíjelo napříč všemi dospělými věkovými skupinami – procentuální nárůst úmrtí byl u čtyřicátníků podobný jako u šedesátníků, v Belgii dokonce o něco vyšší u lidí mezi 15 a 64 lety než u sedmdesátníků. V absolutních číslech ale umřelo nejvíc lidí nad 85 let, protože v téhle skupině umírá běžně mnohem víc lidí i bez vlny veder.

<VegaChart dataFile="data/chart3_age_germany.json" />

To znamená: nejvíce lidí umírá v nejvyšších věkových skupinách, ale v procentuálním nárůstu nad běžnou úmrtností je to stejné pro všechny dospělé.

## Ve špičce horší než chřipková zima, hluboko pod covidem

Pro srovnání – jak moc vlna horka zabíjela v porovnání s covidem nebo běžnou zimou.

V zimě umírá obecně více lidí než v létě, dýchací onemocnění, chladnější teploty (i doma), snížená imunita (např. méně vitaminu D).
Ve svém špičkovém týdnu na konci června byla vlna veder v Německu smrtelnější než špička běžné chřipkové zimy. Zima ale trvá měsíce místo dnů či několika málo týdnů jako horka, takže za celou sezónu způsobí obvykle víc úmrtí než jedna vlna veder.

Porovnání s covidem? I Německo, které pandemií proplulo v evropském srovnání relativně dobře, mělo víc než jednu covidovou vlnu – tou nejhorší (konec prosince 2020) prošlo s nadúmrtností přes 40 %, tedy o něco víc než letošní vlna veder. Na rozdíl od horka ale covidové vlny trvaly týdny až měsíce, ne dny. Ve víc zasažených zemích byly rozdíly propastné: ve Španělsku vyskočila úmrtnost hned na jaře 2020, na samém začátku pandemie, o 150 %. V Bulharsku, kde patřila proočkovanost k nejnižším v Evropě, dosáhla nadúmrtnost na podzim 2021 skoro 90 % a vlny úmrtí pokračovaly až do roku 2022.

<ChartRow title="Covid vychýlil úmrtnost mnohem výš než letošní vlna veder" subtitle="{line} 2026   {dashed} 2020   {band} rozmezí 2022–2025" source="[Human Mortality Database – Short-term Mortality Fluctuations](https://www.mortality.org/Data/STMF)">
<VegaChart dataFile="data/chart4_nemecko.json" />
<VegaChart dataFile="data/chart4_francie.json" />
<VegaChart dataFile="data/chart4_spanelsko.json" />
<VegaChart dataFile="data/chart4_bulharsko.json" />
<VegaChart dataFile="data/chart4_litva.json" />
<VegaChart dataFile="data/chart4_cesko.json" />
</ChartRow>

To znamená: i tam, kde letošní vlna veder úmrtnost zvýšila, byla covidová vlna mnohem výraznější a delší.

```infobox default
Co dělat v horkých dnech: hlídejte si pitný režim, omezte pobyt venku v nejteplejších hodinách a zajděte za osamělými sousedy a staršími příbuznými – právě oni jsou nejohroženější a často si o pomoc neřeknou sami. Zkuste na pár dní přizpůsobit denní rytmus jako ve Španělsku: stín přes den, aktivita hlavně ráno a potom až večer. Např. 40 % lidí ve Španělsku si aspoň někdy po obědě v čase siesty zdřímne, každý šestý španěl dokonce každý den - jak reportoval [El País](https://verne.elpais.com/verne/2016/04/05/articulo/1459866604_782462.html).
```

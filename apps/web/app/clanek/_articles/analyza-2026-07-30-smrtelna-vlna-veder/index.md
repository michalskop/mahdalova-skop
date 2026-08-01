---
title: "Berlín a Madrid měly 39 °C. Úmrtnost ale vybočila jen v Německu"
date: "2026-07-31"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Stejně vysoká teplota měla v evropských zemích rozdílné následky. Data ukazují, proč nestačí sledovat teploměr – a co z toho plyne pro Česko, které se na podobná vedra teprve připravuje."
coverImage: "images/main.png"
filter: ["analýza", "klima"]
tags: ["klimatická změna", "nadúmrtnost", "klima", "demografie"]
promoted: 1
---

V Berlíně i Madridu vystoupala teplota ve stejném týdnu na 39 °C. V Německu zemřelo o třetinu více lidí, než bývá na konci června obvyklé. Ve Španělsku celková úmrtnost zůstala v rozpětí posledních let – přesto tamní systém přisoudil horku přes tisíc úmrtí za celý měsíc.

Zdánlivý rozpor ukazuje, proč se následky veder nedají vyčíst z teploměru ani z jediného čísla o zemřelých. Rozhoduje věk a zdraví obyvatel, délka horka, podoba domů a měst i to, zda úřady vědí, koho včas varovat a kam ho ukrýt před vedrem.

Česka se tato otázka týká bezprostředně. V Doksanech naměřili 28. června 41,9 °C – [nové absolutní teplotní maximum pro území Česka](https://www.chmi.cz/-/jak%C3%BD-byl-nejteplej%C5%A1%C3%AD-den-v-historii-%C4%8Dr-). Údaje o české úmrtnosti za konec června zatím chybějí. Víme však, že z krajských měst má plán pro vlny veder jen Praha.

## Stejných 39 °C, jiná odchylka v úmrtnosti

V nejteplejším týdnu od 22. do 28. června vystoupala maximální teplota v Berlíně i Madridu na 39 °C. Dopad této vlny veder na celkovou úmrtnost obou zemí se však lišil.

<VegaChart dataFile="data/chart1a_temp_berlin_madrid.json" />

V Německu se týdenní úmrtnost dostala výrazně nad celé rozpětí stejného týdne v letech 2022–2025. Ve Španělsku zůstala uvnitř tohoto pásma.

<VegaChart dataFile="data/chart1b_deaths_germany_spain.json" />

```infobox info
Co graf ukazuje: Světlé pásmo zachycuje rozpětí hodnot za stejný týden v letech 2022–2025. Úmrtnost uvádíme jako hrubý počet zemřelých na 1000 obyvatel, přepočtený na celý rok. Teploty pocházejí z hlavních měst a ilustrují počasí v Berlíně a Madridu; údaje o úmrtnosti se vztahují k celým zemím. Nejnovější týdny jsou předběžné a mohou se ještě změnit.
```

Tento graf nedokazuje, že ve Španělsku horko nikoho nezabilo. Španělský systém MoMo odhadl za červen [937 úmrtí připsatelných vysokým teplotám](https://momo.isciii.es/panel_momo/). Jen mezi 24. a 26. červnem jich evidoval 316. Červen byl ve Španělsku podle tohoto modelu druhý nejsmrtelnější z hlediska horka od začátku srovnatelné řady v roce 2015.

Obě čísla mohou platit současně. MoMo modeluje, kolik úmrtí lze připsat teplotě – porovnává pozorovanou úmrtnost s očekávaným počtem a zohledňuje vztah mezi horkem a úmrtími. Náš graf se ptá, zda celková úmrtnost vybočila z rozpětí čtyř předchozích let. Ve Španělsku jsou úmrtí spojená s vedrem součástí i nedávných let, s nimiž letošek srovnáváme. Běžné pásmo proto není pásmem bez obětí.

## Zkušenost pomáhá, sama však rozdíl nevysvětluje

Španělsko budovalo ochranu před horkem po desetiletí. Domy mají častěji venkovní žaluzie a okenice, přibližně 40 % domácností používá klimatizaci; v Německu je to kolem 6 % ([srovnání klimatizace v evropských domácnostech, Carbon Brief](https://www.carbonbrief.org/eight-facts-about-air-conditioning-amid-an-overheated-global-debate)).

Rozdíl je také v organizaci státu. Španělské ministerstvo zdravotnictví každý rok spouští plán, který propojuje předpověď počasí, teplotní prahy pro 182 oblastí, denní sledování úmrtí a konkrétní postupy při jednotlivých stupních nebezpečí. [Plán pro rok 2026](https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6926) upravil místní výstražné hranice podle nových dat o teplotě a úmrtnosti. [Podrobně jsme španělský systém popsali v samostatném článku.](/specialy/data-pro-budouci-premierku/10-klimaticka-zmena/06-spanelsko-varovani)

Ani to ze Španělska nedělá bezpečnou zemi. Červnových 937 úmrtí připsaných horku ukazuje hranice adaptace. Ochrana může následky snížit, ale s rostoucí teplotou je neodstraní.

Z našich dat navíc nelze určit, nakolik rozdíl mezi Německem a Španělskem způsobila právě připravenost. Výsledek ovlivňuje délka a noční průběh horka, vlhkost, věková a zdravotní skladba obyvatel, regionální rozložení teplot i odlišné zpoždění hlášení úmrtí. Srovnání proto ukazuje rozdílný dopad, nikoli jedinou příčinu.

## Horko zasáhlo západ Evropy nerovnoměrně

Podobný nárůst celkové úmrtnosti jako v Německu vidíme ve Francii, Nizozemsku a Belgii, odkud už máme červnová data. Bulharsko se naopak podobalo Španělsku: jeho úmrtnost zůstala v rozpětí nedávných let. V Litvě vystoupala teplota přibližně jen na 32 °C, úmrtnost nad běžné pásmo nevzrostla. Estonsko tato vlna zasáhla méně.

<ChartRow title="Vlna veder měla různý dopad v zemích Evropy" subtitle="Roční úmrtnost přepočtená z dat daného týdne (na 1000 obyvatel): {line} 2026   {band} rozmezí 2022–2025" source="[Human Mortality Database – Short-term Mortality Fluctuations](https://www.mortality.org/Data/STMF)">
<VegaChart dataFile="data/chart2a_rate_germany_france.json" />
<VegaChart dataFile="data/chart2b_rate_spain_bulgaria.json" />
<VegaChart dataFile="data/chart2c_rate_lithuania_estonia.json" />
</ChartRow>

Samotnou výši úmrtnosti mezi zeměmi nelze přímo porovnávat. Čísla nejsou věkově standardizovaná a významně je ovlivňuje rozdílná skladba obyvatel. Sledujeme proto hlavně to, zda se každá země odchýlila od vlastní nedávné historie.

První celoevropské součty potvrzují, že nešlo o malou odchylku. EuroMOMO zaznamenalo v týdnu od 22. do 28. června přes 10 000 nadúmrtí. Koordinátor systému Lasse Vestergaard uvedl, že tak souběžný nárůst neměl jiné zjevné vysvětlení než vlnu veder ([souhrn evropských dat, AP](https://apnews.com/article/af0dbdc06870732e52f8d10bcebb5385)). Nadúmrtí ovšem není totéž co lékařem potvrzená příčina smrti; jde o rozdíl mezi pozorovaným a očekávaným počtem zemřelých.

## Česko překonalo teplotní rekord, plán má jen Praha

V Praze bylo stejně jako v Berlíně 39 °C. V Doksanech v Ústeckém kraji teplota dosáhla 41,9 °C a překonala dosavadní české maximum o 1,5 stupně. Zda se horko promítlo také do české úmrtnosti, zatím nevíme: data za konec června ještě nejsou k dispozici.

Připravenost měst však zmapovat lze. [Průzkum iROZHLAS.cz mezi krajskými městy](https://www.irozhlas.cz/zpravy-domov/chladici-oazy-a-vic-mlzitek-ceska-mesta-se-brani-vlnam-vedra-plan-ma-ale-jen_2607060600_jva) zjistil, že krizový plán pro vlny veder má pouze Praha. Ostatní města používají jednotlivá opatření – kropicí vozy, mlžítka, pítka nebo dočasně otevřené klimatizované místnosti –, ale nemají předem daný postup, který by propojil zdravotníky, sociální služby, policii, hasiče a cílenou pomoc lidem ve vyšším riziku.

Pražský systém se teprve skládá. Mapa míst k ochlazení už funguje, město připravuje síť chladicích oáz a plné propojení s krizovým řízením plánuje podle magistrátu do roku 2030. Další podobné léto může přijít dřív.

## Nárůst se týkal všech dospělých, nejvíc obětí bylo mezi nejstaršími

V Německu a Francii vzrostla úmrtnost ve všech sledovaných dospělých věkových skupinách. Procentní odchylka u lidí ve věku 15–64 let byla v nejteplejším týdnu srovnatelná s některými staršími skupinami.

V absolutních počtech však zemřelo nejvíce lidí nad 85 let. V této skupině je počet úmrtí vysoký i za běžných podmínek, takže podobný procentní nárůst představuje více lidských životů.

<VegaChart dataFile="data/chart3_age_germany.json" />

Graf tedy neříká, že je horko pro mladší a nejstarší obyvatele stejně nebezpečné. Ukazuje, že zvýšení proti běžné úmrtnosti zasáhlo celé dospělé věkové rozpětí, zatímco největší absolutní počet obětí připadl na nejstarší lidi.

## Osm vnoučat a jeden rozsudek, který stát stále plní

Rosmarie Wydler-Wälti z Basileje má osm vnoučat. Dvě z nich kdysi vzala na klimatickou demonstraci; nesly transparent s nápisem „Keep the earth cool“. „Bojujeme také za naše děti a vnoučata,“ vysvětlovala později [v reportáži švýcarského časopisu Grosseltern](https://grosseltern-magazin.ch/klimaseniorin/).

Wydler-Wälti spolupředsedá sdružení KlimaSeniorinnen, které zastupuje více než 2 000 starších Švýcarek. Ženy se obrátily na Evropský soud pro lidská práva, protože vysoké teploty ohrožují starší ženy zvlášť silně a Švýcarsko podle nich nedělalo dost pro omezení oteplování.

Velký senát jim v dubnu 2024 dal za pravdu. Rozhodl, že [Švýcarsko porušilo právo na účinnou ochranu před vážnými dopady klimatické změny na život, zdraví a kvalitu života](https://www.echr.coe.int/w/grand-chamber-rulings-in-the-climate-change-cases). Soud zdůraznil také mezigenerační rozdělení břemene: dnešní rozhodnutí dopadají na lidi, kteří je ještě nemohou ovlivnit.

Rozsudkem příběh neskončil. Výbor ministrů Rady Evropy, který dohlíží na plnění verdiktů, v září 2025 uznal nový švýcarský legislativní rámec, ale [případ ponechal pod dohledem](https://www.coe.int/be/web/portal/-/implementing-echr-rulings-latest-decisions-from-the-committee-of-ministers-2). Stát má dál dokládat, zda jeho opatření skutečně odpovídají rozsudku. Švýcarské seniorky tedy vyhrály spor o princip; jeho převedení do dostatečné ochrany stále kontrolují.

Jejich případ posouvá otázku veder za hranice osobní opatrnosti. Zavřít žaluzie a napít se musí člověk sám. Včasné varování, dostupné chladné místo, fungující sociální službu a město stavěné pro nové klima si jednotlivec zařídit nemůže.

## Jedna horká špička byla horší než zimní, covid trval déle

Ve špičkovém týdnu na konci června vzrostla úmrtnost v Německu více než v nejhorším týdnu běžné chřipkové zimy. Zimní zvýšená úmrtnost však obvykle trvá déle, a za celou sezonu proto může způsobit více úmrtí než jedna krátká vlna veder.

Covid byl ještě výraznější. Německo zaznamenalo na konci prosince 2020 nadúmrtnost přes 40 %. Ve Španělsku úmrtnost na jaře 2020 vyskočila přibližně o 150 % a v Bulharsku na podzim 2021 téměř o 90 %. Pandemie navíc netrvala dny, ale v opakovaných vlnách měsíce a roky.

<ChartRow title="Covid vychýlil úmrtnost mnohem výš než letošní vlna veder" subtitle="{line} 2026   {dashed} 2020   {band} rozmezí 2022–2025" source="[Human Mortality Database – Short-term Mortality Fluctuations](https://www.mortality.org/Data/STMF)">
<VegaChart dataFile="data/chart4_nemecko.json" />
<VegaChart dataFile="data/chart4_francie.json" />
<VegaChart dataFile="data/chart4_spanelsko.json" />
<VegaChart dataFile="data/chart4_bulharsko.json" />
<VegaChart dataFile="data/chart4_litva.json" />
<VegaChart dataFile="data/chart4_cesko.json" />
</ChartRow>

Srovnání ukazuje měřítko: letošní vedra dokázala během jediného týdne posunout úmrtnost nad běžnou zimní špičku, ale nedosáhla délky ani výšky pandemických vln.

```infobox default
Co dělat v horkých dnech: Světová zdravotnická organizace doporučuje zůstat v nejteplejší části dne mimo slunce, přes den zavřít okna a zatáhnout žaluzie, v noci větrat a pít pravidelně ještě před pocitem žízně. Alespoň jednou denně se ozvěte starším příbuzným, sousedům a lidem, kteří žijí sami. Pokud má člověk horkou suchou kůži, je zmatený, má křeče nebo upadá do bezvědomí, volejte zdravotnickou pomoc. [Doporučení WHO pro vlny veder](https://www.who.int/europe/news-room/fact-sheets/item/keepcool-in-the-heat)
```

Telefonát staršímu člověku trvá několik minut. Český systém, který by věděl, komu takovou pomoc nabídnout automaticky, vzniká podstatně pomaleji. Teplotní rekord už na něj čekat nemusel.

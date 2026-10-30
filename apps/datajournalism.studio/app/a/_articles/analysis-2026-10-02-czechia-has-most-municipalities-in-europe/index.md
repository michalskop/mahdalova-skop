---
title: "Czechia has the most municipalities per capita in Europe, three times as many as Austria"
date: "2026-10-02"
time: "08:30"
author: "Kateřina Mahdalová & Michal Škop"
excerpt: "Next Friday and Saturday, councils will be elected in 6,251 Czech municipalities. Half of them have fewer than 500 inhabitants; in Austria, only one municipality in twenty is that small. Running the smallest municipalities costs almost twice as much per inhabitant, and in nearly half of them only a single list of candidates is standing. Why Czechia has so many municipalities, and what happened when Austria merged its own."
coverTitulek: "Most municipalities<br>in Europe"
coverPodtitulek: "Three times as many per capita as Austria.<br>Half have fewer than 500 inhabitants"
coverImage: "images/cover-homepage.png"
homepageImage: "images/cover-homepage.png"
ogImage: "images/cover-og.jpg"
squareImage: "images/cover-square.png"
instagramImage: "images/cover-instagram.png"
filter: ["work"]
tags: ["elections", "czech elections 2026", "municipal elections", "municipalities", "local government", "austria", "public finance", "data"]
translator: "Translated from Czech with AI assistance"
original: "https://www.datatimes.cz/clanek/analyza-2026-10-02-kolik-ma-cesko-obci"
---

On Friday 9 and Saturday 10 October, municipal councils will be elected in 6,251 Czech municipalities, with voters filling 59,173 seats. Austria, which is slightly larger in area and has 9.2 million inhabitants, has 2,092 municipalities. Czechia has 57 municipalities per 100,000 inhabitants – more than any other of the 28 European countries for which comparable data are available.

We went through data from the Czech Statistical Office (ČSÚ), Statistik Austria, the State Treasury Monitor (the Czech Ministry of Finance's public budget database) and the registers of candidates. Czechia has three times as many municipalities as Austria, and the difference in their size is fourfold: half of Czech municipalities have fewer than 456 inhabitants, while half of Austrian ones have more than 1,838. Two consequences follow that can be quantified: higher administrative costs per inhabitant, and elections that often offer little choice.

<KeyNumbers yamlFile="key-stats.yaml" />

<VegaChart dataFile="data/evropa.json" />

Only Slovakia (54 municipalities per 100,000 inhabitants) and France (51) come close to Czechia's density of municipalities. The European Union average is 19. At the other end are countries that have merged municipalities in recent decades: Denmark has 98 municipalities with an average of 61,000 inhabitants, the Netherlands 342. The numbers of municipalities come from the [OECD overview of subnational governments for 2025](https://www.oecd.org/en/data/dashboards/oecd-dashboard-on-subnational-government-structure-and-finance.html); for Bulgaria, Croatia, Malta and Romania, from [Eurostat (LAU 2025)](https://ec.europa.eu/eurostat/web/nuts/local-administrative-units).

## Half of Czech municipalities have fewer than 500 inhabitants

According to [ČSÚ population figures for municipalities as of 1 January 2026](https://data.csu.gov.cz/opendata/sady/OBY02A/distribuce/csv), 3,332 Czech municipalities, 53% of the total, have fewer than 500 inhabitants. They are home to 828,000 people, 7.6% of the country's population. In Austria, according to the [Statistik Austria municipal register](https://www.statistik.at/fileadmin/pages/453/RegGemVz2026.ods), there are 110 such municipalities, or 5%.

Three quarters of Czech municipalities (4,715) have fewer than a thousand inhabitants, yet only one in six people lives in them. Austria has 407 municipalities with fewer than a thousand inhabitants, a fifth of the total. The smallest Czech municipality is Vysoká Lhota in the Pelhřimov district, with 16 inhabitants; the smallest Austrian one is Gramais in Tyrol, with 49.

The statistical office actually lists 6,258 municipalities. Four of them are the military training areas of Boletice, Březina, Hradiště and Libavá, which have no inhabitants and hold no elections. There are 6,254 actual municipalities with a council, and this year elections are being held in 6,251 of them. In Slavníč, nobody submitted a list of candidates; in Krchleby and Rokytovec, not enough candidates came forward.

So Czechia has three times as many mayors: 6,254 against 2,092. When it comes to councillors, however, the difference shrinks, because Austrian municipal councils are larger – on average they have around 19 members, Czech ones 9. Czechia elects 5.4 councillors per thousand inhabitants; Austria, according to [Gemeindebund, the Austrian association of municipalities](https://www.ots.at/presseaussendung/OTS_20260306_OTS0015/gemeindebund-zum-weltfrauentag-mehr-frauen-in-die-kommunalpolitik), around 4.3. Per inhabitant, Czechia has roughly a quarter more councillors, not three times as many.

<VegaChart dataFile="data/velikost.json" />

## The socialist state merged municipalities, after 1990 they split up again

Czechia used to have even more municipalities. During the First Republic (interwar Czechoslovakia), there were more than 11,000 on today's territory: 11,768 according to the 1930 census and 11,459 in 1950, according to the [ČSÚ Statistical Yearbook](https://csu.gov.cz/docs/107508/6c710915-08ca-4d6a-e70d-3a98813d95e9/130055240113.pdf?version=1.0). From 1960 onwards, the state merged them in several waves (most of all in 1960, 1964, 1975–1976, 1980–1981 and 1985), so that at the beginning of 1990 there were [around 4,100 municipalities left, according to ČSÚ](https://statistikaamy.csu.gov.cz/se-ctyrmi-vojenskymi-ujezdy-je-v-cr-6-258-samospravnych-obci).

<SupportBanner float="left" />The mergers were imposed by the state from above, and as soon as the Municipalities Act of 1990 allowed it, municipalities began to become independent again. Almost 1,700 new municipalities were created with the municipal elections in autumn 1990 alone. The 1991 census counted 5,768 of them; by 2001 there were already 6,258.

Since then the number has barely changed; the lowest point was 6,248 municipalities in 2005. The last five were added in 2016, when the state abolished the Brdy military training area and reduced the size of the other training areas, so that parts of their territory became independent municipalities.

Austria merged municipalities at the same time, in the 1960s and 1970s, and unlike Czechia it did not return to the original situation. Between 1961 and 2008, the number of municipalities fell from 1,652 to 573 in Lower Austria, from 319 to 171 in Burgenland and from 229 to 132 in Carinthia, according to a [study by WIFO and KDZ for the Austrian Ministry of Finance](https://www.bmf.gv.at/dam/jcr:5acff3a5-345b-440b-8591-e921d81e00c4/Gemeindestruktur_und_Gemeindekooperation(1).pdf). Upper Austria, Salzburg, Tyrol and Vorarlberg practically did not merge their municipalities. In 1961 Austria had a total of 3,999 municipalities; in 2002 it had 2,359.

<VegaChart dataFile="data/vyvoj.json" />

## Running the smallest municipalities costs almost twice as much per inhabitant

What municipal self-government costs can be seen in municipal budgets in the [State Treasury Monitor](https://monitor.statnipokladna.gov.cz/data/extrakty/csv/FinM/2025_12_Data_CSUIS_FINM.zip). In 2025, municipalities spent CZK 10.6 billion on councils and CZK 71.3 billion on running municipal offices. Together that is CZK 81.9 billion, roughly CZK 7,500 per inhabitant and 15.8% of all municipal spending. For councils, 97% of spending goes on remuneration and social and health insurance contributions.

Per inhabitant, administration is most expensive in the smallest municipalities. In municipalities with fewer than 200 inhabitants it costs CZK 10,713 per head; in municipalities with 1,000 to 2,000 inhabitants, CZK 5,537, roughly half as much. The smallest municipalities spend 27% of their budgets on it, municipalities with one to two thousand inhabitants 15%. The difference comes mainly from remuneration: the council of the smallest municipality costs CZK 4,101 per inhabitant, in a municipality with a thousand inhabitants CZK 1,571. A mayor, an accountant and an office are needed even for 150 people.

<VegaChart dataFile="data/naklady.json" />

The chart shows municipalities without extended powers. In the 205 municipalities with extended powers, the offices also handle state administration on behalf of the surrounding municipalities, from identity cards to building permits. The state contributes to this, so their spending per inhabitant is higher (CZK 8,064) and not comparable with other municipalities.

The shape of the curve is similar in Austria. According to [Statistik Austria data on municipal finances for 2019](https://data.statistik.gv.at/web/meta.jsp?dataset=OGD_gem_unterabschn_GHD_UA_10), the latest available for individual municipalities, elected bodies and municipal administration cost €1,063 per inhabitant in municipalities with fewer than 200 inhabitants and €371 in municipalities with 1,000 to 2,000 inhabitants. But Austria has only 14 municipalities with fewer than 200 inhabitants; Czechia has 1,340.

How much could be saved if small municipalities were larger can only be roughly estimated. If municipalities with fewer than 500 inhabitants cost as much per head as those with 1,000 to 2,000 inhabitants, they would spend CZK 2.6 billion a year less. That is 3% of the cost of municipal self-government and half a percent of all municipal spending. Moreover, a merger does not automatically lead to such savings, as the Austrian experience below shows.

Since 2024, remuneration has no longer been set by a government regulation, which the [Constitutional Court struck down](https://www.zakonyprolidi.cz/cs/2023-160), but directly by the Municipalities Act. A full-time mayor of a municipality with up to 300 inhabitants receives CZK 58,307 gross a month this year, according to the [Ministry of the Interior's methodological guidance](https://mv.gov.cz/odk2/soubor/doplnek-metodickeho-doporucen-c-5-6-pro-rok-2026.aspx); a part-time mayor at most CZK 34,955. An ordinary councillor in such a municipality may receive at most CZK 1,734.

The municipal elections themselves are a small item by comparison. According to the [state closing account](https://mf.gov.cz/assets/cs/media/2023-05-02_C-Zprava-o-vysledcich-hospodareni-statniho-rozpoctu.pdf), the 2022 municipal and Senate elections cost the state budget CZK 959 million, roughly CZK 116 per registered voter. For this year's municipal elections, the Ministry of Finance has set aside CZK 951 million, according to [ČT24, the news channel of the Czech public broadcaster](https://ct24.ceskatelevize.cz/clanek/domaci/volby-maji-letos-stat-pres-miliardu-korun-377633). One round of municipal elections every four years thus costs roughly as much as four days of running municipal offices and councils.

## In half of the smallest municipalities, only a single list is standing

The second consequence of small municipalities is revealed by the [open data of the candidate registers on volby.cz](https://www.volby.cz/opendata/opendata.htm). In 1,830 municipalities, 29% of the total, only a single list of candidates is standing this year. In municipalities with fewer than 200 inhabitants the figure is 49%; in municipalities with more than 5,000 inhabitants, it happens almost nowhere.

<VegaChart dataFile="data/kandidati.json" />

A single list does not necessarily mean that voters have no choice – the list may contain more people than there are seats, and voters choose among them. But in 930 municipalities with a single list, the number of candidates is at most equal to the number of seats, and another 140 municipalities have several lists that together contain no more people than there are seats. In all these 1,070 municipalities, everyone who stands will be elected. In municipalities with fewer than 200 inhabitants, this applies to a quarter of them. The number of candidates is falling overall, as we showed in our [analysis of this year's candidate lists](https://www.datatimes.cz/clanek/volby-cr-2026-08-27-nejmene-kandidatu-do-obci-i-do-senatu) (in Czech): there are a fifth fewer than in 2014.

## Austria also merged municipalities by law. It saved on running costs, but not yet on staff

The last major reform was carried out by Styria in 2015. It reduced the number of municipalities from 542 to 287, and the average municipality grew from 1,747 to 3,293 inhabitants, according to the [Styrian state government](https://www.kommunikation.steiermark.at/cms/beitrag/12165076/29767960/). The mergers involved 385 municipalities: 306 agreed to them, while 79 were merged by a Styrian state law of December 2013. Dozens of municipalities challenged this at the Constitutional Court, but in October and December 2014 it rejected all the complaints (for example, [decision G 44/2014](https://www.vfgh.gv.at/downloads/VfGH_G_44-2014__V_46-2014_Gemeindefusionen_Waldbach.pdf)).

The outcome after ten years is assessed by KDZ, the Austrian public administration research institute, in its [report on municipal finances this year](https://www.kdz.eu/de/aktuelles/blog/gemeindefusionen-der-steiermark-effizienzgewinne-sichtbar-rahmenbedingungen): the merged municipalities saved on operating expenditure, but overall it does not yet see savings on staff. At the same time, the merged municipalities receive less money from the Land (the federal state of Styria) and invest less.

Czechia is taking the opposite path: municipalities remain small and cooperate. According to the [register of accounting units in the State Treasury Monitor](https://monitor.statnipokladna.gov.cz/data/xml/ucjed.xml), at the end of 2025 there were 939 voluntary associations of municipalities, which jointly run things such as water supply, waste collection or schools. Austria does this too, only in larger units: Lower Austria alone has 631 municipal associations, according to the [Austrian Court of Audit](https://www.rechnungshof.gv.at/rh/home/home/2025_NOe_T_Aufsicht_Gemeindeverbaende.pdf), which mainly run schools and civil registry offices.

<RelatedArticles heading="🔻🔻🔻" />

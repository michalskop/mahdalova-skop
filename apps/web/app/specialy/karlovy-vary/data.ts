export type KviffBranch = {
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  status: 'draft' | 'research' | 'ready';
  accent: string;
  metrics: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const kviffSources = [
  'Oficiální festivalový archiv KVIFF',
  'Archiv filmů KVIFF',
  'Finální tiskové zprávy festivalu',
  'Stránka cen KVIFF',
  'Historické ročníkové stránky KVIFF a finální tiskové zprávy',
  'AP / festivalové zprávy k oznámeným poctám 60. ročníku 2026',
  'Oficiální stránky partnerů KVIFF a stránka Proč podporujeme festival',
  'Wikidata, IMDb, TMDb, The Numbers a Box Office Mojo',
  'Filmová kritika a publicistika, včetně textů Kamila Fily',
];

export const kviffBranches: KviffBranch[] = [
  {
    slug: 'historie-festivalu',
    title: 'Historie festivalu v datech',
    kicker: 'Timeline',
    excerpt: 'Kdy se festival konal, kdy se měnila periodicita a proč je rok 1994 metodologický zlom.',
    status: 'ready',
    accent: 'var(--mantine-color-brandOrange-6)',
    metrics: ['1946 začátek festivalu', '1948 soutěžní model', '1994 nová každoroční éra', '2020 covidová pauza'],
    sections: [
      {
        heading: 'Festival má dvě datové éry',
        body: [
          'Karlovy Vary existují déle než jejich digitální paměť. Novější ročníky mají systematický online archiv filmů, sekcí, cen, hostů a festivalových čísel. Starší období 1946 až 1990 je potřeba číst opatrněji: často známe ceny a data konání, ale kompletní program bude vyžadovat hlubší archivní práci.',
          'To není slabina článku, ale jedna z jeho point. U kulturních institucí často nejdřív existuje paměť v katalozích, tiskových zprávách a publicistice, teprve později databáze.',
          'Čísla tu proto nebudou jen účetnictví ročníků. Budou ukazovat, kdy byl festival státní reprezentací, kdy přežíval transformační nejistotu a kdy se proměnil v každoroční mezinárodní událost, která už sama vyrábí prestiž.',
        ],
      },
      {
        heading: 'Zlomy, které musí být vidět',
        body: [
          'Časová osa musí zvýraznit založení v roce 1946, začátek soutěžního modelu v roce 1948, střídání s moskevským festivalem, transformační nejistotu po roce 1989, obnovení každoroční tradice od roku 1994 a covidovou pauzu v roce 2020.',
          'K aktuálnímu datu 10. července 2026 probíhá 60. ročník festivalu, který je podle finální tiskové zprávy 59. ročníku naplánovaný na 3. až 11. července 2026. Vítěze hlavní ceny proto doplníme až po zakončení.',
        ],
      },
    ],
  },
  {
    slug: 'crystal-globe',
    title: 'Kdo vyhrával Crystal Globe',
    kicker: 'Ceny',
    excerpt: 'Databáze hlavních vítězů, jejich zemí, režisérů, období a typů filmů.',
    status: 'draft',
    accent: 'var(--mantine-color-brandNavy-6)',
    metrics: ['hlavní cena', 'země vítězů', 'režie', 'dekády'],
    sections: [
      {
        heading: 'Hlavní cena jako mapa prestiže',
        body: [
          'Crystal Globe je nejsnáze sledovatelná linie napříč celou historií festivalu. U každého vítěze budeme evidovat název filmu, originální název, rok, režii, produkční zemi a dostupný gender režie.',
          'Samostatně budeme držet historické státy. Czechoslovakia, USSR nebo East Germany nepřepisujeme mechanicky na dnešní státy, protože by to smazalo dobový kontext.',
          'Hlavní cena je tvrdší měřítko než červený koberec: ukazuje, kam festival posílal nejvyšší institucionální prestiž, nejen koho uměl mediálně přivítat.',
        ],
      },
      {
        heading: 'Co bude ve vizualizaci',
        body: [
          'Základní graf bude mřížka vítězů podle dekád. Vedle ní poběží mapa zemí vítězů a časová osa, která odliší období socialistického festivalového provozu, transformaci a současnou éru.',
        ],
      },
    ],
  },
  {
    slug: 'hoste-a-prestiz',
    title: 'Celebrity, prestiž a kulturní diplomacie',
    kicker: 'Hosté',
    excerpt: 'Světové osobnosti, čestné ceny a český mediální obraz festivalu.',
    status: 'draft',
    accent: 'var(--mantine-color-brand-6)',
    metrics: ['čestné ceny', 'Cena prezidenta', 'filmová kritika', 'mediální obraz'],
    sections: [
      {
        heading: 'Hosté nejsou jen ozdoba',
        body: [
          'Seznam hostů ukazuje, jak festival pracuje s prestiží. Jinou funkci má ocenění světové osobnosti, jinou připomenutí české kinematografie a jinou mediální událost, která přitáhne publikum mimo filmovou obec.',
          'Do této kapitoly patří i kritická interpretace. Texty Kamila Fily a dalších kritiků použijeme jako sekundární vrstvu, která vysvětluje, jak se o Varech mluvilo, co se od nich čekalo a kdy se festival stal kulturní událostí přesahující samotný program.',
          'Když v datech přibývají čestné ceny a velká jména, nejde jen o seznam celebrit. Je to mechanismus kulturní diplomacie: festival si půjčuje světovou autoritu hostů a hostům na oplátku nabízí evropskou festivalovou scénu s mediální odezvou.',
        ],
      },
      {
        heading: 'Co oddělíme',
        body: [
          'Oficiální archiv použijeme pro fakta: kdo přijel, kdo dostal cenu a s jakým filmem byl spojován. Kritiku použijeme pro výklad, ne jako náhradu databáze.',
          'První hotová datová řada sleduje Crystal Globe za mimořádný umělecký přínos světu filmu od roku 1998 do oznámených poct 60. ročníku 2026. U každé osobnosti vedeme rok, zemi, profesní roli a gender.',
          'Tuto řadu držíme odděleně od President’s Award i od předlistopadových soutěžních cen. Před rokem 1989 archiv ukazuje hlavně ceny filmům, režii a hereckým výkonům; moderní čestné oceňování festivalových hostů je jiný typ prestiže.',
        ],
      },
    ],
  },
  {
    slug: 'gender-ve-varech',
    title: 'Gender ve Varech',
    kicker: 'Reprezentace',
    excerpt: 'Kdo měl prostor v programu, u cen, v porotách a v čestných oceněních.',
    status: 'draft',
    accent: 'var(--mantine-color-brandNavy-6)',
    metrics: ['režie', 'scénář', 'poroty', 'čestná ocenění'],
    sections: [
      {
        heading: 'Neměříme odhady podle jmen',
        body: [
          'Genderová analýza bude postavená jen na veřejně doložitelných údajích. Pokud údaj nepůjde spolehlivě ověřit, záznam zůstane jako unknown. Podíl unknown údajů bude součástí grafů, ne poznámka pod čarou.',
          'Budeme sledovat režii, scénář, produkci, herecké ceny, poroty, čestná ocenění a vítězné filmy. Důležitá otázka není jen kolik žen se v datech objevuje, ale ve kterých rolích a u jakého typu prestiže.',
          'U čestných cen už máme první publikovatelný graf: Crystal Globe za mimořádný umělecký přínos ukazuje dlouhou mužskou řadu s několika viditelnými ženskými vlnami.',
          'Právě v tom je sdělení: festival může mít výjimečná ženská jména, a přesto může být nejvyšší symbolická prestiž rozdělovaná dlouhodobě nerovnoměrně.',
          'V tooltipech u teček je nově přesně uvedeno, že jde o Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii. Nejde o soutěžní cenu za konkrétní film, ale o čestné ocenění dlouhodobé filmové stopy.',
        ],
      },
    ],
  },
  {
    slug: 'mapa-filmu',
    title: 'Odkud přijíždějí filmy',
    kicker: 'Země',
    excerpt: 'Produkční země, koprodukce a regionální proměny festivalového programu.',
    status: 'draft',
    accent: 'var(--mantine-color-brandTeal-6)',
    metrics: ['produkční země', 'koprodukce', 'regiony', 'soutěžní sekce'],
    sections: [
      {
        heading: 'Jedna mapa nestačí',
        body: [
          'Budeme rozlišovat všechny uvedené filmy, hlavní soutěž, Proxima nebo historické sekce a vítěze hlavních cen. Teprve rozdíl mezi těmito vrstvami ukáže, zda festival dával prostor jedněm regionům, zatímco nejvyšší prestiž směřovala jinam.',
          'Koprodukce budeme počítat dvojmo: presence count ukáže, kde se země objevila, fractional count rozdělí jeden film mezi všechny produkční země.',
          'Souhrnné počty filmů a projekcí od roku 1995 používáme jako kontrolní rám: než budeme tvrdit, že některý region posílil, musíme vědět, jestli zrovna nerostl celý program nebo naopak neklesal počet titulů.',
          'Aktuální mapu zemí stavíme z country katalogu KVIFF 2026 jako presence count. Historická mapa všech ročníků bude až další film-level vrstva: u každého filmu potřebujeme rok, sekci, produkční zemi nebo země, premiérový status a informaci, zda šlo o soutěžní titul.',
          'Hotová mapa 2026 už ukazuje první důležitou věc: Vary nejsou jen evropský festival s několika výjezdy do světa, ale síť koprodukcí, ve které se země objevují různou intenzitou. Proto vedle mapy držíme i regionální součty a žebříček zemí.',
        ],
      },
    ],
  },
  {
    slug: 'temata-filmu',
    title: 'O čem filmy ve Varech mluví',
    kicker: 'Témata',
    excerpt: 'Válka, paměť, rodina, migrace, autoritářství, práce, queer témata i ekologie.',
    status: 'research',
    accent: 'var(--mantine-color-brandOrange-6)',
    metrics: ['anotace', 'sekce', 'keywords', 'ruční kontrola'],
    sections: [
      {
        heading: 'Témata vyžadují editorskou kontrolu',
        body: [
          'Témata budeme skládat z oficiálních anotací, festivalových sekcí, žánrů a klíčových slov z externích databází. Automatické štítkování může pomoct s prvním návrhem, ale finální kategorie musí projít ruční kontrolou.',
          'U oceněných a soutěžních filmů bude kontrola přísnější, protože právě na nich bude stát interpretační část článku.',
          'Tady nepůjde o to spočítat módní slova. Budeme sledovat, jestli festival častěji ukazuje válku, paměť, autoritářství, rodinu, práci nebo migraci, a jestli se tato témata dostávají i k cenám, nebo zůstávají hlavně v programových sekcích.',
        ],
      },
    ],
  },
  {
    slug: 'ekonomika-pozornosti',
    title: 'Festival jako ekonomika pozornosti',
    kicker: 'Návštěvnost',
    excerpt: 'Vstupenky, pasy, akreditace, novináři, industry profesionálové, partneři a obchod s prestiží.',
    status: 'draft',
    accent: 'var(--mantine-color-brandRoyalBlue-6)',
    metrics: ['tickets sold', 'festivalové pasy', 'partnerství', 'prestiž'],
    sections: [
      {
        heading: 'Festival není jen program',
        body: [
          'Novější ročníky umožňují sledovat festival jako veřejnou, mediální a industry událost. Oficiální archiv uvádí prodané vstupenky, festivalové pasy, akreditované návštěvníky, filmaře, industry profesionály, novináře a projekce s delegací.',
          'Tato kapitola ukáže, jak se festivalová prestiž překládá do pozornosti publika, médií a filmového trhu.',
          'Nově doplňujeme i partnerskou vrstvu. Nečteme ji jako seznam log, ale jako směnu různých druhů kapitálu: peníze, služby, mediální dosah, CSR, symbolické řemeslo, místo konání a přístup k publiku.',
          'To je redakční interpretace oficiálně komunikovaných partnerství. U každé vrstvy proto držíme zdroj a oddělujeme doložený fakt od výkladu, co z něj pro ekonomiku pozornosti plyne.',
          'Čísla tu znamenají rozsah pozornosti. Vstupenka je divák, akreditace je institucionální přítomnost, novinář je násobič mediálního dosahu a partnerství je způsob, jak se tato pozornost mění v peníze, služby nebo reputaci.',
        ],
      },
    ],
  },
  {
    slug: 'trzby-filmu',
    title: 'Festivalové filmy a tržby',
    kicker: 'Trh',
    excerpt: 'Co se dá zjistit o komerčním životě festivalových filmů a kde data končí.',
    status: 'research',
    accent: 'var(--mantine-color-brandOrange-6)',
    metrics: ['box office', 'rozpočty', 'distribuce', 'neúplnost dat'],
    sections: [
      {
        heading: 'Tržby nejsou návštěvnost festivalu',
        body: [
          'Festivalová návštěvnost znamená vstupenky, pasy a akreditace. Filmové tržby znamenají komerční výkon konkrétních filmů v kinech mimo festival. Tyto dvě vrstvy nesmíme míchat.',
          'U festivalových filmů čekáme velkou neúplnost box office údajů. Každý graf proto musí ukazovat i podíl filmů, pro které tržby nejsou dohledatelné.',
          'Smysl této kapitoly bude v kontrastu: některé filmy získají ve Varech symbolický kapitál, ale mimo festival nemusí být komerčně viditelné. A naopak úspěch v kinech nemusí znamenat festivalovou prestiž.',
        ],
      },
    ],
  },
];

export function getKviffBranch(slug: string) {
  return kviffBranches.find((branch) => branch.slug === slug);
}

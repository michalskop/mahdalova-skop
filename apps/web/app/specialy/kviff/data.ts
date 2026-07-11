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
    slug: 'historie-festivalu-v-datech',
    title: 'Historie festivalu v datech',
    kicker: 'Timeline',
    excerpt: 'Kdy se festival konal, kdy se měnila periodicita a proč je rok 1994 metodologický zlom.',
    status: 'ready',
    accent: 'var(--mantine-color-brandOrange-6)',
    metrics: ['1946 začátek festivalu', '1948 soutěžní model', '1994 nová každoroční éra', '2020 covidová pauza'],
    sections: [
      {
        heading: 'Festival, který dvakrát změnil tvář',
        body: [
          'Karlovy Vary jsou druhý nejstarší nepřetržitě pořádaný filmový festival v Evropě hned po Benátkách – a přesto o jejich prvních letech ví dnešní návštěvník překvapivě málo. První dva ročníky v letech 1946 a 1947 byly nesoutěžní a odehrávaly se hlavně v Mariánských Lázních; Karlovy Vary se staly trvalým domovem festivalu až od pátého ročníku v roce 1950.',
          'Únorový převrat 1948 festival proměnil ve výkladní skříň režimu – a hned v tom roce se poprvé udělila i hlavní soutěžní cena. V padesátých letech se z festivalu stala oslava „nového člověka a dokonalejšího lidstva“, jak znělo tehdejší heslo: vedle hlavní ceny se rozdávala cena míru, cena práce, cena za boj za svobodu i cena za boj za sociální pokrok, takže s prázdnou neodešel skoro nikdo.',
          'Paradoxně právě propaganda otevřela festivalu pár nečekaných dveří. V roce 1954 měl ve Varech mezinárodní premiéru americký film Sůl země – dílo scenáristy a režiséra, které ve vlastní zemi umlčela mccarthyovská hollywoodská černá listina. Být zakázaný v Americe tehdy za železnou oponou znamenalo být hvězdou večera.',
          'V roce 1956 dostal festival od mezinárodní organizace producentů FIAPF prestižní kategorii A po bok Cannes, Benátek a Berlína – a týž rok přinesl i kuriozitu, která k obrazu přísně ideologického festivalu vůbec nesedí: příjezd okouzlující zahraniční herečky přiměl státní nakladatelství Orbis vydat sérii pohlednic s ní v plavkách.',
          'Šedesátá léta byla obdobím opatrného tání. Sovětský svaz si ale nakonec vymohl vlastní „světový“ festival v Moskvě, a tak se od roku 1960 Vary konají jen v sudých letech. I tak sem míří velká jména: v roce 1964 tu davy rozvášnila Claudia Cardinale, přijeli i Henry Fonda a Richard Attenborough. Ten samý ročník vyhráli Ján Kadár a Elmar Klos s dramatem Obžalovaný, ve kterém malou roli právníka ztvárnil Jiří Menzel – a ten sám o čtyři roky později, v roce 1968, vyhrál jako režisér s Rozmarným létem.',
          'Pak přišla srpnová invaze a s ní konec nadějí na rychlejší otevírání. Lesk konce šedesátých let se festivalu vrátil až po sametové revoluci – a naplno až v roce 1994, kdy jej pod vedením Jiřího Bartošky převzala nová, soukromá a už každoročně fungující instituce.',
        ],
      },
      {
        heading: 'Proč je rok 1994 pro naše data předěl',
        body: [
          'Karlovy Vary existují déle než jejich digitální paměť. Od poloviny devadesátých let vede festival systematický online archiv filmů, sekcí, cen, hostů i návštěvnických čísel – a právě proto stavíme drtivou většinu datových grafů v tomto speciálu na období od roku 1994 nebo 1995 dál.',
          'Starší období 1946 až 1990 čteme opatrněji. Ceny a termíny konání většinou známe spolehlivě, ale kompletní filmový program po jednotlivých titulech bude vyžadovat hlubší archivní práci, než abychom ho mohli srovnávat se stejnou přesností jako novodobé ročníky. To není slabina, ale běžný osud kulturních institucí: paměť nejdřív existuje v katalozích, tiskových zprávách a publicistice, teprve později v databázi.',
          'K 12. červenci 2026 právě probíhá 60. ročník festivalu, naplánovaný na 3. až 11. července 2026 – vítěze hlavní ceny proto do datové řady doplníme až po jeho zakončení.',
        ],
      },
    ],
  },
  {
    slug: 'crystal-globe',
    title: 'Kdo vyhrával Crystal Globe',
    kicker: 'Ceny',
    excerpt: 'Kompletní řada vítězů hlavní soutěže od roku 1948 do dneška – a proč to není totéž co čestný Křišťálový glóbus pro osobnosti.',
    status: 'ready',
    accent: 'var(--mantine-color-brandNavy-6)',
    metrics: ['hlavní cena', 'země vítězů', 'režie', 'dekády'],
    sections: [
      {
        heading: 'Dvě ceny, jeden název – a časté matení pojmů',
        body: [
          'Křišťálový glóbus je ve skutečnosti název pro dvě různé ceny, které se v článcích i na internetu běžně pletou dohromady. Grand Prix – Křišťálový glóbus je soutěžní cena pro nejlepší film, udílená od roku 1948 hlavní porotou. Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii je naopak čestná osobní cena pro herce, režiséry a další tvůrce, kterou festival uděluje teprve od poloviny devadesátých let – tu sledujeme samostatně v kapitole o oceněních.',
          'Tady jde výhradně o tu první, soutěžní cenu pro film. Je to tvrdší měřítko než seznam čestných hostů: neukazuje, koho festival dokázal pozvat, ale komu jeho vlastní porota přiznala nejvyšší uměleckou hodnotu daného ročníku.',
          'Historické státy – Československo, Sovětský svaz, NDR – v datech necháváme tak, jak je uváděl dobový archiv, a nepřepisujeme je mechanicky na dnešní hranice. Smazalo by to přesně ten politický kontext, který dělá padesátá a šedesátá léta zajímavými.',
        ],
      },
      {
        heading: 'Co grafy ukazují',
        body: [
          'První graf pokrývá komunistickou éru 1948–1989: dvacet vítězství připadlo zemím sovětského bloku, šest zbytku světa – včetně amerického, francouzského, indického, japonského a australského filmu. I v době, kdy festival organizoval stát, si tedy Grand Prix odnášely i filmy mimo Moskvou kontrolovanou sféru.',
          'Druhý graf navazuje porevoluční řadou od roku 1990 do současnosti: soutěž se otevřela bez ideologického rámce a vítězí v ní malé i velké kinematografie od Islandu po Gruzii.',
        ],
      },
    ],
  },
  {
    slug: 'hoste-a-prestiz',
    title: 'Celebrity, prestiž a kulturní diplomacie',
    kicker: 'Hosté',
    excerpt: 'Světové osobnosti, čestné ceny a mechanismus, kterým si festival půjčuje cizí slávu – a hostům na oplátku nabízí evropskou scénu.',
    status: 'ready',
    accent: 'var(--mantine-color-brand-6)',
    metrics: ['čestné ceny', 'Cena prezidenta', 'filmová kritika', 'mediální obraz'],
    sections: [
      {
        heading: 'Hosté nejsou jen ozdoba',
        body: [
          'Když do Varů přijede světová hvězda, nejde jen o fotku na červeném koberci. Je to mechanismus kulturní diplomacie: festival si od hosta půjčuje jeho mezinárodní autoritu a uznání, hostovi na oplátku nabízí přístup k evropské festivalové scéně a mediální odezvě, kterou by jinde nutně nedostal.',
          'Tahle logika funguje odjakživa, jen měnila obsah. V komunistické éře se prestiž budovala politicky – festival zval osobnosti, které bylo možné prezentovat jako spojence nebo aspoň jako důkaz otevřenosti navenek. Dnešní čestný Křišťálový glóbus je totéž gesto zbavené ideologie: festival jím kanonizuje osobnosti, které podle jeho vlastního uvážení „zanechaly výraznou stopu ve vývoji světové kinematografie“.',
        ],
      },
      {
        heading: 'Co v datech oddělujeme',
        body: [
          'Křišťálový glóbus za mimořádný umělecký přínos je jiná cena než Cena prezidenta festivalu, Cena prezidenta za přínos české kinematografii i soutěžní ceny hlavní poroty. Tyhle kategorie se v sekundárních přehledech běžně pletou dohromady – proto v naší datové řadě sledujeme výhradně první z nich, ověřenou ročník po ročníku proti oficiálnímu archivu a dobovým zprávám.',
          'Aktuální řada sahá od roku 1995 do oznámených poct 60. ročníku 2026 a eviduje u každé osobnosti rok, zemi, profesní roli, gender a – tam, kde je dohledatelné – i to, jak konkrétní ocenění zdůvodnil sám festival nebo dobový tisk.',
        ],
      },
    ],
  },
  {
    slug: 'oceneni-v-datech',
    title: 'Gender ve Varech',
    kicker: 'Reprezentace',
    excerpt: 'Křišťálový glóbus za mimořádný umělecký přínos od roku 1995 dodnes: dlouhá mužská řada s několika málo ženskými vlnami.',
    status: 'ready',
    accent: 'var(--mantine-color-brandNavy-6)',
    metrics: ['režie', 'scénář', 'poroty', 'čestná ocenění'],
    sections: [
      {
        heading: 'Neměříme odhady podle jmen',
        body: [
          'Genderová analýza stojí jen na veřejně doložitelných údajích. Pokud gender osobnosti nešlo spolehlivě ověřit, záznam by šel do kategorie unknown – v této první, kompletně ověřené řadě zatím žádný takový případ nemáme.',
          'Sledujeme tu jednu konkrétní a přesně vymezenou kategorii: čestný Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii, od roku 1995 do oznámených poct 60. ročníku 2026. Není to soutěžní cena za jeden film, ale institucionální gesto, kterým festival zapisuje osobnosti do vlastní paměti světové kinematografie.',
        ],
      },
      {
        heading: 'Co graf ukazuje',
        body: [
          'Výsledek je dlouhá mužská řada s několika viditelnými, ale krátkými ženskými vlnami – jediné roky, kdy ocenění dostaly dvě ženy zároveň, jsou 2005, 2012 a 2019. Vary přitom umějí pozvat a ocenit výjimečná ženská jména od Giny Lollobrigidy po Juliette Binoche pro rok 2026 – právě proto je ale dobře vidět, že nejde o pravidlo, nýbrž o výjimky v dlouhodobě mužské řadě.',
          'Sdělení proto není „festival ženy nezve“, ale přesnější a nepříjemnější zjištění: festival umí ženám nabídnout prostor v programu i pozvání na červený koberec, ale nejvyšší, dlouhodobě zapamatovatelnou symbolickou prestiž rozděluje nerovnoměrně už tři desetiletí.',
        ],
      },
    ],
  },
  {
    slug: 'mapa-filmu',
    title: 'Odkud přijíždějí filmy',
    kicker: 'Země',
    excerpt: 'Vary jsou evropský festival se silnou koprodukční sítí – a s mapou, kterou lze přehrát celou historií 1992–2026.',
    status: 'ready',
    accent: 'var(--mantine-color-brandTeal-6)',
    metrics: ['produkční země', 'koprodukce', 'regiony', 'soutěžní sekce'],
    sections: [
      {
        heading: 'Jedna mapa nestačí',
        body: [
          'Letošní katalog je silně evropský, ale ne jen evropský: po Francii, USA, Česku, Německu a Británii následuje široká vrstva koprodukčních zemí od Latinské Ameriky po Blízký východ. Koprodukce počítáme jako výskyt – když má film uvedené tři země, započítá se jednou každé z nich, takže součet výskytů je vyšší než počet filmů.',
          'Aktuální mapa katalogu 2026 je jen jeden snímek v čase. Animovaná historická mapa vedle ní přehrává vývoj od roku 1992 dodnes: bublina jednotlivé země zůstává na stejném místě po celou dobu, mění se jen její velikost podle toho, kolikrát se země v katalogu daného ročníku objevila.',
        ],
      },
      {
        heading: 'Co se v čase mění',
        body: [
          'Evropa zůstává jádrem katalogu ve všech obdobích, ale roste podíl koprodukcí – to je čitelnější posun než prosté stěhování festivalu z jednoho kontinentu na druhý. Předlistopadové ročníky zatím do stejné film-level mapy nepočítáme: šlo o jinou institucionální logiku výběru a přesné srovnání by vyžadovalo doplnit kompletní katalog film po filmu.',
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
    excerpt: 'Vstupenka je divák, akreditace je instituce, partnerství je peníze a reputace zároveň – festival jako obchod s pozorností.',
    status: 'ready',
    accent: 'var(--mantine-color-brandRoyalBlue-6)',
    metrics: ['tickets sold', 'festivalové pasy', 'partnerství', 'prestiž'],
    sections: [
      {
        heading: 'Festival není jen program',
        body: [
          'Vedle filmů je festival taky veřejná, mediální a byznysová událost. Oficiální archiv umožňuje sledovat prodané vstupenky, festivalové pasy, akreditované filmaře, industry profesionály i novináře – a každá z těchto kategorií znamená jiný typ přítomnosti: vstupenka je divák, akreditace je institucionální přítomnost, novinář je násobič mediálního dosahu.',
          'Rozpočet 60. ročníku je 250 milionů korun, z čehož zhruba 80 procent tvoří soukromí partneři a sponzoři a 20 procent veřejné zdroje. Odhad útraty návštěvníků ve městě je zhruba 650 milionů korun – přibližně 2,6násobek samotného rozpočtu.',
        ],
      },
      {
        heading: 'Partnerství jako směna kapitálu',
        body: [
          'Partnerskou vrstvu nečteme jako seznam log na plotě, ale jako směnu různých druhů kapitálu: peníze, služby, mediální dosah, CSR, symbolické řemeslo, místo konání a přístup k publiku. Festival partnerům nabízí přítomnost uvnitř události, kterou sledují diváci, média, politici i byznys – to je jeho měna.',
          'Jde o redakční interpretaci veřejně komunikovaných partnerství, ne o důkaz konkrétních obchodních podmínek. U každé vrstvy proto v datech držíme zdroj a odděleně od něj i vlastní výklad, co z něj pro ekonomiku pozornosti plyne.',
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

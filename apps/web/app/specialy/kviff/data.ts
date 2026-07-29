export type KviffBranch = {
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  status: 'ready';
  accent: string;
  metrics: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const kviffBranches: KviffBranch[] = [
  {
    slug: 'oceneni',
    title: 'Kdo získal Křišťálový globus',
    kicker: 'Ceny a prestiž',
    excerpt: 'Vítězové hlavní soutěže od roku 1948 a osobnosti oceněné za celoživotní přínos světové kinematografii.',
    status: 'ready',
    accent: 'var(--mantine-color-brandNavy-6)',
    metrics: [],
    sections: [
      {
        heading: 'Jeden název označuje dvě různé ceny',
        body: [
          'Grand Prix – Křišťálový globus uděluje hlavní porota nejlepšímu filmu. Křišťálový globus za mimořádný umělecký přínos světové kinematografii dostávají herci, režiséři a další tvůrci za dlouhodobou práci.',
          'Historické státy, například Československo, Sovětský svaz nebo NDR, ponecháváme v podobě uvedené v dobovém archivu. Přepis na dnešní hranice by zakryl politické uspořádání tehdejšího festivalu.',
        ],
      },
      {
        heading: 'Sovětský blok získal před rokem 1989 dvacet hlavních cen',
        body: [
          'V letech 1948–1989 připadlo dvacet vítězství zemím sovětského bloku a šest ostatním zemím. Hlavní cenu si i v době státem řízeného festivalu odvážely filmy z USA, Francie, Indie, Japonska nebo Austrálie.',
          'Porevoluční řada začíná rokem 1990. Po obnovení každoročního festivalu v roce 1994 v ní vítězí malé i velké kinematografie od Islandu po Gruzii.',
        ],
      },
      {
        heading: 'Čestný Křišťálový globus častěji získávají muži',
        body: [
          'Souvislá řada čestných Křišťálových globů začíná v roce 1995. Graf zahrnuje výhradně cenu za mimořádný umělecký přínos světové kinematografii; Cenu prezidenta festivalu ani soutěžní ceny do ní nezařazujeme.',
          'U každé osobnosti uvádíme rok, zemi, profesi a veřejně doložený gender. Tooltip doplňuje zdůvodnění ceny, pokud je festival nebo dobový tisk zveřejnil.',
        ],
      },
    ],
  },
  {
    slug: 'filmy-a-svet',
    title: 'Odkud přijíždějí filmy',
    kicker: 'Program a země',
    excerpt: 'Archiv let 1992–2026 ukazuje nejčastější produkční země, růst koprodukcí i proměny velikosti festivalového programu.',
    status: 'ready',
    accent: 'var(--mantine-color-brandTeal-6)',
    metrics: [],
    sections: [
      {
        heading: 'Program stojí na evropských koprodukcích',
        body: [
          'Analyzujeme produkční země filmů v digitálně dostupném archivu KVIFF z let 1992–2026. Francie, Německo a Česko tvoří nejhustší část koprodukční sítě; mimo Evropu se nejčastěji objevují Spojené státy.',
          'Jeden film může mít několik produkčních zemí. V mapě proto počítáme vazby film–země: francouzsko-německo-česká koprodukce přidá jednu účast každé ze tří zemí. Součet těchto vazeb je vyšší než počet unikátních filmů.',
        ],
      },
      {
        heading: 'Koprodukce rozšiřují počet zastoupených zemí',
        body: [
          'Evropa zůstává jádrem katalogu po celé novodobé období. Zřetelnější změnou je růst koprodukcí, které spojují více zemí v jednom filmu.',
          'Předlistopadové ročníky do stejného srovnání nezařazujeme, protože pro ně nemáme stejně úplný katalog filmů a produkčních zemí.',
        ],
      },
    ],
  },
  {
    slug: 'festival-a-penize',
    title: 'Festival, publikum a peníze',
    kicker: 'Návštěvnost a financování',
    excerpt: 'Prodané vstupenky, akreditace, rozpočet a partnerství měří různé části festivalového provozu.',
    status: 'ready',
    accent: 'var(--mantine-color-brandRoyalBlue-6)',
    metrics: [],
    sections: [
      {
        heading: 'Šedesátý ročník prodal 132 553 vstupenek',
        body: [
          'V roce 2026 se uskutečnilo 472 projekcí a prodalo 132 553 vstupenek. Festival zároveň evidoval 8 698 festivalových pasů, 598 novinářů a 1 249 profesionálů filmového průmyslu.',
          'Prodané vstupenky neodpovídají počtu unikátních návštěvníků. Jeden člověk může navštívit více projekcí, zatímco akreditace zachycují jiné skupiny přítomné na festivalu.',
        ],
      },
      {
        heading: 'Soukromé zdroje tvoří čtyři pětiny rozpočtu',
        body: [
          'Rozpočet 60. ročníku činil 250 milionů korun. Podle festivalu připadalo přibližně 80 % na soukromé partnery a sponzory a 20 % na veřejné zdroje.',
          'Festival odhadl útratu návštěvníků ve městě na 650 milionů korun. Jde o ekonomický dopad v Karlových Varech, nikoli o příjem nebo zisk pořadatele.',
        ],
      },
    ],
  },
];

export function getKviffBranch(slug: string) {
  return kviffBranches.find((branch) => branch.slug === slug);
}

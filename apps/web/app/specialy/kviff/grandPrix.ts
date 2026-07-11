// Vítězové soutěžní Velké ceny (Grand Prix – Křišťálový glóbus pro nejlepší
// film), 1948-2025. POZOR: tohle je JINÁ cena než honoraryCrystalGlobeRecipients
// v honors.ts – ta je čestná osobní cena za celoživotní přínos (od 1995),
// tady jde o soutěžní cenu pro konkrétní vítězný film udílenou od roku 1948.
// Festival sám vznikl už 1946, ale první dva ročníky byly nesoutěžní.
//
// Zdroj: česká Wikipedie, heslo "Křišťálový glóbus" (tabulka "Velká cena
// Křišťálový glóbus – Grand Prix"), stažena přímo jako wikitext a ručně
// přepsána – ne přes AI shrnutí. Vybrané roky mají ve wikitextu vlastní
// citace (Český rozhlas, ČT24, Reflex.cz, iDNES.cz, České noviny).
// Oficiální archiv KVIFF (kviff.com/.../festival-archive/{rok}) pro roky
// před 1992 nemá žádný strukturovaný obsah (ověřeno – stránky jsou prázdné
// šablony), proto pro komunistickou éru není k dispozici jako primární zdroj.
//
// "bloc" je zjednodušené dobové zařazení podle první uvedené produkční země:
// 'socialisticky' = SSSR, Československo, Polsko, NDR, Kuba, Čína (1988);
// 'ostatni' = USA, Francie, Indie, Japonsko, Británie, Austrálie. Jde o
// zjednodušení pro čtení grafu, ne o dobovou politickou klasifikaci.
export type GrandPrixWinner = {
  year: number;
  filmCz: string;
  filmOriginal: string;
  directors: string[];
  countries: string[];
  bloc: 'socialisticky' | 'ostatni';
  awarded: boolean;
};

const S = 'socialisticky' as const;
const O = 'ostatni' as const;

export const grandPrixWinners: GrandPrixWinner[] = [
  { year: 1948, filmCz: 'Osvětim', filmOriginal: 'Ostatni etap', directors: ['Wanda Jakubowska'], countries: ['Polsko'], bloc: S, awarded: true },
  { year: 1949, filmCz: 'Stalingradská bitva', filmOriginal: 'Сталинградская битва', directors: ['Vladimir Petrov'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1950, filmCz: 'Pád Berlína', filmOriginal: 'Падение Берлина', directors: ['Michail Čiaureli'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1951, filmCz: 'Rytíř zlaté hvězdy', filmOriginal: 'Кавалер Золотой Звезды', directors: ['Julij Rajzman'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1952, filmCz: 'Nezapomenutelný rok 1919', filmOriginal: 'Незабываемый 1919 год', directors: ['Michail Čiaureli'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1954, filmCz: 'Sůl země', filmOriginal: 'Salt of the Earth', directors: ['Herbert J. Biberman'], countries: ['USA'], bloc: O, awarded: true },
  { year: 1954, filmCz: 'Věrní přátelé', filmOriginal: 'Верные друзья', directors: ['Michail Kalatozov'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1956, filmCz: 'Kdyby všichni chlapi světa', filmOriginal: 'Si tous les gars du monde', directors: ['Christian-Jaque'], countries: ['Francie'], bloc: O, awarded: true },
  { year: 1957, filmCz: 'Pod rouškou noci', filmOriginal: 'Jagte Raho', directors: ['Sombhu Mitra', 'Amit Mitra'], countries: ['Indie'], bloc: O, awarded: true },
  { year: 1958, filmCz: 'Tichý Don', filmOriginal: 'Тихий Дон', directors: ['Sergej Gerasimov'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1958, filmCz: 'Nevlastní bratři', filmOriginal: 'Ibo kyoudai', directors: ['Miyoji Ieki'], countries: ['Japonsko'], bloc: O, awarded: true },
  { year: 1960, filmCz: 'Serjožka', filmOriginal: 'Серёжа', directors: ['Georgij Danělija', 'Igor Talankin'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1962, filmCz: 'Devět dní jednoho roku', filmOriginal: 'Девять дней одного года', directors: ['Michail Iljič Romm'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1964, filmCz: 'Obžalovaný', filmOriginal: 'Obžalovaný', directors: ['Ján Kadár', 'Elmar Klos'], countries: ['Československo'], bloc: S, awarded: true },
  { year: 1966, filmCz: '', filmOriginal: '', directors: [], countries: [], bloc: S, awarded: false },
  { year: 1968, filmCz: 'Rozmarné léto', filmOriginal: 'Rozmarné léto', directors: ['Jiří Menzel'], countries: ['Československo'], bloc: S, awarded: true },
  { year: 1970, filmCz: 'Kes', filmOriginal: 'Kes', directors: ['Ken Loach'], countries: ['Spojené království'], bloc: O, awarded: true },
  { year: 1972, filmCz: 'Zkrocení ohně', filmOriginal: 'Укрощение огня', directors: ['Daniil Chrabrovickij'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1974, filmCz: 'Romance o zamilovaných', filmOriginal: 'Романс о влюбленных', directors: ['Andrej Končalovskij'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1976, filmCz: 'Kantáta o Chile', filmOriginal: 'La Cantata de Chile', directors: ['Humberto Solás'], countries: ['Kuba'], bloc: S, awarded: true },
  { year: 1978, filmCz: 'Stíny horkého léta', filmOriginal: 'Stíny horkého léta', directors: ['František Vláčil'], countries: ['Československo'], bloc: S, awarded: true },
  { year: 1978, filmCz: 'Bílý Bim, Černé ucho', filmOriginal: 'Белый Бим, Чёрное ухо', directors: ['Stanislav Rostockij'], countries: ['Sovětský svaz'], bloc: S, awarded: true },
  { year: 1980, filmCz: 'Snoubenka', filmOriginal: 'Die Verlobte', directors: ['Günter Reisch', 'Günther Rücker'], countries: ['Německá demokratická republika'], bloc: S, awarded: true },
  { year: 1982, filmCz: 'Mexiko v plamenech – Rudé zvony', filmOriginal: 'Красные колокола. Фильм 1. Мексика в огне', directors: ['Sergej Bondarčuk'], countries: ['Mexiko', 'Sovětský svaz', 'Itálie'], bloc: S, awarded: true },
  { year: 1984, filmCz: 'Lev Tolstoj', filmOriginal: 'Лев Толстой', directors: ['Sergej Gerasimov'], countries: ['Sovětský svaz', 'Československo'], bloc: S, awarded: true },
  { year: 1986, filmCz: 'Ulice umírání', filmOriginal: 'A Street to Die', directors: ['Bill Bennett'], countries: ['Austrálie'], bloc: O, awarded: true },
  { year: 1988, filmCz: 'Ibiškové městečko', filmOriginal: 'Fu rong zhen', directors: ['Xie Jin'], countries: ['Čína'], bloc: S, awarded: true },
  { year: 1990, filmCz: '', filmOriginal: '', directors: [], countries: [], bloc: O, awarded: false },
  { year: 1992, filmCz: 'Krapatchouk', filmOriginal: 'Krapatchouk', directors: ['Enrique Gabriel'], countries: ['Španělsko', 'Belgie', 'Francie'], bloc: O, awarded: true },
  { year: 1994, filmCz: 'Mi hermano del alma', filmOriginal: 'Mi hermano del alma', directors: ['Mariano Barroso'], countries: ['Španělsko'], bloc: O, awarded: true },
  { year: 1995, filmCz: 'Jízda', filmOriginal: 'Jízda', directors: ['Jan Svěrák'], countries: ['Česko'], bloc: O, awarded: true },
  { year: 1996, filmCz: 'Kavkazský zajatec', filmOriginal: 'Кавказский пленник', directors: ['Sergej Bodrov'], countries: ['Rusko', 'Kazachstán'], bloc: O, awarded: true },
  { year: 1997, filmCz: 'Můj růžový život', filmOriginal: 'Ma vie en rose', directors: ['Alain Berliner'], countries: ['Belgie', 'Francie', 'Spojené království'], bloc: O, awarded: true },
  { year: 1998, filmCz: 'Srdce na dlani', filmOriginal: 'Le coeur au poing', directors: ['Charles Binamé'], countries: ['Kanada'], bloc: O, awarded: true },
  { year: 1999, filmCz: 'Jana a její přátelé', filmOriginal: 'החברים של יאנה', directors: ['Arik Kaplun'], countries: ['Izrael'], bloc: O, awarded: true },
  { year: 2000, filmCz: 'Já, ty, oni', filmOriginal: 'Eu Tu Eles', directors: ['Andrucha Waddington'], countries: ['Brazílie'], bloc: O, awarded: true },
  { year: 2001, filmCz: 'Amélie z Montmartru', filmOriginal: "Le fabuleux destin d'Amélie Poulain", directors: ['Jean-Pierre Jeunet'], countries: ['Francie'], bloc: O, awarded: true },
  { year: 2002, filmCz: 'Rok ďábla', filmOriginal: 'Rok ďábla', directors: ['Petr Zelenka'], countries: ['Česko'], bloc: O, awarded: true },
  { year: 2003, filmCz: 'Okno naproti', filmOriginal: 'La finestra di fronte', directors: ['Ferzan Özpetek'], countries: ['Itálie', 'Spojené království', 'Turecko', 'Portugalsko'], bloc: O, awarded: true },
  { year: 2004, filmCz: 'Ukradené dětství', filmOriginal: 'Certi bambini', directors: ['Andrea Frazzi', 'Antonio Frazzi'], countries: ['Itálie'], bloc: O, awarded: true },
  { year: 2005, filmCz: 'Můj Nikifor', filmOriginal: 'Mój Nikifor', directors: ['Krzysztof Krauze'], countries: ['Polsko'], bloc: O, awarded: true },
  { year: 2006, filmCz: 'Sherrybaby', filmOriginal: 'Sherrybaby', directors: ['Laurie Collyer'], countries: ['USA'], bloc: O, awarded: true },
  { year: 2007, filmCz: 'Severní blata', filmOriginal: 'Mýrin', directors: ['Baltasar Kormákur'], countries: ['Island'], bloc: O, awarded: true },
  { year: 2008, filmCz: 'Ukrutně šťastni', filmOriginal: 'Frygtelig lykkelig', directors: ['Henrik Ruben Genz'], countries: ['Dánsko'], bloc: O, awarded: true },
  { year: 2009, filmCz: 'Anděl u moře', filmOriginal: 'Un ange à la mer', directors: ['Frédéric Dumont'], countries: ['Belgie'], bloc: O, awarded: true },
  { year: 2010, filmCz: 'Moskytiéra', filmOriginal: 'La mosquitera', directors: ['Agustí Vila'], countries: ['Španělsko'], bloc: O, awarded: true },
  { year: 2011, filmCz: 'Restaurátor', filmOriginal: 'בוקר טוב אדון פידלמן', directors: ['Joseph Madmony'], countries: ['Izrael'], bloc: O, awarded: true },
  { year: 2012, filmCz: 'Henrik', filmOriginal: 'Mer eller mindre mann', directors: ['Martin Lund'], countries: ['Norsko'], bloc: O, awarded: true },
  { year: 2013, filmCz: 'Velký sešit', filmOriginal: 'A nagy füzet', directors: ['János Szász'], countries: ['Maďarsko'], bloc: O, awarded: true },
  { year: 2014, filmCz: 'Kukuřičný ostrov', filmOriginal: 'Simindis kundzuli', directors: ['Georgij Ovašvili'], countries: ['Gruzie'], bloc: O, awarded: true },
  { year: 2015, filmCz: 'Bob a stromy', filmOriginal: 'Bob and the Trees', directors: ['Diego Ongaro'], countries: ['USA'], bloc: O, awarded: true },
  { year: 2016, filmCz: 'Rodinné štěstí', filmOriginal: 'Ernelláék Farkaséknál', directors: ['Szabolcs Hajdu'], countries: ['Maďarsko'], bloc: O, awarded: true },
  { year: 2017, filmCz: 'Křižáček', filmOriginal: 'Křižáček', directors: ['Václav Kadrnka'], countries: ['Česko'], bloc: O, awarded: true },
  { year: 2018, filmCz: '„Je mi jedno, že se zapíšeme do dějin jako barbaři“', filmOriginal: '„Îmi este indiferent dacă în istorie vom intra ca barbari”', directors: ['Radu Jude'], countries: ['Rumunsko'], bloc: O, awarded: true },
  { year: 2019, filmCz: 'Otec', filmOriginal: 'Бащата', directors: ['Kristina Grozevová', 'Petar Valčanov'], countries: ['Bulharsko'], bloc: O, awarded: true },
  { year: 2021, filmCz: 'Strahinja', filmOriginal: 'As Far as I Can Walk', directors: ['Stefan Arsenijević'], countries: ['Srbsko'], bloc: O, awarded: true },
  { year: 2022, filmCz: 'Nadějné léto', filmOriginal: 'Summer with Hope', directors: ['Sadaf Foroughi'], countries: ['Kanada', 'Írán'], bloc: O, awarded: true },
  { year: 2023, filmCz: 'Blažiny lekce', filmOriginal: 'Urotcite na Blaga', directors: ['Stephan Komandarev'], countries: ['Bulharsko'], bloc: O, awarded: true },
  { year: 2024, filmCz: 'Náhlý záblesk hlubších věcí', filmOriginal: 'A Sudden Glimpse to Deeper Things', directors: ['Mark Cousins'], countries: ['Spojené království'], bloc: O, awarded: true },
  { year: 2025, filmCz: 'Raději zešílet v divočině', filmOriginal: 'Raději zešílet v divočině', directors: ['Miro Remo'], countries: ['Česko', 'Slovensko'], bloc: O, awarded: true },
];

export const grandPrixCommunistEra = grandPrixWinners.filter((w) => w.year <= 1989);
export const grandPrixPostRevolution = grandPrixWinners.filter((w) => w.year >= 1990);

export const grandPrixCommunistBlocCounts = grandPrixCommunistEra
  .filter((w) => w.awarded)
  .reduce(
    (acc, w) => {
      acc[w.bloc] += 1;
      return acc;
    },
    { socialisticky: 0, ostatni: 0 } as Record<'socialisticky' | 'ostatni', number>,
  );

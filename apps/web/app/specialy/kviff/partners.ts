export type PartnerCapital =
  | 'money'
  | 'service'
  | 'access'
  | 'image'
  | 'csr'
  | 'media'
  | 'craft'
  | 'place';

export type PartnerExchange = {
  segment: string;
  partners: string[];
  givesFestival: string[];
  getsFromFestival: string[];
  evidence: string;
  sourceLabel: string;
  sourceUrl: string;
  capital: PartnerCapital[];
};

export const partnerCapitalLabels: Record<PartnerCapital, string> = {
  money: 'finance',
  service: 'sluzba',
  access: 'pristup',
  image: 'image',
  csr: 'CSR',
  media: 'dosah',
  craft: 'remeslo',
  place: 'misto',
};

export const partnerExchangeRows: PartnerExchange[] = [
  {
    segment: 'Telekomunikace a technologie',
    partners: ['Vodafone'],
    givesFestival: ['technologicky dosah', 'festivalova zona', 'KVIFF.TV ve Vodafone TV'],
    getsFromFestival: ['kulturni legitimitu', 'publikum v premiovem kontextu', 'prostor pro temata nadace a inovaci'],
    evidence:
      'Vodafone na strance KVIFF popisuje dlouhodobe partnerstvi, festivalovou zonu, diskuse Nadace Vodafone, podporu mladych filmaru a propojeni KVIFF.TV s Vodafone TV.',
    sourceLabel: 'KVIFF: proc podporuje Vodafone',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/proc-podporujeme-festival/vodafone',
    capital: ['service', 'access', 'media', 'image'],
  },
  {
    segment: 'Energetika a infrastruktura',
    partners: ['innogy', 'CEZ'],
    givesFestival: ['hlavni partnerstvi', 'energie a infrastrukturu', 'verejne aktivace'],
    getsFromFestival: ['mekkou spolecenskou legitimitu', 'CSR ramovani', 'kontakt s verejnosti mimo bezny korporatni prostor'],
    evidence:
      'innogy uvadi 30 let spoluprace s festivalem a je partnerem projektu Kino bez barier. CEZ je mezi hlavnimi partnery a prezentuje vlastni zonu s energetickymi tematy.',
    sourceLabel: 'KVIFF: partneri a proc podporujeme festival',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/partneri',
    capital: ['money', 'service', 'csr', 'image'],
  },
  {
    segment: 'Remeslo a symbolicka prestiz',
    partners: ['Moser'],
    givesFestival: ['festivalove ceny', 'ceske remeslo', 'materialni symbol prestize'],
    getsFromFestival: ['globalni fotobanky celebrit s cenou', 'spojeni znacky s filmovou elitou', 'dlouhou ceremonialni pamet'],
    evidence:
      'Oficialni stranka partneru uvadi Moser jako dodavatele festivalovych cen. U teto vrstvy je hodnota obousmerna: festival ziskava symbol, znacka ziskava ceremonii.',
    sourceLabel: 'KVIFF: partneri',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/partneri',
    capital: ['craft', 'image', 'media'],
  },
  {
    segment: 'Gastronomie a zazitek navstevniku',
    partners: ['rohlik.cz'],
    givesFestival: ['komfort pro navstevniky', 'gastro prostor', 'sluzby ve festivalovem provozu'],
    getsFromFestival: ['asociaci s kvalitou a pohodlim', 'kontakt s mestskym publikem', 'zazitek misto bezne reklamy'],
    evidence:
      'Rohlik na KVIFF popisuje partnerstvi pres kvalitu sluzeb, komfort navstevniku a Rohlik Park jako misto oddechu, gastronomie a programu.',
    sourceLabel: 'KVIFF: proc podporuje Rohlik',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/proc-podporujeme-festival/rohlik',
    capital: ['service', 'access', 'image'],
  },
  {
    segment: 'Media a verejny dosah',
    partners: ['Ceska televize', 'Cesky rozhlas', 'Seznam.cz', 'Reflex', 'Forbes', 'Elle', 'BigBoard'],
    givesFestival: ['viditelnost', 'obsahovy provoz', 'reklamni a medialni prostor'],
    getsFromFestival: ['exkluzivni kulturni obsah', 'presti z festivalove agendy', 'pribehy s celebritami a publikem'],
    evidence:
      'KVIFF uvadi samostatne vrstvy medialnich, reklamnich a online partneru. To je infrastruktura pozornosti: festival potrebuje dosah, media potrebuji udalost.',
    sourceLabel: 'KVIFF: partneri',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/partneri',
    capital: ['media', 'access', 'image'],
  },
  {
    segment: 'Verejne penize a misto konani',
    partners: ['Karlovarsky kraj', 'mesto Karlovy Vary', 'Ministerstvo kultury'],
    givesFestival: ['verejnou podporu', 'mistni infrastrukturu', 'institucionalni legitimitu'],
    getsFromFestival: ['turistickou a ekonomickou stopu', 'kulturni diplomacii', 'mezinarodni viditelnost regionu'],
    evidence:
      'Karlovarsky kraj a mesto Karlovy Vary jsou mezi hlavnimi partnery, Ministerstvo kultury mezi podporovateli. V datech kapitoly vedle toho sledujeme verejne zdroje jako 20 % rozpoctu.',
    sourceLabel: 'KVIFF: partneri',
    sourceUrl: 'https://www.kviff.com/cs/o-nas/partneri',
    capital: ['money', 'place', 'image'],
  },
];

export const partnerCapitalTotals = partnerExchangeRows.reduce<Record<PartnerCapital, number>>((acc, row) => {
  row.capital.forEach((capital) => {
    acc[capital] = (acc[capital] ?? 0) + 1;
  });
  return acc;
}, {} as Record<PartnerCapital, number>);

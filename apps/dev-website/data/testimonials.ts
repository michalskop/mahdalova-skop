// data/testimonials.ts

export interface TestimonialData {
  id: string;
  text: string;
  author: string;
  position: string;
  date: string;
}

export const testimonials: TestimonialData[] = [
  {
    id: '1',
    text: 'Mimořádně povedené věci, které si určitě zaslouží pochvalu: Unikátní volební model, permanentně aktualizovaný o nové průzkumy preferencí, který sestavuje Kateřina Mahdalová.',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '21. 3. 2021'
  },
  {
    id: '2',
    text: 'Výborná analýza Kateřiny Mahdalové vycházející z dat z ministerstva zdravotnictví o tom, jak jednotlivá opatření omezují šíření nákazy (uzavřené okresy, kvůli nimž se prodlužoval nouzový stav, to nejsou).',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '29. 3. 2021'
  },
  {
    id: '3',
    text: 'Děláš to [Kateřino] dobře, vychytáváš zajímavý pohledy. Myslím, že si to přesně sedne.',
    author: 'Jaroslav Kábele',
    position: 'ředitel pro strategii ČTK (dnes generální ředitel ČTK)',
    date: '8. 4. 2021'
  },
    {
    id: '4',
    text: 'Kateřina Mahdalová excelentně zpracovala sérii o stavu očkování v Česku.',
    author: 'Jakub Unger',
    position: 'ředitel redakce SZ',
    date: '24. 5. 2021'
  },
    {
    id: '5',
    text: 'K opravdu výjimečnému obsahu řadím i speciální kalkulačku. K. Mahdalová a M. Škop představili skvělou volební kalkulačku zaměřenou na komunální volby, resp. volební programy ve velkých městech.',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '19. 9. 2022'
  },
    {
    id: '6',
    text: '[...] věci vybočovaly minulý týden jednoznačně ze šedivého číselného průměru: Prezidentský kompas Kateřiny Mahdalové a Michala Škopa, tedy náš nový nástroj na prezidentské preference',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '21. 11. 2022'
  },
    {
    id: '7',
    text: '[...] systematická práce Katky Mahdalové a Michala Škopa na poslanecké docházce a prezidentských šancích.',
    author: 'Martin Jašminský',
    position: 'šéfredaktor byznysové rubriky SZ',
    date: '19. 12. 2022'
  },
    {
    id: '8',
    text: 'Klobouk dolů! Jste dobří🙂',
    author: 'Václav Štětka',
    position: 'sociolog médií na univerzitě v Loughborough',
    date: '28. 1. 2023'
  },
    {
    id: '9',
    text: 'Čtení vašich článků jsem si vždy užíval, byla to vždycky dobrá práce.',
    author: 'Dušan Janovský',
    position: 'konzultant vyhledávání Seznam.cz',
    date: '11. 4. 2023'
  },
   {
    id: '10',
    text: 'Obrovský kus práce je vidět za mapou kvality života v jednotlivých obcích (tentokrát s výrazným označením prostřednictvím počtu "hvězdiček"), kterou připravila Kateřina Mahdalová a Michal Škop.',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '11. 4. 2023'
  },
  {
    id: '11',
    text: 'Rád bych vyzdvihl práci naší Kateřiny Mahdalové a Michala Škopa - jejich model opět již hodinu a půl po uzavření volebních místností ukázal výsledky velmi přesně (slovenské volby 2023)',
    author: 'Tomáš Kapler',
    position: 'AI a online business konzultant',
    date: '1. 10. 2023'
  },
    {
    id: '12',
    text: '[...] odměnu získává dvojice Kateřina Mahdalová a Michal Škop, a to za důkladnou přípravu volební kalkulačky, minulý týden našeho nejvýraznějšího předvolebního příspěvku před evropskými volbami',
    author: 'Jiří Kubík',
    position: 'šéfredaktor SZ',
    date: '3. 6. 2024'
  },
  {
    id: '13',
    text: 'Díky za vaši skvělou práci, stojím při vás a nejsem sama.',
    author: 'Lucie Fremrová',
    position: 'University of Brighton',
    date: '6. 11. 2024'
  },
 {
    id: '14',
    text: 'Kateřina Mahdalová před rokem demaskovala zmanipulovaný průzkum Pražské hospodářské komory o zklidnění dopravy v centru. Zatímco ostatní média jim to jen tupě bez ověření přejala. Respekt za to!',
    author: 'Města pro lidi',
    position: 'organizace',
    date: '6. 10. 2024'
  },
{
    id: '15',
    text: 'Díky za vaši skvělou práci, stojím při vás a nejsem sama.',
    author: 'Lucie Fremrová',
    position: 'University of Brighton',
    date: '6. 11. 2024'
  },  
  {
    id: '16',
    text: 'Díky Katerina Mahdalova za skvělé vizualizace (doporučuji ke sledování), i proto jsem před časem psal, že tím svým nečekaným tahem Seznam Zprávy přišly o jedny z nejlepších českých datových žurnalistů.',
    author: 'Tomáš Protivínský',
    position: 'IDEA CERGE-EI',
    date: '6. 11. 2024'
  }
];


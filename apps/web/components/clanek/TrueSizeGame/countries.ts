// Czech dictionary for the "Skutečná velikost" map guessing game.
//
// Keys are the exact `properties.name` strings from the Natural Earth 110m
// TopoJSON shipped at /specialy/dpbp/data/world-countries-110m.json. `cs` is the
// Czech name shown in the quiz, `continent` groups countries so distractors come
// from the same region, and `target: true` marks countries that are recognisable
// enough to be asked about (everything with a `cs` name can still appear as a
// wrong option / distractor).

export type Continent =
  | 'Evropa'
  | 'Asie'
  | 'Afrika'
  | 'Severní Amerika'
  | 'Jižní Amerika'
  | 'Oceánie';

export interface CountryInfo {
  cs: string;
  continent: Continent;
  target: boolean;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  // ── Asie ────────────────────────────────────────────────────────────────
  Russia: { cs: 'Rusko', continent: 'Asie', target: true },
  China: { cs: 'Čína', continent: 'Asie', target: true },
  India: { cs: 'Indie', continent: 'Asie', target: true },
  Kazakhstan: { cs: 'Kazachstán', continent: 'Asie', target: true },
  'Saudi Arabia': { cs: 'Saúdská Arábie', continent: 'Asie', target: true },
  Indonesia: { cs: 'Indonésie', continent: 'Asie', target: true },
  Iran: { cs: 'Írán', continent: 'Asie', target: true },
  Mongolia: { cs: 'Mongolsko', continent: 'Asie', target: true },
  Pakistan: { cs: 'Pákistán', continent: 'Asie', target: true },
  Turkey: { cs: 'Turecko', continent: 'Asie', target: true },
  Myanmar: { cs: 'Myanmar', continent: 'Asie', target: true },
  Afghanistan: { cs: 'Afghánistán', continent: 'Asie', target: true },
  Thailand: { cs: 'Thajsko', continent: 'Asie', target: true },
  Turkmenistan: { cs: 'Turkmenistán', continent: 'Asie', target: true },
  Uzbekistan: { cs: 'Uzbekistán', continent: 'Asie', target: true },
  Yemen: { cs: 'Jemen', continent: 'Asie', target: true },
  Iraq: { cs: 'Irák', continent: 'Asie', target: true },
  Japan: { cs: 'Japonsko', continent: 'Asie', target: true },
  Malaysia: { cs: 'Malajsie', continent: 'Asie', target: true },
  Vietnam: { cs: 'Vietnam', continent: 'Asie', target: true },
  Oman: { cs: 'Omán', continent: 'Asie', target: true },
  Philippines: { cs: 'Filipíny', continent: 'Asie', target: true },
  Laos: { cs: 'Laos', continent: 'Asie', target: true },
  Kyrgyzstan: { cs: 'Kyrgyzstán', continent: 'Asie', target: false },
  Syria: { cs: 'Sýrie', continent: 'Asie', target: true },
  Cambodia: { cs: 'Kambodža', continent: 'Asie', target: true },
  Nepal: { cs: 'Nepál', continent: 'Asie', target: true },
  Tajikistan: { cs: 'Tádžikistán', continent: 'Asie', target: false },
  Bangladesh: { cs: 'Bangladéš', continent: 'Asie', target: true },
  'North Korea': { cs: 'Severní Korea', continent: 'Asie', target: true },
  'South Korea': { cs: 'Jižní Korea', continent: 'Asie', target: true },
  Azerbaijan: { cs: 'Ázerbájdžán', continent: 'Asie', target: true },
  Jordan: { cs: 'Jordánsko', continent: 'Asie', target: true },
  'United Arab Emirates': { cs: 'Spojené arabské emiráty', continent: 'Asie', target: true },
  Georgia: { cs: 'Gruzie', continent: 'Asie', target: true },
  'Sri Lanka': { cs: 'Srí Lanka', continent: 'Asie', target: true },
  Bhutan: { cs: 'Bhútán', continent: 'Asie', target: false },
  Taiwan: { cs: 'Tchaj-wan', continent: 'Asie', target: true },
  Armenia: { cs: 'Arménie', continent: 'Asie', target: true },
  Israel: { cs: 'Izrael', continent: 'Asie', target: true },
  Kuwait: { cs: 'Kuvajt', continent: 'Asie', target: true },
  'Timor-Leste': { cs: 'Východní Timor', continent: 'Asie', target: false },
  Qatar: { cs: 'Katar', continent: 'Asie', target: true },
  Brunei: { cs: 'Brunej', continent: 'Asie', target: false },
  Lebanon: { cs: 'Libanon', continent: 'Asie', target: true },
  Palestine: { cs: 'Palestina', continent: 'Asie', target: false },

  // ── Afrika ──────────────────────────────────────────────────────────────
  'Dem. Rep. Congo': { cs: 'Demokratická republika Kongo', continent: 'Afrika', target: true },
  Algeria: { cs: 'Alžírsko', continent: 'Afrika', target: true },
  Sudan: { cs: 'Súdán', continent: 'Afrika', target: true },
  Libya: { cs: 'Libye', continent: 'Afrika', target: true },
  Chad: { cs: 'Čad', continent: 'Afrika', target: true },
  Angola: { cs: 'Angola', continent: 'Afrika', target: true },
  Mali: { cs: 'Mali', continent: 'Afrika', target: true },
  'South Africa': { cs: 'Jihoafrická republika', continent: 'Afrika', target: true },
  Niger: { cs: 'Niger', continent: 'Afrika', target: true },
  Ethiopia: { cs: 'Etiopie', continent: 'Afrika', target: true },
  Mauritania: { cs: 'Mauritánie', continent: 'Afrika', target: true },
  Egypt: { cs: 'Egypt', continent: 'Afrika', target: true },
  Tanzania: { cs: 'Tanzanie', continent: 'Afrika', target: true },
  Nigeria: { cs: 'Nigérie', continent: 'Afrika', target: true },
  Namibia: { cs: 'Namibie', continent: 'Afrika', target: true },
  Mozambique: { cs: 'Mosambik', continent: 'Afrika', target: true },
  Zambia: { cs: 'Zambie', continent: 'Afrika', target: true },
  'S. Sudan': { cs: 'Jižní Súdán', continent: 'Afrika', target: false },
  'Central African Rep.': { cs: 'Středoafrická republika', continent: 'Afrika', target: false },
  Kenya: { cs: 'Keňa', continent: 'Afrika', target: true },
  Botswana: { cs: 'Botswana', continent: 'Afrika', target: true },
  Morocco: { cs: 'Maroko', continent: 'Afrika', target: true },
  Madagascar: { cs: 'Madagaskar', continent: 'Afrika', target: true },
  Somalia: { cs: 'Somálsko', continent: 'Afrika', target: true },
  Cameroon: { cs: 'Kamerun', continent: 'Afrika', target: true },
  Zimbabwe: { cs: 'Zimbabwe', continent: 'Afrika', target: true },
  Congo: { cs: 'Kongo', continent: 'Afrika', target: false },
  "Côte d'Ivoire": { cs: 'Pobřeží slonoviny', continent: 'Afrika', target: true },
  'Burkina Faso': { cs: 'Burkina Faso', continent: 'Afrika', target: false },
  Gabon: { cs: 'Gabon', continent: 'Afrika', target: false },
  Uganda: { cs: 'Uganda', continent: 'Afrika', target: true },
  Ghana: { cs: 'Ghana', continent: 'Afrika', target: true },
  Guinea: { cs: 'Guinea', continent: 'Afrika', target: false },
  Senegal: { cs: 'Senegal', continent: 'Afrika', target: true },
  Tunisia: { cs: 'Tunisko', continent: 'Afrika', target: true },
  'W. Sahara': { cs: 'Západní Sahara', continent: 'Afrika', target: false },
  Eritrea: { cs: 'Eritrea', continent: 'Afrika', target: false },
  Benin: { cs: 'Benin', continent: 'Afrika', target: false },
  Malawi: { cs: 'Malawi', continent: 'Afrika', target: false },
  Liberia: { cs: 'Libérie', continent: 'Afrika', target: false },
  'Sierra Leone': { cs: 'Sierra Leone', continent: 'Afrika', target: false },
  Togo: { cs: 'Togo', continent: 'Afrika', target: false },
  'Guinea-Bissau': { cs: 'Guinea-Bissau', continent: 'Afrika', target: false },
  Lesotho: { cs: 'Lesotho', continent: 'Afrika', target: false },
  'Eq. Guinea': { cs: 'Rovníková Guinea', continent: 'Afrika', target: false },
  Burundi: { cs: 'Burundi', continent: 'Afrika', target: false },
  Rwanda: { cs: 'Rwanda', continent: 'Afrika', target: false },
  Djibouti: { cs: 'Džibutsko', continent: 'Afrika', target: false },
  eSwatini: { cs: 'Eswatini', continent: 'Afrika', target: false },
  Gambia: { cs: 'Gambie', continent: 'Afrika', target: false },

  // ── Evropa ──────────────────────────────────────────────────────────────
  France: { cs: 'Francie', continent: 'Evropa', target: true },
  Ukraine: { cs: 'Ukrajina', continent: 'Evropa', target: true },
  Spain: { cs: 'Španělsko', continent: 'Evropa', target: true },
  Sweden: { cs: 'Švédsko', continent: 'Evropa', target: true },
  Norway: { cs: 'Norsko', continent: 'Evropa', target: true },
  Germany: { cs: 'Německo', continent: 'Evropa', target: true },
  Finland: { cs: 'Finsko', continent: 'Evropa', target: true },
  Poland: { cs: 'Polsko', continent: 'Evropa', target: true },
  Italy: { cs: 'Itálie', continent: 'Evropa', target: true },
  'United Kingdom': { cs: 'Spojené království', continent: 'Evropa', target: true },
  Romania: { cs: 'Rumunsko', continent: 'Evropa', target: true },
  Belarus: { cs: 'Bělorusko', continent: 'Evropa', target: true },
  Greece: { cs: 'Řecko', continent: 'Evropa', target: true },
  Bulgaria: { cs: 'Bulharsko', continent: 'Evropa', target: true },
  Iceland: { cs: 'Island', continent: 'Evropa', target: true },
  Portugal: { cs: 'Portugalsko', continent: 'Evropa', target: true },
  Hungary: { cs: 'Maďarsko', continent: 'Evropa', target: true },
  Austria: { cs: 'Rakousko', continent: 'Evropa', target: true },
  Czechia: { cs: 'Česko', continent: 'Evropa', target: true },
  Serbia: { cs: 'Srbsko', continent: 'Evropa', target: true },
  Latvia: { cs: 'Lotyšsko', continent: 'Evropa', target: true },
  Lithuania: { cs: 'Litva', continent: 'Evropa', target: true },
  Ireland: { cs: 'Irsko', continent: 'Evropa', target: true },
  Croatia: { cs: 'Chorvatsko', continent: 'Evropa', target: true },
  'Bosnia and Herz.': { cs: 'Bosna a Hercegovina', continent: 'Evropa', target: true },
  Slovakia: { cs: 'Slovensko', continent: 'Evropa', target: true },
  Switzerland: { cs: 'Švýcarsko', continent: 'Evropa', target: true },
  Estonia: { cs: 'Estonsko', continent: 'Evropa', target: true },
  Denmark: { cs: 'Dánsko', continent: 'Evropa', target: true },
  Netherlands: { cs: 'Nizozemsko', continent: 'Evropa', target: true },
  Moldova: { cs: 'Moldavsko', continent: 'Evropa', target: true },
  Belgium: { cs: 'Belgie', continent: 'Evropa', target: true },
  Albania: { cs: 'Albánie', continent: 'Evropa', target: true },
  Macedonia: { cs: 'Severní Makedonie', continent: 'Evropa', target: true },
  Slovenia: { cs: 'Slovinsko', continent: 'Evropa', target: true },
  Montenegro: { cs: 'Černá Hora', continent: 'Evropa', target: true },
  Cyprus: { cs: 'Kypr', continent: 'Evropa', target: false },
  Luxembourg: { cs: 'Lucembursko', continent: 'Evropa', target: true },
  Kosovo: { cs: 'Kosovo', continent: 'Evropa', target: false },

  // ── Severní Amerika ─────────────────────────────────────────────────────
  Canada: { cs: 'Kanada', continent: 'Severní Amerika', target: true },
  'United States of America': { cs: 'USA', continent: 'Severní Amerika', target: true },
  Greenland: { cs: 'Grónsko', continent: 'Severní Amerika', target: true },
  Mexico: { cs: 'Mexiko', continent: 'Severní Amerika', target: true },
  Nicaragua: { cs: 'Nikaragua', continent: 'Severní Amerika', target: true },
  Cuba: { cs: 'Kuba', continent: 'Severní Amerika', target: true },
  Honduras: { cs: 'Honduras', continent: 'Severní Amerika', target: true },
  Guatemala: { cs: 'Guatemala', continent: 'Severní Amerika', target: true },
  Panama: { cs: 'Panama', continent: 'Severní Amerika', target: true },
  'Costa Rica': { cs: 'Kostarika', continent: 'Severní Amerika', target: true },
  'Dominican Rep.': { cs: 'Dominikánská republika', continent: 'Severní Amerika', target: false },
  Haiti: { cs: 'Haiti', continent: 'Severní Amerika', target: false },
  Belize: { cs: 'Belize', continent: 'Severní Amerika', target: false },
  'El Salvador': { cs: 'Salvador', continent: 'Severní Amerika', target: false },
  Bahamas: { cs: 'Bahamy', continent: 'Severní Amerika', target: false },
  Jamaica: { cs: 'Jamajka', continent: 'Severní Amerika', target: true },
  'Puerto Rico': { cs: 'Portoriko', continent: 'Severní Amerika', target: false },

  // ── Jižní Amerika ───────────────────────────────────────────────────────
  Brazil: { cs: 'Brazílie', continent: 'Jižní Amerika', target: true },
  Argentina: { cs: 'Argentina', continent: 'Jižní Amerika', target: true },
  Peru: { cs: 'Peru', continent: 'Jižní Amerika', target: true },
  Colombia: { cs: 'Kolumbie', continent: 'Jižní Amerika', target: true },
  Bolivia: { cs: 'Bolívie', continent: 'Jižní Amerika', target: true },
  Venezuela: { cs: 'Venezuela', continent: 'Jižní Amerika', target: true },
  Chile: { cs: 'Chile', continent: 'Jižní Amerika', target: true },
  Paraguay: { cs: 'Paraguay', continent: 'Jižní Amerika', target: true },
  Ecuador: { cs: 'Ekvádor', continent: 'Jižní Amerika', target: true },
  Guyana: { cs: 'Guyana', continent: 'Jižní Amerika', target: false },
  Uruguay: { cs: 'Uruguay', continent: 'Jižní Amerika', target: true },
  Suriname: { cs: 'Surinam', continent: 'Jižní Amerika', target: false },
  'Trinidad and Tobago': { cs: 'Trinidad a Tobago', continent: 'Jižní Amerika', target: false },

  // ── Oceánie ─────────────────────────────────────────────────────────────
  Australia: { cs: 'Austrálie', continent: 'Oceánie', target: true },
  'Papua New Guinea': { cs: 'Papua-Nová Guinea', continent: 'Oceánie', target: true },
  'New Zealand': { cs: 'Nový Zéland', continent: 'Oceánie', target: true },
  'Solomon Is.': { cs: 'Šalomounovy ostrovy', continent: 'Oceánie', target: false },
  'New Caledonia': { cs: 'Nová Kaledonie', continent: 'Oceánie', target: false },
  Fiji: { cs: 'Fidži', continent: 'Oceánie', target: false },
  Vanuatu: { cs: 'Vanuatu', continent: 'Oceánie', target: false },
};

// Short, hand-written "aha" notes shown on the reveal for the star countries –
// the ones whose Mercator distortion carries the whole point of the article.
export const FACTOIDS: Record<string, string> = {
  Greenland:
    'Grónsko na mapě soupeří s celou Afrikou – přitom je ve skutečnosti menší než Alžírsko a do Afriky by se vešlo asi čtrnáctkrát.',
  Russia:
    'Rusko je obrovské i doopravdy, ale jeho sibiřský sever je na Mercatoru roztažený nejvíc ze všech zemí světa.',
  Canada:
    'Kanada vypadá jako protáhlý kontinent. Její nejsevernější ostrovy Mercator nafukuje i víc než desetkrát.',
  'United States of America':
    'Aljaška působí jako obr srovnatelný s pevninskými USA – ve skutečnosti je zhruba pětkrát menší.',
  Antarctica:
    'Antarktida se na Mercatoru mění v nekonečný bílý pás na spodku mapy; její skutečnou velikost mapa vůbec neumí ukázat.',
  'Dem. Rep. Congo':
    'Demokratická republika Kongo leží na rovníku, takže ji Mercator ukazuje skoro poctivě – a přesto je větší než celá západní Evropa.',
};

export function isTarget(name: string): boolean {
  return COUNTRIES[name]?.target === true;
}

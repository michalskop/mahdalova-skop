export type CountryPresenceRow = {
  country: string;
  count: number;
  region: 'Europe' | 'North America' | 'Latin America' | 'Asia' | 'Middle East' | 'Africa' | 'Oceania';
  lat: number;
  lon: number;
};

export const countryPresence2026: CountryPresenceRow[] = [
  { country: 'France', count: 36, region: 'Europe', lat: 46.2, lon: 2.2 },
  { country: 'USA', count: 29, region: 'North America', lat: 39.8, lon: -98.6 },
  { country: 'Czech Republic', count: 28, region: 'Europe', lat: 49.8, lon: 15.5 },
  { country: 'Germany', count: 24, region: 'Europe', lat: 51.2, lon: 10.4 },
  { country: 'United Kingdom', count: 21, region: 'Europe', lat: 55.4, lon: -3.4 },
  { country: 'Belgium', count: 14, region: 'Europe', lat: 50.5, lon: 4.5 },
  { country: 'Spain', count: 13, region: 'Europe', lat: 40.5, lon: -3.7 },
  { country: 'Italy', count: 11, region: 'Europe', lat: 41.9, lon: 12.6 },
  { country: 'Slovak Republic', count: 10, region: 'Europe', lat: 48.7, lon: 19.7 },
  { country: 'Austria', count: 8, region: 'Europe', lat: 47.5, lon: 14.5 },
  { country: 'Netherlands', count: 8, region: 'Europe', lat: 52.1, lon: 5.3 },
  { country: 'Poland', count: 7, region: 'Europe', lat: 52.0, lon: 19.1 },
  { country: 'Argentina', count: 6, region: 'Latin America', lat: -38.4, lon: -63.6 },
  { country: 'Mexico', count: 6, region: 'Latin America', lat: 23.6, lon: -102.5 },
  { country: 'Norway', count: 6, region: 'Europe', lat: 60.5, lon: 8.5 },
  { country: 'Greece', count: 5, region: 'Europe', lat: 39.1, lon: 21.8 },
  { country: 'Japan', count: 5, region: 'Asia', lat: 36.2, lon: 138.3 },
  { country: 'Lithuania', count: 5, region: 'Europe', lat: 55.2, lon: 23.9 },
  { country: 'Luxembourg', count: 5, region: 'Europe', lat: 49.8, lon: 6.1 },
  { country: 'Brazil', count: 4, region: 'Latin America', lat: -14.2, lon: -51.9 },
  { country: 'Bulgaria', count: 4, region: 'Europe', lat: 42.7, lon: 25.5 },
  { country: 'Canada', count: 4, region: 'North America', lat: 56.1, lon: -106.3 },
  { country: 'Chile', count: 4, region: 'Latin America', lat: -35.7, lon: -71.5 },
  { country: 'Denmark', count: 4, region: 'Europe', lat: 56.3, lon: 9.5 },
  { country: 'Saudi Arabia', count: 4, region: 'Middle East', lat: 23.9, lon: 45.1 },
  { country: 'Switzerland', count: 4, region: 'Europe', lat: 46.8, lon: 8.2 },
  { country: 'Croatia', count: 3, region: 'Europe', lat: 45.1, lon: 15.2 },
  { country: 'Cyprus', count: 3, region: 'Europe', lat: 35.1, lon: 33.4 },
  { country: 'Czechoslovakia', count: 3, region: 'Europe', lat: 49.8, lon: 15.0 },
  { country: 'Hungary', count: 3, region: 'Europe', lat: 47.2, lon: 19.5 },
  { country: 'India', count: 3, region: 'Asia', lat: 20.6, lon: 78.9 },
  { country: 'Ireland', count: 3, region: 'Europe', lat: 53.4, lon: -8.2 },
  { country: 'Latvia', count: 3, region: 'Europe', lat: 56.9, lon: 24.6 },
  { country: 'Lebanon', count: 3, region: 'Middle East', lat: 33.9, lon: 35.9 },
  { country: 'Qatar', count: 3, region: 'Middle East', lat: 25.4, lon: 51.2 },
  { country: 'Romania', count: 3, region: 'Europe', lat: 45.9, lon: 24.9 },
  { country: 'Slovenia', count: 3, region: 'Europe', lat: 46.2, lon: 14.9 },
  { country: 'Sweden', count: 3, region: 'Europe', lat: 60.1, lon: 18.6 },
  { country: 'Colombia', count: 2, region: 'Latin America', lat: 4.6, lon: -74.3 },
  { country: 'Finland', count: 2, region: 'Europe', lat: 61.9, lon: 25.7 },
  { country: 'Iran', count: 2, region: 'Middle East', lat: 32.4, lon: 53.7 },
  { country: 'Nepal', count: 2, region: 'Asia', lat: 28.4, lon: 84.1 },
  { country: 'North Macedonia', count: 2, region: 'Europe', lat: 41.6, lon: 21.7 },
  { country: 'Serbia', count: 2, region: 'Europe', lat: 44.0, lon: 20.9 },
  { country: 'South Korea', count: 2, region: 'Asia', lat: 36.5, lon: 127.8 },
  { country: 'Albania', count: 1, region: 'Europe', lat: 41.2, lon: 20.2 },
  { country: 'Australia', count: 1, region: 'Oceania', lat: -25.3, lon: 133.8 },
  { country: 'China', count: 1, region: 'Asia', lat: 35.9, lon: 104.2 },
  { country: 'Estonia', count: 1, region: 'Europe', lat: 58.6, lon: 25.0 },
  { country: 'Gabon', count: 1, region: 'Africa', lat: -0.8, lon: 11.6 },
  { country: 'Guinea-Bissau', count: 1, region: 'Africa', lat: 11.8, lon: -15.2 },
  { country: 'Indonesia', count: 1, region: 'Asia', lat: -0.8, lon: 113.9 },
  { country: 'Ivory Coast', count: 1, region: 'Africa', lat: 7.5, lon: -5.6 },
  { country: 'Jordan', count: 1, region: 'Middle East', lat: 30.6, lon: 36.2 },
  { country: 'Kosovo', count: 1, region: 'Europe', lat: 42.6, lon: 20.9 },
  { country: 'Myanmar', count: 1, region: 'Asia', lat: 21.9, lon: 95.9 },
  { country: 'Palestine', count: 1, region: 'Middle East', lat: 31.9, lon: 35.2 },
  { country: 'Philippines', count: 1, region: 'Asia', lat: 12.9, lon: 122.0 },
  { country: 'Rwanda', count: 1, region: 'Africa', lat: -1.9, lon: 29.9 },
  { country: 'Senegal', count: 1, region: 'Africa', lat: 14.5, lon: -14.5 },
  { country: 'Singapore', count: 1, region: 'Asia', lat: 1.35, lon: 103.8 },
  { country: 'Turkey', count: 1, region: 'Middle East', lat: 39.0, lon: 35.2 },
  { country: 'Ukraine', count: 1, region: 'Europe', lat: 48.4, lon: 31.2 },
  { country: 'Uruguay', count: 1, region: 'Latin America', lat: -32.5, lon: -55.8 },
  { country: 'Yemen', count: 1, region: 'Middle East', lat: 15.6, lon: 48.5 },
];

// České názvy zemí pro zobrazení (archiv KVIFF je vede anglicky; historické
// entity jako Československo necháváme dobově – viz metodika kapitoly Země).
export const countryNamesCz: Record<string, string> = {
  France: 'Francie', USA: 'USA', 'Czech Republic': 'Česko', Germany: 'Německo',
  'United Kingdom': 'Británie', Belgium: 'Belgie', Spain: 'Španělsko', Italy: 'Itálie',
  'Slovak Republic': 'Slovensko', Austria: 'Rakousko', Netherlands: 'Nizozemsko',
  Poland: 'Polsko', Argentina: 'Argentina', Mexico: 'Mexiko', Norway: 'Norsko',
  Greece: 'Řecko', Japan: 'Japonsko', Lithuania: 'Litva', Luxembourg: 'Lucembursko',
  Brazil: 'Brazílie', Bulgaria: 'Bulharsko', Canada: 'Kanada', Chile: 'Chile',
  Denmark: 'Dánsko', 'Saudi Arabia': 'Saúdská Arábie', Switzerland: 'Švýcarsko',
  Croatia: 'Chorvatsko', Cyprus: 'Kypr', Czechoslovakia: 'Československo',
  Hungary: 'Maďarsko', India: 'Indie', Ireland: 'Irsko', Latvia: 'Lotyšsko',
  Lebanon: 'Libanon', Qatar: 'Katar', Romania: 'Rumunsko', Slovenia: 'Slovinsko',
  Sweden: 'Švédsko', Colombia: 'Kolumbie', Finland: 'Finsko', Iran: 'Írán',
  Nepal: 'Nepál', 'North Macedonia': 'Severní Makedonie', Serbia: 'Srbsko',
  'South Korea': 'Jižní Korea', Albania: 'Albánie', Australia: 'Austrálie',
  China: 'Čína', Estonia: 'Estonsko', Gabon: 'Gabon', 'Guinea-Bissau': 'Guinea-Bissau',
  Indonesia: 'Indonésie', 'Ivory Coast': 'Pobřeží slonoviny', Jordan: 'Jordánsko',
  Kosovo: 'Kosovo', Myanmar: 'Myanmar', Palestine: 'Palestina', Philippines: 'Filipíny',
  Rwanda: 'Rwanda', Senegal: 'Senegal', Singapore: 'Singapur', Turkey: 'Turecko',
  Ukraine: 'Ukrajina', Uruguay: 'Uruguay', Yemen: 'Jemen',
  'Soviet Union': 'Sovětský svaz', USSR: 'SSSR', Yugoslavia: 'Jugoslávie',
  'West Germany': 'Západní Německo', 'East Germany': 'Východní Německo (NDR)',
  Russia: 'Rusko', Georgia: 'Gruzie', Israel: 'Izrael', Egypt: 'Egypt',
  Portugal: 'Portugalsko', Iceland: 'Island', Slovakia: 'Slovensko',
  'Hong Kong': 'Hongkong', Taiwan: 'Tchaj-wan', Thailand: 'Thajsko',
  Vietnam: 'Vietnam', Morocco: 'Maroko', Tunisia: 'Tunisko', Algeria: 'Alžírsko',
  'South Africa': 'Jižní Afrika', 'New Zealand': 'Nový Zéland', Peru: 'Peru',
  Cuba: 'Kuba', Venezuela: 'Venezuela', Bolivia: 'Bolívie', Ecuador: 'Ekvádor',
  Kazakhstan: 'Kazachstán', Armenia: 'Arménie', Azerbaijan: 'Ázerbájdžán',
  Belarus: 'Bělorusko', Moldova: 'Moldavsko', 'Bosnia and Herzegovina': 'Bosna a Hercegovina',
  Montenegro: 'Černá Hora', Malta: 'Malta', Bangladesh: 'Bangladéš',
  'Sri Lanka': 'Srí Lanka', Mongolia: 'Mongolsko', Afghanistan: 'Afghánistán',
  Iraq: 'Irák', Syria: 'Sýrie', 'United Arab Emirates': 'Spojené arabské emiráty',
  Kuwait: 'Kuvajt', Nigeria: 'Nigérie', Kenya: 'Keňa', Ethiopia: 'Etiopie',
};

export function czCountry(name: string): string {
  return countryNamesCz[name] ?? name;
}

// Souřadnice + region pro země, které se v katalogu 2026 neobjevily, ale v
// historii festivalu (1992–2026) ano – potřebné pro historickou mapu zemí.
const historicalOnlyCoordinates: Record<string, { lat: number; lon: number; region: CountryPresenceRow['region'] }> = {
  Russia: { lat: 61.5, lon: 105.3, region: 'Europe' },
  USSR: { lat: 61.5, lon: 105.3, region: 'Europe' },
  Yugoslavia: { lat: 44.0, lon: 20.9, region: 'Europe' },
  'Bosnia and Herzegovina': { lat: 43.9, lon: 17.7, region: 'Europe' },
  'Hong Kong': { lat: 22.3, lon: 114.2, region: 'Asia' },
  Kazakhstan: { lat: 48.0, lon: 66.9, region: 'Asia' },
  Egypt: { lat: 26.8, lon: 30.8, region: 'Middle East' },
};

// Jednotný lookup souřadnic pro libovolnou zemi z celé historie festivalu
// (2026 katalog + historické doplňky výše) – používá jak aktuální mapa 2026,
// tak historická animovaná mapa.
export const countryCoordinates: Record<string, { lat: number; lon: number; region: CountryPresenceRow['region'] }> = {
  ...Object.fromEntries(countryPresence2026.map((row) => [row.country, { lat: row.lat, lon: row.lon, region: row.region }])),
  ...historicalOnlyCoordinates,
};

export const countryPresenceTotal = countryPresence2026.reduce((sum, row) => sum + row.count, 0);
export const countryPresenceTop = countryPresence2026.slice(0, 10);
export const countryPresenceMax = countryPresence2026[0].count;
export const countryRegionTotals = Object.entries(
  countryPresence2026.reduce<Record<string, number>>((acc, row) => {
    acc[row.region] = (acc[row.region] ?? 0) + row.count;
    return acc;
  }, {}),
)
  .map(([region, count]) => ({ region, count }))
  .sort((a, b) => b.count - a.count);

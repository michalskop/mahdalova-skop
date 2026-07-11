export type FilmCountRow = {
  year: number;
  edition?: number;
  availability: 'not-online' | 'not-held' | 'total-only' | 'total-screenings' | 'full-breakdown';
  totalFilms?: number;
  fictionFeatures?: number;
  documentaryFeatures?: number;
  shortFilms?: number;
  screenings?: number;
  note?: string;
  source: string;
};

export const filmCountRows: FilmCountRow[] = [
  { year: 1992, edition: 28, availability: 'not-online', note: 'Oficiální stránka ročníku neuvádí souhrnný počet filmů ani projekcí.', source: 'https://www.kviff.com/en/about-us/festival-archive/1992' },
  { year: 1993, availability: 'not-held', note: 'Rok není v oficiálním přehledu ročníků uveden.', source: 'https://www.kviff.com/en/about-us/festival-archive' },
  { year: 1994, edition: 29, availability: 'not-online', note: 'Oficiální stránka ročníku neuvádí souhrnný počet filmů ani projekcí.', source: 'https://www.kviff.com/en/about-us/festival-archive/1994' },
  { year: 1995, edition: 30, availability: 'total-only', totalFilms: 226, note: 'Na stránce je uveden počet filmů; počet projekcí chybí.', source: 'https://www.kviff.com/en/about-us/festival-archive/1995' },
  { year: 1996, edition: 31, availability: 'total-screenings', totalFilms: 251, screenings: 341, source: 'https://www.kviff.com/en/about-us/festival-archive/1996' },
  { year: 1997, edition: 32, availability: 'total-screenings', totalFilms: 297, screenings: 438, source: 'https://www.kviff.com/en/about-us/festival-archive/1997' },
  { year: 1998, edition: 33, availability: 'total-screenings', totalFilms: 213, screenings: 465, source: 'https://www.kviff.com/en/about-us/festival-archive/1998' },
  { year: 1999, edition: 34, availability: 'total-screenings', totalFilms: 247, screenings: 351, source: 'https://www.kviff.com/en/about-us/festival-archive/1999' },
  { year: 2000, edition: 35, availability: 'total-screenings', totalFilms: 293, screenings: 536, source: 'https://www.kviff.com/en/about-us/festival-archive/2000' },
  { year: 2001, edition: 36, availability: 'total-screenings', totalFilms: 282, screenings: 514, note: 'Současný anglický web označuje položku nepřesně jako Feature-length Fiction Films; hodnota odpovídá celkovému počtu filmů.', source: 'https://www.kviff.com/en/about-us/festival-archive/2001' },
  { year: 2002, edition: 37, availability: 'total-screenings', totalFilms: 292, screenings: 534, note: 'Současný anglický web označuje položku nepřesně jako Feature-length Fiction Films; hodnota odpovídá celkovému počtu filmů.', source: 'https://www.kviff.com/en/about-us/festival-archive/2002' },
  { year: 2003, edition: 38, availability: 'total-screenings', totalFilms: 304, screenings: 476, note: 'Současný anglický web označuje položku nepřesně jako Feature-length Fiction Films; hodnota odpovídá celkovému počtu filmů.', source: 'https://www.kviff.com/en/about-us/festival-archive/2003' },
  { year: 2004, edition: 39, availability: 'total-screenings', totalFilms: 235, screenings: 416, note: 'Stránka ročníku má zjevný překlep v datu; jde o 39. ročník v roce 2004.', source: 'https://www.kviff.com/en/about-us/festival-archive/2004' },
  { year: 2005, edition: 40, availability: 'total-screenings', totalFilms: 278, screenings: 517, source: 'https://www.kviff.com/en/about-us/festival-archive/2005' },
  { year: 2006, edition: 41, availability: 'total-screenings', totalFilms: 268, screenings: 474, source: 'https://www.kviff.com/en/about-us/festival-archive/2006' },
  { year: 2007, edition: 42, availability: 'total-screenings', totalFilms: 250, screenings: 480, source: 'https://www.kviff.com/en/about-us/festival-archive/2007' },
  { year: 2008, edition: 43, availability: 'total-screenings', totalFilms: 235, screenings: 477, source: 'https://www.kviff.com/en/about-us/festival-archive/2008' },
  { year: 2009, edition: 44, availability: 'total-screenings', totalFilms: 232, screenings: 464, source: 'https://www.kviff.com/en/about-us/festival-archive/2009' },
  { year: 2010, edition: 45, availability: 'total-screenings', totalFilms: 207, screenings: 413, source: 'https://www.kviff.com/en/about-us/festival-archive/2010' },
  { year: 2011, edition: 46, availability: 'total-screenings', totalFilms: 199, screenings: 413, source: 'https://www.kviff.com/en/about-us/festival-archive/2011' },
  { year: 2012, edition: 47, availability: 'total-screenings', totalFilms: 218, screenings: 410, source: 'https://www.kviff.com/en/about-us/festival-archive/2012' },
  { year: 2013, edition: 48, availability: 'total-screenings', totalFilms: 235, screenings: 461, source: 'https://www.kviff.com/en/about-us/festival-archive/2013' },
  { year: 2014, edition: 49, availability: 'total-screenings', totalFilms: 245, screenings: 478, source: 'https://www.kviff.com/en/about-us/festival-archive/2014' },
  { year: 2015, edition: 50, availability: 'total-screenings', totalFilms: 226, screenings: 488, source: 'https://www.kviff.com/en/about-us/festival-archive/2015' },
  { year: 2016, edition: 51, availability: 'total-screenings', totalFilms: 200, screenings: 507, source: 'https://www.kviff.com/en/about-us/festival-archive/2016' },
  { year: 2017, edition: 52, availability: 'total-screenings', totalFilms: 207, screenings: 505, source: 'https://www.kviff.com/en/about-us/festival-archive/2017' },
  { year: 2018, edition: 53, availability: 'full-breakdown', totalFilms: 236, fictionFeatures: 143, documentaryFeatures: 35, shortFilms: 58, screenings: 501, note: 'Celkem dopočteno jako 143 hraných celovečerních + 35 dokumentárních celovečerních + 58 krátkých filmů.', source: 'https://www.kviff.com/en/news/2730-barbarians-from-romania-win-the-53rd-karlovy-vary-iff' },
  { year: 2019, edition: 54, availability: 'total-screenings', totalFilms: 177, screenings: 497, note: 'Finální statistika uvádí 156 celovečerních filmů a 29 dokumentů; kategorie se překrývají, proto je zde nerozdělujeme.', source: 'https://www.kviff.com/en/news/3165-final-statistics-of-the-54th-karlovy-vary-iff' },
  { year: 2020, availability: 'not-held', note: 'V oficiálním přehledu není samostatný ročník 2020; 55. ročník proběhl až v roce 2021.', source: 'https://www.kviff.com/en/about-us/festival-archive' },
  { year: 2021, edition: 55, availability: 'total-screenings', totalFilms: 144, screenings: 456, note: 'Finální statistika uvádí 122 celovečerních filmů a 22 dokumentů; definice neumožňuje bezpečně dopočítat krátké filmy.', source: 'https://www.kviff.com/history/2021/final-press-release-2021.pdf' },
  { year: 2022, edition: 56, availability: 'full-breakdown', totalFilms: 170, fictionFeatures: 108, documentaryFeatures: 24, shortFilms: 38, screenings: 453, note: 'Celkem je součtem tří navzájem se vylučujících kategorií.', source: 'https://www.kviff.com/en/news/4134-statistics-of-the-56th-karlovy-vary-iff-2022' },
  { year: 2023, edition: 57, availability: 'full-breakdown', totalFilms: 185, fictionFeatures: 116, documentaryFeatures: 28, shortFilms: 41, screenings: 445, note: 'Celkem je součtem tří navzájem se vylučujících kategorií.', source: 'https://www.kviff.com/en/news/4588-statistics-of-the-57th-karlovy-vary-iff-2023' },
  { year: 2024, edition: 58, availability: 'full-breakdown', totalFilms: 177, fictionFeatures: 109, documentaryFeatures: 27, shortFilms: 41, screenings: 453, note: 'Celkem je součtem tří navzájem se vylučujících kategorií.', source: 'https://www.kviff.com/history/2024/final-press-release-2024.pdf' },
  { year: 2025, edition: 59, availability: 'full-breakdown', totalFilms: 175, fictionFeatures: 108, documentaryFeatures: 23, shortFilms: 44, screenings: 465, note: 'Celkem je součtem tří navzájem se vylučujících kategorií.', source: 'https://www.kviff.com/history/2025/final-press-release-2025.pdf' },
];

export const filmCountAvailableRows = filmCountRows.filter((row) => typeof row.totalFilms === 'number');
export const filmScreeningRows = filmCountRows.filter((row) => typeof row.totalFilms === 'number' && typeof row.screenings === 'number');
export const completeBreakdownRows = filmCountRows.filter((row) => row.availability === 'full-breakdown');
export const peakFilmYear = filmCountAvailableRows.reduce((peak, row) => (row.totalFilms! > peak.totalFilms! ? row : peak), filmCountAvailableRows[0]);
export const latestClosedFilmYear = filmCountAvailableRows[filmCountAvailableRows.length - 1];
export const minFilmYear = filmCountAvailableRows.reduce((min, row) => (row.totalFilms! < min.totalFilms! ? row : min), filmCountAvailableRows[0]);
export const latestScreeningsPerFilm = Math.round((latestClosedFilmYear.screenings! / latestClosedFilmYear.totalFilms!) * 100) / 100;
export const firstScreeningsPerFilm = Math.round((filmScreeningRows[0].screenings! / filmScreeningRows[0].totalFilms!) * 100) / 100;

export const filmScaleByPeriod = [
  { period: '1995-2003', label: 'Růst programu', avgFilms: 267, avgScreenings: 457 },
  { period: '2004-2017', label: 'Stabilizace', avgFilms: 231, avgScreenings: 463 },
  { period: '2018-2025', label: 'Menší katalog, hustší provoz', avgFilms: 181, avgScreenings: 470 },
];

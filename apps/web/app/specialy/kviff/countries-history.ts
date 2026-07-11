// GENEROVANO: _pipeline/build_countries_history_ts.py (zdroj: oficialni Archiv filmu KVIFF)
// Metodika: vyskyty produkcnich zemi (koprodukce se pocita kazde zemi),
// koprodukce = film se 2+ zememi. Pokryti archivu: 1992-2026 (bez 1993 a 2020).

export type CountryYearRow = {
  year: number;
  films: number;
  coproductions: number;
  coproductionShare: number | null;
  avgCountriesPerFilm: number | null;
  regions: Record<string, number>;
  top: Array<[string, number]>;
};

export const countryHistory: CountryYearRow[] = [
 {
  "year": 1992,
  "films": 18,
  "coproductions": 1,
  "coproductionShare": 5.6,
  "avgCountriesPerFilm": 1.11,
  "regions": {
   "Evropa": 15,
   "Blízký východ": 2,
   "Severní Amerika": 1,
   "Asie": 1,
   "Oceánie": 1
  },
  "top": [
   [
    "France",
    3
   ],
   [
    "Russia",
    2
   ],
   [
    "Belgium",
    2
   ],
   [
    "Turkey",
    1
   ],
   [
    "Hungary",
    1
   ],
   [
    "Iran",
    1
   ],
   [
    "Austria",
    1
   ],
   [
    "Canada",
    1
   ],
   [
    "Lithuania",
    1
   ],
   [
    "Germany",
    1
   ],
   [
    "Finland",
    1
   ],
   [
    "South Korea",
    1
   ]
  ]
 },
 {
  "year": 1994,
  "films": 149,
  "coproductions": 18,
  "coproductionShare": 12.1,
  "avgCountriesPerFilm": 1.16,
  "regions": {
   "Evropa": 140,
   "Severní Amerika": 19,
   "Latinská Amerika": 3,
   "Asie": 10,
   "Oceánie": 1
  },
  "top": [
   [
    "Czech Republic",
    46
   ],
   [
    "Russia",
    16
   ],
   [
    "USA",
    14
   ],
   [
    "United Kingdom",
    12
   ],
   [
    "Spain",
    11
   ],
   [
    "Italy",
    10
   ],
   [
    "France",
    10
   ],
   [
    "Hungary",
    8
   ],
   [
    "Germany",
    6
   ],
   [
    "Canada",
    5
   ],
   [
    "Poland",
    3
   ],
   [
    "Slovak Republic",
    2
   ]
  ]
 },
 {
  "year": 1995,
  "films": 169,
  "coproductions": 21,
  "coproductionShare": 12.4,
  "avgCountriesPerFilm": 1.18,
  "regions": {
   "Severní Amerika": 39,
   "Evropa": 138,
   "Asie": 14,
   "Blízký východ": 3,
   "Latinská Amerika": 4,
   "Afrika": 1,
   "Oceánie": 1
  },
  "top": [
   [
    "USA",
    34
   ],
   [
    "Czech Republic",
    16
   ],
   [
    "Russia",
    16
   ],
   [
    "Czechoslovakia",
    16
   ],
   [
    "United Kingdom",
    13
   ],
   [
    "France",
    13
   ],
   [
    "Germany",
    13
   ],
   [
    "Italy",
    8
   ],
   [
    "Hong Kong",
    6
   ],
   [
    "Poland",
    6
   ],
   [
    "Finland",
    6
   ],
   [
    "Hungary",
    5
   ]
  ]
 },
 {
  "year": 1996,
  "films": 171,
  "coproductions": 17,
  "coproductionShare": 9.9,
  "avgCountriesPerFilm": 1.13,
  "regions": {
   "Severní Amerika": 46,
   "Evropa": 120,
   "Asie": 21,
   "Blízký východ": 4,
   "Latinská Amerika": 2,
   "Oceánie": 1
  },
  "top": [
   [
    "USA",
    39
   ],
   [
    "France",
    26
   ],
   [
    "Germany",
    17
   ],
   [
    "Czech Republic",
    11
   ],
   [
    "Russia",
    7
   ],
   [
    "Canada",
    7
   ],
   [
    "United Kingdom",
    7
   ],
   [
    "Yugoslavia",
    6
   ],
   [
    "Austria",
    5
   ],
   [
    "Japan",
    5
   ],
   [
    "Poland",
    5
   ],
   [
    "Hong Kong",
    4
   ]
  ]
 },
 {
  "year": 1997,
  "films": 245,
  "coproductions": 31,
  "coproductionShare": 12.7,
  "avgCountriesPerFilm": 1.16,
  "regions": {
   "Severní Amerika": 70,
   "Evropa": 171,
   "Oceánie": 24,
   "Blízký východ": 5,
   "Asie": 13,
   "Latinská Amerika": 1,
   "Afrika": 1
  },
  "top": [
   [
    "USA",
    58
   ],
   [
    "Czech Republic",
    40
   ],
   [
    "France",
    29
   ],
   [
    "Australia",
    23
   ],
   [
    "Russia",
    16
   ],
   [
    "Germany",
    14
   ],
   [
    "United Kingdom",
    12
   ],
   [
    "Canada",
    12
   ],
   [
    "Spain",
    7
   ],
   [
    "Italy",
    6
   ],
   [
    "Poland",
    6
   ],
   [
    "Czechoslovakia",
    4
   ]
  ]
 },
 {
  "year": 1998,
  "films": 212,
  "coproductions": 36,
  "coproductionShare": 17.0,
  "avgCountriesPerFilm": 1.2,
  "regions": {
   "Severní Amerika": 55,
   "Evropa": 158,
   "Asie": 28,
   "Latinská Amerika": 7,
   "Oceánie": 3,
   "Afrika": 2,
   "Blízký východ": 2
  },
  "top": [
   [
    "USA",
    52
   ],
   [
    "France",
    26
   ],
   [
    "Russia",
    19
   ],
   [
    "Germany",
    14
   ],
   [
    "Spain",
    13
   ],
   [
    "United Kingdom",
    13
   ],
   [
    "Czech Republic",
    11
   ],
   [
    "Japan",
    11
   ],
   [
    "Netherlands",
    8
   ],
   [
    "Italy",
    7
   ],
   [
    "Ukraine",
    5
   ],
   [
    "Austria",
    5
   ]
  ]
 },
 {
  "year": 1999,
  "films": 164,
  "coproductions": 13,
  "coproductionShare": 7.9,
  "avgCountriesPerFilm": 1.1,
  "regions": {
   "Evropa": 135,
   "Severní Amerika": 26,
   "Asie": 14,
   "Blízký východ": 4,
   "Latinská Amerika": 2
  },
  "top": [
   [
    "Belgium",
    24
   ],
   [
    "France",
    21
   ],
   [
    "Czech Republic",
    19
   ],
   [
    "Canada",
    15
   ],
   [
    "Yugoslavia",
    14
   ],
   [
    "USA",
    11
   ],
   [
    "Germany",
    9
   ],
   [
    "Kazakhstan",
    9
   ],
   [
    "USSR",
    7
   ],
   [
    "Russia",
    6
   ],
   [
    "United Kingdom",
    6
   ],
   [
    "Netherlands",
    5
   ]
  ]
 },
 {
  "year": 2000,
  "films": 233,
  "coproductions": 39,
  "coproductionShare": 16.7,
  "avgCountriesPerFilm": 1.26,
  "regions": {
   "Severní Amerika": 41,
   "Evropa": 215,
   "Asie": 24,
   "Blízký východ": 4,
   "Afrika": 2,
   "Oceánie": 4,
   "Latinská Amerika": 3
  },
  "top": [
   [
    "USA",
    34
   ],
   [
    "France",
    32
   ],
   [
    "Germany",
    24
   ],
   [
    "Czech Republic",
    21
   ],
   [
    "Russia",
    17
   ],
   [
    "Bosnia and Herzegovina",
    12
   ],
   [
    "United Kingdom",
    11
   ],
   [
    "Italy",
    11
   ],
   [
    "Hungary",
    10
   ],
   [
    "Poland",
    7
   ],
   [
    "Canada",
    7
   ],
   [
    "Austria",
    6
   ]
  ]
 },
 {
  "year": 2001,
  "films": 256,
  "coproductions": 40,
  "coproductionShare": 15.6,
  "avgCountriesPerFilm": 1.2,
  "regions": {
   "Severní Amerika": 40,
   "Asie": 44,
   "Evropa": 197,
   "Latinská Amerika": 16,
   "Blízký východ": 8,
   "Oceánie": 2
  },
  "top": [
   [
    "USA",
    38
   ],
   [
    "South Korea",
    29
   ],
   [
    "France",
    29
   ],
   [
    "Germany",
    24
   ],
   [
    "Czech Republic",
    18
   ],
   [
    "Russia",
    17
   ],
   [
    "Spain",
    15
   ],
   [
    "United Kingdom",
    15
   ],
   [
    "Italy",
    11
   ],
   [
    "Poland",
    9
   ],
   [
    "Austria",
    7
   ],
   [
    "Hungary",
    6
   ]
  ]
 },
 {
  "year": 2002,
  "films": 287,
  "coproductions": 55,
  "coproductionShare": 19.2,
  "avgCountriesPerFilm": 1.25,
  "regions": {
   "Severní Amerika": 43,
   "Evropa": 230,
   "Latinská Amerika": 29,
   "Asie": 42,
   "Blízký východ": 8,
   "Oceánie": 5,
   "Afrika": 2
  },
  "top": [
   [
    "USA",
    36
   ],
   [
    "France",
    29
   ],
   [
    "United Kingdom",
    24
   ],
   [
    "Germany",
    24
   ],
   [
    "Czech Republic",
    23
   ],
   [
    "Netherlands",
    22
   ],
   [
    "Brazil",
    18
   ],
   [
    "Russia",
    18
   ],
   [
    "Spain",
    13
   ],
   [
    "South Korea",
    11
   ],
   [
    "Japan",
    10
   ],
   [
    "Italy",
    10
   ]
  ]
 },
 {
  "year": 2003,
  "films": 272,
  "coproductions": 54,
  "coproductionShare": 19.9,
  "avgCountriesPerFilm": 1.31,
  "regions": {
   "Evropa": 253,
   "Severní Amerika": 45,
   "Asie": 29,
   "Oceánie": 5,
   "Latinská Amerika": 11,
   "Blízký východ": 9,
   "Afrika": 3
  },
  "top": [
   [
    "France",
    46
   ],
   [
    "USA",
    34
   ],
   [
    "Germany",
    23
   ],
   [
    "United Kingdom",
    22
   ],
   [
    "Czech Republic",
    20
   ],
   [
    "Italy",
    15
   ],
   [
    "Japan",
    14
   ],
   [
    "Russia",
    12
   ],
   [
    "Canada",
    11
   ],
   [
    "Austria",
    11
   ],
   [
    "Spain",
    9
   ],
   [
    "Norway",
    8
   ]
  ]
 },
 {
  "year": 2004,
  "films": 233,
  "coproductions": 54,
  "coproductionShare": 23.2,
  "avgCountriesPerFilm": 1.34,
  "regions": {
   "Severní Amerika": 43,
   "Evropa": 210,
   "Blízký východ": 22,
   "Asie": 24,
   "Latinská Amerika": 11,
   "Oceánie": 2,
   "Afrika": 1
  },
  "top": [
   [
    "USA",
    37
   ],
   [
    "France",
    30
   ],
   [
    "Germany",
    26
   ],
   [
    "Czech Republic",
    22
   ],
   [
    "United Kingdom",
    13
   ],
   [
    "Spain",
    12
   ],
   [
    "Italy",
    12
   ],
   [
    "Turkey",
    11
   ],
   [
    "Russia",
    11
   ],
   [
    "Austria",
    9
   ],
   [
    "Hungary",
    8
   ],
   [
    "Switzerland",
    7
   ]
  ]
 },
 {
  "year": 2005,
  "films": 275,
  "coproductions": 66,
  "coproductionShare": 24.0,
  "avgCountriesPerFilm": 1.43,
  "regions": {
   "Severní Amerika": 63,
   "Evropa": 253,
   "Asie": 35,
   "Latinská Amerika": 18,
   "Blízký východ": 15,
   "Afrika": 5,
   "Oceánie": 3
  },
  "top": [
   [
    "USA",
    47
   ],
   [
    "France",
    34
   ],
   [
    "Germany",
    24
   ],
   [
    "United Kingdom",
    24
   ],
   [
    "Czech Republic",
    21
   ],
   [
    "Japan",
    16
   ],
   [
    "Canada",
    16
   ],
   [
    "Italy",
    13
   ],
   [
    "Norway",
    11
   ],
   [
    "Spain",
    11
   ],
   [
    "Belgium",
    10
   ],
   [
    "Denmark",
    10
   ]
  ]
 },
 {
  "year": 2006,
  "films": 267,
  "coproductions": 57,
  "coproductionShare": 21.3,
  "avgCountriesPerFilm": 1.31,
  "regions": {
   "Severní Amerika": 68,
   "Evropa": 216,
   "Latinská Amerika": 22,
   "Asie": 23,
   "Blízký východ": 12,
   "Oceánie": 4,
   "Afrika": 6
  },
  "top": [
   [
    "USA",
    61
   ],
   [
    "United Kingdom",
    30
   ],
   [
    "Czech Republic",
    29
   ],
   [
    "France",
    28
   ],
   [
    "Germany",
    23
   ],
   [
    "Spain",
    13
   ],
   [
    "Italy",
    9
   ],
   [
    "Sweden",
    9
   ],
   [
    "Netherlands",
    8
   ],
   [
    "Russia",
    7
   ],
   [
    "Argentina",
    7
   ],
   [
    "Canada",
    7
   ]
  ]
 },
 {
  "year": 2007,
  "films": 260,
  "coproductions": 56,
  "coproductionShare": 21.5,
  "avgCountriesPerFilm": 1.32,
  "regions": {
   "Evropa": 241,
   "Severní Amerika": 43,
   "Asie": 36,
   "Latinská Amerika": 11,
   "Blízký východ": 6,
   "Oceánie": 3,
   "Afrika": 3
  },
  "top": [
   [
    "France",
    38
   ],
   [
    "USA",
    35
   ],
   [
    "Czech Republic",
    32
   ],
   [
    "Germany",
    28
   ],
   [
    "United Kingdom",
    20
   ],
   [
    "Italy",
    15
   ],
   [
    "Japan",
    14
   ],
   [
    "Czechoslovakia",
    13
   ],
   [
    "Russia",
    9
   ],
   [
    "Canada",
    8
   ],
   [
    "Poland",
    8
   ],
   [
    "Spain",
    8
   ]
  ]
 },
 {
  "year": 2008,
  "films": 235,
  "coproductions": 61,
  "coproductionShare": 26.0,
  "avgCountriesPerFilm": 1.42,
  "regions": {
   "Severní Amerika": 46,
   "Evropa": 245,
   "Latinská Amerika": 17,
   "Asie": 15,
   "Blízký východ": 6,
   "Oceánie": 3,
   "Afrika": 2
  },
  "top": [
   [
    "USA",
    40
   ],
   [
    "United Kingdom",
    32
   ],
   [
    "Czech Republic",
    27
   ],
   [
    "France",
    23
   ],
   [
    "Germany",
    22
   ],
   [
    "Netherlands",
    16
   ],
   [
    "Italy",
    12
   ],
   [
    "Belgium",
    10
   ],
   [
    "Hungary",
    9
   ],
   [
    "Mexico",
    9
   ],
   [
    "Spain",
    9
   ],
   [
    "Russia",
    8
   ]
  ]
 },
 {
  "year": 2009,
  "films": 224,
  "coproductions": 67,
  "coproductionShare": 29.9,
  "avgCountriesPerFilm": 1.51,
  "regions": {
   "Evropa": 237,
   "Severní Amerika": 38,
   "Asie": 32,
   "Latinská Amerika": 15,
   "Blízký východ": 10,
   "Oceánie": 4,
   "Afrika": 2
  },
  "top": [
   [
    "Czech Republic",
    33
   ],
   [
    "USA",
    32
   ],
   [
    "France",
    31
   ],
   [
    "Germany",
    27
   ],
   [
    "Russia",
    15
   ],
   [
    "United Kingdom",
    14
   ],
   [
    "Spain",
    14
   ],
   [
    "Italy",
    14
   ],
   [
    "Poland",
    9
   ],
   [
    "Austria",
    8
   ],
   [
    "Belgium",
    8
   ],
   [
    "Slovak Republic",
    8
   ]
  ]
 },
 {
  "year": 2010,
  "films": 205,
  "coproductions": 54,
  "coproductionShare": 26.3,
  "avgCountriesPerFilm": 1.44,
  "regions": {
   "Evropa": 223,
   "Severní Amerika": 28,
   "Oceánie": 10,
   "Blízký východ": 13,
   "Asie": 13,
   "Latinská Amerika": 8,
   "Afrika": 1
  },
  "top": [
   [
    "France",
    33
   ],
   [
    "Czech Republic",
    33
   ],
   [
    "USA",
    22
   ],
   [
    "Germany",
    20
   ],
   [
    "United Kingdom",
    17
   ],
   [
    "Italy",
    11
   ],
   [
    "Belgium",
    10
   ],
   [
    "Australia",
    10
   ],
   [
    "Denmark",
    9
   ],
   [
    "Sweden",
    9
   ],
   [
    "Netherlands",
    9
   ],
   [
    "Spain",
    9
   ]
  ]
 },
 {
  "year": 2011,
  "films": 199,
  "coproductions": 59,
  "coproductionShare": 29.6,
  "avgCountriesPerFilm": 1.39,
  "regions": {
   "Severní Amerika": 48,
   "Evropa": 198,
   "Asie": 12,
   "Latinská Amerika": 8,
   "Blízký východ": 9,
   "Oceánie": 1,
   "Afrika": 1
  },
  "top": [
   [
    "USA",
    37
   ],
   [
    "France",
    23
   ],
   [
    "Czech Republic",
    23
   ],
   [
    "Germany",
    20
   ],
   [
    "United Kingdom",
    16
   ],
   [
    "Canada",
    11
   ],
   [
    "Spain",
    9
   ],
   [
    "Italy",
    9
   ],
   [
    "Greece",
    8
   ],
   [
    "Poland",
    8
   ],
   [
    "Slovak Republic",
    8
   ],
   [
    "Netherlands",
    7
   ]
  ]
 },
 {
  "year": 2012,
  "films": 213,
  "coproductions": 70,
  "coproductionShare": 32.9,
  "avgCountriesPerFilm": 1.52,
  "regions": {
   "Evropa": 259,
   "Severní Amerika": 30,
   "Blízký východ": 13,
   "Asie": 10,
   "Latinská Amerika": 6,
   "Oceánie": 3,
   "Afrika": 2
  },
  "top": [
   [
    "France",
    39
   ],
   [
    "Italy",
    33
   ],
   [
    "Czech Republic",
    26
   ],
   [
    "Germany",
    25
   ],
   [
    "United Kingdom",
    20
   ],
   [
    "USA",
    20
   ],
   [
    "Spain",
    11
   ],
   [
    "Canada",
    10
   ],
   [
    "Poland",
    10
   ],
   [
    "Denmark",
    9
   ],
   [
    "Slovak Republic",
    8
   ],
   [
    "Turkey",
    7
   ]
  ]
 },
 {
  "year": 2013,
  "films": 235,
  "coproductions": 69,
  "coproductionShare": 29.4,
  "avgCountriesPerFilm": 1.47,
  "regions": {
   "Severní Amerika": 48,
   "Evropa": 236,
   "Blízký východ": 24,
   "Asie": 24,
   "Latinská Amerika": 9,
   "Afrika": 2,
   "Oceánie": 2
  },
  "top": [
   [
    "USA",
    40
   ],
   [
    "France",
    30
   ],
   [
    "Czech Republic",
    29
   ],
   [
    "Germany",
    28
   ],
   [
    "United Kingdom",
    14
   ],
   [
    "Belgium",
    12
   ],
   [
    "Poland",
    11
   ],
   [
    "Italy",
    10
   ],
   [
    "Netherlands",
    9
   ],
   [
    "Russia",
    8
   ],
   [
    "Canada",
    8
   ],
   [
    "Slovak Republic",
    8
   ]
  ]
 },
 {
  "year": 2014,
  "films": 239,
  "coproductions": 72,
  "coproductionShare": 30.1,
  "avgCountriesPerFilm": 1.45,
  "regions": {
   "Evropa": 256,
   "Severní Amerika": 34,
   "Asie": 30,
   "Latinská Amerika": 11,
   "Oceánie": 5,
   "Blízký východ": 8,
   "Afrika": 3
  },
  "top": [
   [
    "United Kingdom",
    39
   ],
   [
    "France",
    31
   ],
   [
    "Czech Republic",
    30
   ],
   [
    "USA",
    27
   ],
   [
    "Germany",
    24
   ],
   [
    "Italy",
    22
   ],
   [
    "Austria",
    8
   ],
   [
    "India",
    8
   ],
   [
    "Canada",
    7
   ],
   [
    "Spain",
    7
   ],
   [
    "Russia",
    7
   ],
   [
    "Slovak Republic",
    7
   ]
  ]
 },
 {
  "year": 2015,
  "films": 220,
  "coproductions": 87,
  "coproductionShare": 39.5,
  "avgCountriesPerFilm": 1.68,
  "regions": {
   "Evropa": 276,
   "Severní Amerika": 34,
   "Blízký východ": 22,
   "Asie": 17,
   "Oceánie": 4,
   "Latinská Amerika": 16,
   "Afrika": 1
  },
  "top": [
   [
    "France",
    41
   ],
   [
    "Czech Republic",
    32
   ],
   [
    "Germany",
    30
   ],
   [
    "USA",
    26
   ],
   [
    "United Kingdom",
    16
   ],
   [
    "Italy",
    15
   ],
   [
    "Switzerland",
    12
   ],
   [
    "Greece",
    10
   ],
   [
    "Austria",
    9
   ],
   [
    "Canada",
    8
   ],
   [
    "Lebanon",
    8
   ],
   [
    "Slovak Republic",
    8
   ]
  ]
 },
 {
  "year": 2016,
  "films": 199,
  "coproductions": 76,
  "coproductionShare": 38.2,
  "avgCountriesPerFilm": 1.62,
  "regions": {
   "Evropa": 224,
   "Severní Amerika": 39,
   "Latinská Amerika": 16,
   "Blízký východ": 18,
   "Asie": 23,
   "Afrika": 2,
   "Oceánie": 1
  },
  "top": [
   [
    "France",
    45
   ],
   [
    "USA",
    31
   ],
   [
    "Czech Republic",
    24
   ],
   [
    "Germany",
    18
   ],
   [
    "Belgium",
    12
   ],
   [
    "United Kingdom",
    11
   ],
   [
    "Mexico",
    9
   ],
   [
    "Czechoslovakia",
    9
   ],
   [
    "Italy",
    9
   ],
   [
    "Canada",
    8
   ],
   [
    "Slovak Republic",
    8
   ],
   [
    "Austria",
    8
   ]
  ]
 },
 {
  "year": 2017,
  "films": 201,
  "coproductions": 78,
  "coproductionShare": 38.8,
  "avgCountriesPerFilm": 1.64,
  "regions": {
   "Evropa": 240,
   "Severní Amerika": 31,
   "Asie": 32,
   "Blízký východ": 15,
   "Latinská Amerika": 10,
   "Oceánie": 1,
   "Afrika": 1
  },
  "top": [
   [
    "France",
    33
   ],
   [
    "USA",
    27
   ],
   [
    "Germany",
    24
   ],
   [
    "Czech Republic",
    23
   ],
   [
    "United Kingdom",
    17
   ],
   [
    "Japan",
    16
   ],
   [
    "Slovak Republic",
    15
   ],
   [
    "Czechoslovakia",
    14
   ],
   [
    "Netherlands",
    13
   ],
   [
    "Poland",
    8
   ],
   [
    "Austria",
    8
   ],
   [
    "Italy",
    8
   ]
  ]
 },
 {
  "year": 2018,
  "films": 235,
  "coproductions": 80,
  "coproductionShare": 34.0,
  "avgCountriesPerFilm": 1.64,
  "regions": {
   "Severní Amerika": 64,
   "Evropa": 264,
   "Latinská Amerika": 22,
   "Blízký východ": 17,
   "Asie": 14,
   "Oceánie": 3,
   "Afrika": 2
  },
  "top": [
   [
    "USA",
    60
   ],
   [
    "France",
    33
   ],
   [
    "Czech Republic",
    30
   ],
   [
    "Germany",
    24
   ],
   [
    "United Kingdom",
    15
   ],
   [
    "Lithuania",
    11
   ],
   [
    "Latvia",
    11
   ],
   [
    "Italy",
    11
   ],
   [
    "Belgium",
    10
   ],
   [
    "Poland",
    10
   ],
   [
    "Slovak Republic",
    8
   ],
   [
    "Switzerland",
    8
   ]
  ]
 },
 {
  "year": 2019,
  "films": 182,
  "coproductions": 62,
  "coproductionShare": 34.1,
  "avgCountriesPerFilm": 1.58,
  "regions": {
   "Severní Amerika": 34,
   "Evropa": 203,
   "Blízký východ": 17,
   "Latinská Amerika": 17,
   "Asie": 10,
   "Afrika": 5,
   "Oceánie": 1
  },
  "top": [
   [
    "USA",
    33
   ],
   [
    "Czech Republic",
    29
   ],
   [
    "France",
    25
   ],
   [
    "Germany",
    15
   ],
   [
    "Egypt",
    11
   ],
   [
    "United Kingdom",
    11
   ],
   [
    "Czechoslovakia",
    11
   ],
   [
    "Slovak Republic",
    10
   ],
   [
    "Italy",
    8
   ],
   [
    "Sweden",
    8
   ],
   [
    "Netherlands",
    7
   ],
   [
    "Belgium",
    7
   ]
  ]
 },
 {
  "year": 2021,
  "films": 144,
  "coproductions": 71,
  "coproductionShare": 49.3,
  "avgCountriesPerFilm": 2.02,
  "regions": {
   "Evropa": 207,
   "Severní Amerika": 25,
   "Blízký východ": 21,
   "Asie": 21,
   "Latinská Amerika": 13,
   "Afrika": 3,
   "Oceánie": 1
  },
  "top": [
   [
    "France",
    39
   ],
   [
    "Czech Republic",
    22
   ],
   [
    "USA",
    20
   ],
   [
    "Germany",
    15
   ],
   [
    "United Kingdom",
    11
   ],
   [
    "Slovak Republic",
    11
   ],
   [
    "Qatar",
    7
   ],
   [
    "Poland",
    7
   ],
   [
    "Belgium",
    7
   ],
   [
    "Sweden",
    6
   ],
   [
    "Italy",
    6
   ],
   [
    "Netherlands",
    6
   ]
  ]
 },
 {
  "year": 2022,
  "films": 170,
  "coproductions": 72,
  "coproductionShare": 42.4,
  "avgCountriesPerFilm": 1.79,
  "regions": {
   "Severní Amerika": 42,
   "Evropa": 205,
   "Blízký východ": 18,
   "Oceánie": 5,
   "Latinská Amerika": 14,
   "Asie": 14,
   "Afrika": 7
  },
  "top": [
   [
    "USA",
    37
   ],
   [
    "France",
    37
   ],
   [
    "Germany",
    23
   ],
   [
    "Czech Republic",
    22
   ],
   [
    "United Kingdom",
    14
   ],
   [
    "Belgium",
    10
   ],
   [
    "Poland",
    9
   ],
   [
    "Italy",
    8
   ],
   [
    "Austria",
    8
   ],
   [
    "Denmark",
    8
   ],
   [
    "Spain",
    6
   ],
   [
    "Qatar",
    6
   ]
  ]
 },
 {
  "year": 2023,
  "films": 185,
  "coproductions": 78,
  "coproductionShare": 42.2,
  "avgCountriesPerFilm": 1.76,
  "regions": {
   "Evropa": 214,
   "Severní Amerika": 23,
   "Asie": 38,
   "Blízký východ": 30,
   "Latinská Amerika": 12,
   "Afrika": 7,
   "Oceánie": 2
  },
  "top": [
   [
    "France",
    44
   ],
   [
    "Germany",
    26
   ],
   [
    "Czech Republic",
    25
   ],
   [
    "USA",
    18
   ],
   [
    "Japan",
    16
   ],
   [
    "Italy",
    14
   ],
   [
    "Iran",
    13
   ],
   [
    "Switzerland",
    11
   ],
   [
    "United Kingdom",
    10
   ],
   [
    "Slovak Republic",
    10
   ],
   [
    "Sweden",
    7
   ],
   [
    "Denmark",
    7
   ]
  ]
 },
 {
  "year": 2024,
  "films": 177,
  "coproductions": 91,
  "coproductionShare": 51.4,
  "avgCountriesPerFilm": 1.93,
  "regions": {
   "Evropa": 229,
   "Severní Amerika": 45,
   "Asie": 33,
   "Blízký východ": 16,
   "Latinská Amerika": 11,
   "Afrika": 6,
   "Oceánie": 1
  },
  "top": [
   [
    "France",
    54
   ],
   [
    "USA",
    38
   ],
   [
    "Germany",
    27
   ],
   [
    "Czech Republic",
    21
   ],
   [
    "United Kingdom",
    14
   ],
   [
    "Italy",
    14
   ],
   [
    "Slovak Republic",
    13
   ],
   [
    "Netherlands",
    10
   ],
   [
    "Austria",
    8
   ],
   [
    "Canada",
    7
   ],
   [
    "Japan",
    6
   ],
   [
    "Belgium",
    6
   ]
  ]
 },
 {
  "year": 2025,
  "films": 175,
  "coproductions": 70,
  "coproductionShare": 40.0,
  "avgCountriesPerFilm": 1.74,
  "regions": {
   "Severní Amerika": 45,
   "Evropa": 207,
   "Blízký východ": 18,
   "Oceánie": 3,
   "Latinská Amerika": 13,
   "Asie": 17,
   "Afrika": 2
  },
  "top": [
   [
    "USA",
    39
   ],
   [
    "France",
    30
   ],
   [
    "Czech Republic",
    25
   ],
   [
    "Germany",
    15
   ],
   [
    "Slovak Republic",
    14
   ],
   [
    "United Kingdom",
    14
   ],
   [
    "Italy",
    10
   ],
   [
    "Belgium",
    10
   ],
   [
    "Spain",
    9
   ],
   [
    "Canada",
    6
   ],
   [
    "Netherlands",
    6
   ],
   [
    "Iran",
    5
   ]
  ]
 },
 {
  "year": 2026,
  "films": 9,
  "coproductions": 7,
  "coproductionShare": 77.8,
  "avgCountriesPerFilm": 2.78,
  "regions": {
   "Evropa": 15,
   "Severní Amerika": 2,
   "Blízký východ": 4,
   "Latinská Amerika": 2,
   "Asie": 1,
   "Oceánie": 1
  },
  "top": [
   [
    "Germany",
    3
   ],
   [
    "Spain",
    2
   ],
   [
    "France",
    2
   ],
   [
    "Denmark",
    1
   ],
   [
    "USA",
    1
   ],
   [
    "Serbia",
    1
   ],
   [
    "Slovak Republic",
    1
   ],
   [
    "Czech Republic",
    1
   ],
   [
    "Cyprus",
    1
   ],
   [
    "Palestine",
    1
   ],
   [
    "Jordan",
    1
   ],
   [
    "Greece",
    1
   ]
  ]
 }
];

export const countryHistoryTopCountries: Array<[string, number]> = [["USA", 1078], ["France", 987], ["Czech Republic", 784], ["Germany", 656], ["United Kingdom", 507], ["Italy", 347], ["Russia", 264], ["Spain", 243], ["Canada", 220], ["Belgium", 212], ["Netherlands", 211], ["Poland", 201], ["Austria", 192], ["Slovak Republic", 180], ["Japan", 176]];

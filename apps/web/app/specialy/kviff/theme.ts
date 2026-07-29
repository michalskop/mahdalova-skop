// Barevná identita speciálu KVIFF/Vary.
//
// Zdroj: apps/web/app/providers/ThemeProvider.tsx (jediný kanonický zdroj palety).
// Žádná z hodnot níže není vymyšlená ani odvozená — jde o přímé citace
// existujících škál `brandNavy` (dokumentovaná v packages/ui/DESIGN.md jako
// "Navy purple") a `brandYellow`.
//
// Fialová (brandNavy) = kontextová/historická barva, zlatá (brandYellow) =
// zvýraznění/aktuální stav. Stejné sémantické rozdělení jako u obecného
// chart standardu v DESIGN.md §10 (tam crimson místo zlaté), takže se KVIFF
// grafy drží brandového systému a zároveň dostávají vlastní identitu.

export const KVIFF_PURPLE = {
  50: '#e9ecf4',
  100: '#d2d8e9',
  200: '#bcc4df',
  300: '#a6b0d4',
  400: '#8f9dc9',
  500: '#7889be',
  600: '#6267a3', // brandNavy[6] – hlavní odstín, odkazy, aktivní stavy
  700: '#4c4f8e',
  800: '#2f325c', // brandNavy[8] – tmavý blok hera, nadpisy na světlém
  900: '#101432', // brandNavy[9] – nejtmavší, jen pro vysoký kontrast
} as const;

export const KVIFF_GOLD = {
  50: '#fffdf0',
  100: '#fff7d9', // lehký wash / pozadí infoboxů
  200: '#fff0b3',
  300: '#ffe680',
  400: '#ffdc33',
  500: '#ffd519',
  600: '#ffcf02', // brandYellow[6] – hlavní zlatá
  700: '#efb704', // zvýraznění v grafu, aktivní tab
  800: '#bd9103', // vyšší kontrast na světlém pozadí (odkazy, linky infoboxů)
  900: '#a47d03',
} as const;

// Zkratky pro nejčastější použití, ať se v komponentách nepíšou magická čísla indexů.
export const KVIFF_COLORS = {
  purple: KVIFF_PURPLE[600],
  purpleDark: KVIFF_PURPLE[800],
  purpleWash: KVIFF_PURPLE[50],
  gold: KVIFF_GOLD[600],
  goldStrong: KVIFF_GOLD[800], // pro odkazy a text – lepší kontrast než [600]
  goldWash: KVIFF_GOLD[100],
} as const;

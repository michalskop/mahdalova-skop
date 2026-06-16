// app/specialy/data-pro-budouci-premierku/page.tsx
import { Container, Title, Text, Box, SimpleGrid } from '@mantine/core';
import type { Metadata } from 'next';
import SupportBanner from '@/components/common/SupportBanner';
import ProfileHead from '@/components/dpbp/ProfileHead';

export const metadata: Metadata = {
  title: 'Data pro budoucí premiérku',
  description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
  alternates: { canonical: '/specialy/data-pro-budouci-premierku' },
  openGraph: {
    title: 'Data pro budoucí premiérku',
    description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
    url: '/specialy/data-pro-budouci-premierku',
    type: 'website',
  },
};

// Abstract dot compositions per chapter
// viewBox: 0 0 280 165 (legacy dots) nebo 0 0 200 200 (ISOTYPE customSvg)
type Dot = { cx: number; cy: number; r: number; fill: string };

// 01 Demografie — population pyramid (wider at base = more people)
const D01: Dot[] = [
  {cx:140,cy:22,r:9,fill:'#341535'},
  {cx:118,cy:50,r:10,fill:'#551538'},{cx:162,cy:50,r:10,fill:'#451537'},
  {cx:96,cy:80,r:11,fill:'#78163b'},{cx:140,cy:80,r:11,fill:'#8b163c'},{cx:184,cy:80,r:11,fill:'#80163b'},
  {cx:74,cy:112,r:12,fill:'#a9163f'},{cx:114,cy:112,r:12,fill:'#b3163f'},{cx:154,cy:112,r:12,fill:'#aa163f'},{cx:194,cy:112,r:12,fill:'#b61640'},
  {cx:52,cy:145,r:14,fill:'#de1743'},{cx:93,cy:145,r:14,fill:'#db1743'},{cx:134,cy:145,r:14,fill:'#de1743'},{cx:175,cy:145,r:14,fill:'#db1743'},{cx:216,cy:145,r:14,fill:'#de1743'},
];

// 02 Vzdělávání — ordered 4×3 grid (structured, systematic)
const D02: Dot[] = [
  {cx:52,cy:32,r:16,fill:'#1a2080'},{cx:108,cy:32,r:16,fill:'#2030a0'},{cx:172,cy:32,r:16,fill:'#4a51ab'},{cx:228,cy:32,r:16,fill:'#5e66d5'},
  {cx:52,cy:82,r:16,fill:'#6870dc'},{cx:108,cy:82,r:16,fill:'#7c85e8'},{cx:172,cy:82,r:16,fill:'#2838b0'},{cx:228,cy:82,r:16,fill:'#8090f4'},
  {cx:52,cy:132,r:16,fill:'#3048c0'},{cx:108,cy:132,r:16,fill:'#6880e8'},{cx:172,cy:132,r:16,fill:'#4060d0'},{cx:228,cy:132,r:16,fill:'#9098f0'},
];

// 03 Zdravotnictví — cross / plus pattern (medical)
const D03: Dot[] = [
  {cx:140,cy:18,r:14,fill:'#b262c0'},
  {cx:140,cy:50,r:14,fill:'#9671b6'},
  {cx:140,cy:82,r:17,fill:'#ae64be'},
  {cx:140,cy:114,r:14,fill:'#8878b1'},
  {cx:140,cy:146,r:14,fill:'#7d53b1'},
  {cx:30,cy:82,r:14,fill:'#618ea3'},
  {cx:74,cy:82,r:14,fill:'#5f8fa2'},
  {cx:206,cy:82,r:14,fill:'#15b787'},
  {cx:250,cy:82,r:14,fill:'#33a692'},
];

// 04 Trh práce — bar chart (4 bars of 3, 5, 4, 2)
const D04: Dot[] = [
  {cx:55,cy:148,r:13,fill:'#de1743'},{cx:55,cy:115,r:13,fill:'#da1947'},{cx:55,cy:82,r:13,fill:'#cd2257'},
  {cx:105,cy:148,r:13,fill:'#b72f6f'},{cx:105,cy:115,r:13,fill:'#b53072'},{cx:105,cy:82,r:13,fill:'#a13d89'},{cx:105,cy:49,r:13,fill:'#8f489d'},{cx:105,cy:16,r:13,fill:'#8151ae'},
  {cx:175,cy:148,r:13,fill:'#7d53b1'},{cx:175,cy:115,r:13,fill:'#705bc1'},{cx:175,cy:82,r:13,fill:'#6661cc'},{cx:175,cy:49,r:13,fill:'#5e66d5'},
  {cx:225,cy:148,r:13,fill:'#994292'},{cx:225,cy:115,r:13,fill:'#cd2257'},
];

// 05 Bydlení — building windows (3×4 grid = apartment block)
const D05: Dot[] = [
  {cx:85,cy:28,r:14,fill:'#1a4060'},{cx:140,cy:28,r:14,fill:'#0d5a82'},{cx:195,cy:28,r:14,fill:'#1e6090'},
  {cx:85,cy:66,r:14,fill:'#0a4a70'},{cx:140,cy:66,r:14,fill:'#157098'},{cx:195,cy:66,r:14,fill:'#0c5278'},
  {cx:85,cy:104,r:14,fill:'#1878a8'},{cx:140,cy:104,r:14,fill:'#0e4868'},{cx:195,cy:104,r:14,fill:'#12609a'},
  {cx:85,cy:142,r:14,fill:'#0b4f78'},{cx:140,cy:142,r:14,fill:'#1a68a0'},{cx:195,cy:142,r:14,fill:'#0d5080'},
];

// 06 Ekonomika — growth curve scatter (exponential)
const D06: Dot[] = [
  {cx:28,cy:148,r:9,fill:'#341535'},
  {cx:58,cy:138,r:10,fill:'#5f1539'},
  {cx:90,cy:124,r:11,fill:'#e43738'},
  {cx:122,cy:108,r:12,fill:'#f2851c'},
  {cx:157,cy:88,r:13,fill:'#ef7422'},
  {cx:192,cy:62,r:14,fill:'#f7a013'},
  {cx:226,cy:38,r:15,fill:'#fecc03'},
  {cx:255,cy:16,r:16,fill:'#ffcf02'},
];

// 07 Životní prostředí — concentric rings (tree rings / ecology)
// Center (140,84), inner R=44 (6 nodes), outer R=66 (9 nodes)
const D07: Dot[] = [
  {cx:140,cy:84,r:18,fill:'#1b5e20'},
  {cx:184,cy:84,r:12,fill:'#2e7d32'},{cx:162,cy:122,r:12,fill:'#388e3c'},{cx:118,cy:122,r:12,fill:'#43a047'},
  {cx:96,cy:84,r:12,fill:'#4caf50'},{cx:118,cy:46,r:12,fill:'#388e3c'},{cx:162,cy:46,r:12,fill:'#2e7d32'},
  {cx:206,cy:84,r:9,fill:'#45b050'},{cx:184,cy:141,r:9,fill:'#3a9a42'},{cx:140,cy:150,r:9,fill:'#37903c'},
  {cx:96,cy:141,r:9,fill:'#45b050'},{cx:74,cy:108,r:9,fill:'#3a9a42'},{cx:74,cy:60,r:9,fill:'#37903c'},
  {cx:96,cy:27,r:9,fill:'#45b050'},{cx:140,cy:18,r:9,fill:'#3a9a42'},{cx:184,cy:27,r:9,fill:'#37903c'},
];

// 08 Bezpečnost — shield perimeter (concentric circles)
// Center (140,82), inner R=38 (5 nodes), outer R=65 (8 nodes)
const D08: Dot[] = [
  {cx:140,cy:82,r:18,fill:'#0c447c'},
  {cx:140,cy:120,r:12,fill:'#185fa5'},{cx:104,cy:94,r:12,fill:'#1a6090'},{cx:118,cy:51,r:12,fill:'#1878a8'},
  {cx:162,cy:51,r:12,fill:'#1a6090'},{cx:176,cy:94,r:12,fill:'#185fa5'},
  {cx:205,cy:82,r:9,fill:'#2048a8'},{cx:186,cy:128,r:9,fill:'#185898'},{cx:140,cy:147,r:9,fill:'#2048a8'},
  {cx:94,cy:128,r:9,fill:'#185898'},{cx:75,cy:82,r:9,fill:'#2048a8'},{cx:94,cy:36,r:9,fill:'#185898'},
  {cx:140,cy:17,r:9,fill:'#2048a8'},{cx:186,cy:36,r:9,fill:'#185898'},
];

// 09 Sociální systém — network hub + satellites
// Hub (140,82), 5 satellites R=62, 5 secondary R=36
const D09: Dot[] = [
  {cx:140,cy:82,r:20,fill:'#006064'},
  {cx:140,cy:144,r:14,fill:'#00838f'},{cx:81,cy:101,r:14,fill:'#0097a7'},
  {cx:103,cy:32,r:14,fill:'#00acc1'},{cx:177,cy:32,r:14,fill:'#0097a7'},
  {cx:199,cy:101,r:14,fill:'#00838f'},
  {cx:169,cy:103,r:9,fill:'#3db3ae'},{cx:129,cy:116,r:9,fill:'#33a692'},
  {cx:104,cy:82,r:9,fill:'#3db3ae'},{cx:129,cy:48,r:9,fill:'#33a692'},
  {cx:169,cy:61,r:9,fill:'#3db3ae'},
];

// 10 Digitalizace — binary grid (large=1, small=0)
const D10: Dot[] = [
  {cx:30,cy:22,r:15,fill:'#58a43b'},{cx:87,cy:22,r:9,fill:'#4bac73'},{cx:140,cy:22,r:15,fill:'#34b9d6'},{cx:193,cy:22,r:9,fill:'#4aac75'},{cx:250,cy:22,r:15,fill:'#50a85a'},
  {cx:30,cy:68,r:9,fill:'#3fb2a4'},{cx:87,cy:68,r:15,fill:'#5ba32e'},{cx:140,cy:68,r:15,fill:'#46ae85'},{cx:193,cy:68,r:15,fill:'#5ba22c'},{cx:250,cy:68,r:9,fill:'#3db3ae'},
  {cx:30,cy:114,r:15,fill:'#49ad7b'},{cx:87,cy:114,r:15,fill:'#54a64a'},{cx:140,cy:114,r:9,fill:'#57a540'},{cx:193,cy:114,r:15,fill:'#639e0a'},{cx:250,cy:114,r:15,fill:'#3db3ad'},
  {cx:30,cy:148,r:9,fill:'#629f10'},{cx:87,cy:148,r:15,fill:'#58a43b'},{cx:140,cy:148,r:15,fill:'#4bac73'},{cx:193,cy:148,r:15,fill:'#34b9d6'},{cx:250,cy:148,r:9,fill:'#4aac75'},
];

// 11 Doprava — winding route (S-curve path)
const D11: Dot[] = [
  {cx:25,cy:148,r:9,fill:'#e65100'},{cx:60,cy:130,r:10,fill:'#ef6c00'},
  {cx:96,cy:108,r:11,fill:'#f57c00'},{cx:132,cy:96,r:12,fill:'#ff8f00'},
  {cx:168,cy:104,r:12,fill:'#ffa000'},{cx:205,cy:84,r:13,fill:'#ffb300'},
  {cx:238,cy:58,r:14,fill:'#ffc107'},{cx:256,cy:30,r:15,fill:'#ffd53d'},
];

// 12 Věda — atomic orbital (nucleus + 2 orbits)
// Center (138,82), orbit1 R=65 (4 nodes), orbit2 R=75 (6 nodes)
const D12: Dot[] = [
  {cx:135,cy:82,r:14,fill:'#4a148c'},{cx:150,cy:76,r:10,fill:'#6a1b9a'},{cx:142,cy:96,r:8,fill:'#38006b'},
  {cx:196,cy:115,r:11,fill:'#7b1fa2'},{cx:106,cy:138,r:11,fill:'#8e24aa'},
  {cx:80,cy:49,r:11,fill:'#9c27b0'},{cx:170,cy:26,r:11,fill:'#7b1fa2'},
  {cx:213,cy:82,r:9,fill:'#4a1080'},{cx:176,cy:147,r:9,fill:'#6a1890'},
  {cx:100,cy:147,r:9,fill:'#501088'},{cx:63,cy:82,r:9,fill:'#7820a0'},
  {cx:100,cy:17,r:9,fill:'#4a1080'},{cx:176,cy:17,r:9,fill:'#6a1890'},
];

// ── ISOTYPE piktogramy (viewBox 0 0 200 200, 15px grid, r=4.5) ───────────

// 01 Energie a bezpečnost — blesk
const G01 = <>
  <g fill="#ffcf02">
    <circle cx={115} cy={40} r={4.5}/><circle cx={130} cy={40} r={4.5}/>
    <circle cx={100} cy={55} r={4.5}/><circle cx={115} cy={55} r={4.5}/><circle cx={130} cy={55} r={4.5}/>
    <circle cx={85} cy={70} r={4.5}/><circle cx={100} cy={70} r={4.5}/><circle cx={115} cy={70} r={4.5}/>
    <circle cx={70} cy={85} r={4.5}/><circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/>
  </g>
  <g fill="#f76800">
    <circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={100} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/>
    <circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/>
    <circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/>
    <circle cx={40} cy={160} r={4.5}/><circle cx={55} cy={160} r={4.5}/>
  </g>
</>;

// 02 Demografie — věková pyramida (tvar podle reálných dat: úzký vrchol 85+,
// vyboulené patro 55–69 = silné poválečné ročníky, zúžení kolem 25–34,
// mírné rozšíření u dětí 0–14)
const G_DEMO = <>
  <g fill="#f76800">
    <circle cx={92.5} cy={28} r={4.5}/>
    <circle cx={92.5} cy={47} r={4.5}/><circle cx={77.5} cy={47} r={4.5}/>
    <circle cx={92.5} cy={66} r={4.5}/><circle cx={77.5} cy={66} r={4.5}/><circle cx={62.5} cy={66} r={4.5}/><circle cx={47.5} cy={66} r={4.5}/>
    <circle cx={92.5} cy={85} r={4.5}/><circle cx={77.5} cy={85} r={4.5}/><circle cx={62.5} cy={85} r={4.5}/><circle cx={47.5} cy={85} r={4.5}/><circle cx={32.5} cy={85} r={4.5}/><circle cx={17.5} cy={85} r={4.5}/>
    <circle cx={92.5} cy={104} r={4.5}/><circle cx={77.5} cy={104} r={4.5}/><circle cx={62.5} cy={104} r={4.5}/><circle cx={47.5} cy={104} r={4.5}/><circle cx={32.5} cy={104} r={4.5}/>
    <circle cx={92.5} cy={123} r={4.5}/><circle cx={77.5} cy={123} r={4.5}/><circle cx={62.5} cy={123} r={4.5}/>
    <circle cx={92.5} cy={142} r={4.5}/><circle cx={77.5} cy={142} r={4.5}/><circle cx={62.5} cy={142} r={4.5}/>
    <circle cx={92.5} cy={161} r={4.5}/><circle cx={77.5} cy={161} r={4.5}/><circle cx={62.5} cy={161} r={4.5}/><circle cx={47.5} cy={161} r={4.5}/>
    <circle cx={92.5} cy={180} r={4.5}/><circle cx={77.5} cy={180} r={4.5}/>
  </g>
  <g fill="#de1743">
    <circle cx={107.5} cy={28} r={4.5}/>
    <circle cx={107.5} cy={47} r={4.5}/><circle cx={122.5} cy={47} r={4.5}/>
    <circle cx={107.5} cy={66} r={4.5}/><circle cx={122.5} cy={66} r={4.5}/><circle cx={137.5} cy={66} r={4.5}/><circle cx={152.5} cy={66} r={4.5}/>
    <circle cx={107.5} cy={85} r={4.5}/><circle cx={122.5} cy={85} r={4.5}/><circle cx={137.5} cy={85} r={4.5}/><circle cx={152.5} cy={85} r={4.5}/><circle cx={167.5} cy={85} r={4.5}/><circle cx={182.5} cy={85} r={4.5}/>
    <circle cx={107.5} cy={104} r={4.5}/><circle cx={122.5} cy={104} r={4.5}/><circle cx={137.5} cy={104} r={4.5}/><circle cx={152.5} cy={104} r={4.5}/><circle cx={167.5} cy={104} r={4.5}/>
    <circle cx={107.5} cy={123} r={4.5}/><circle cx={122.5} cy={123} r={4.5}/><circle cx={137.5} cy={123} r={4.5}/>
    <circle cx={107.5} cy={142} r={4.5}/><circle cx={122.5} cy={142} r={4.5}/><circle cx={137.5} cy={142} r={4.5}/>
    <circle cx={107.5} cy={161} r={4.5}/><circle cx={122.5} cy={161} r={4.5}/><circle cx={137.5} cy={161} r={4.5}/><circle cx={152.5} cy={161} r={4.5}/>
    <circle cx={107.5} cy={180} r={4.5}/><circle cx={122.5} cy={180} r={4.5}/>
  </g>
</>;

// 03 Zdravotnictví a péče — zdvojené H
const G03 = <>
  <g fill="#5e66d5">
    {/* řádek 1 (25): 3+3, mezera nahoře mezi oblouky */}
    <circle cx={40} cy={25} r={4.5}/><circle cx={55} cy={25} r={4.5}/><circle cx={70} cy={25} r={4.5}/><circle cx={130} cy={25} r={4.5}/><circle cx={145} cy={25} r={4.5}/><circle cx={160} cy={25} r={4.5}/>
    {/* řádek 2 (40): 11 bodů, souvislé splynutí oblouků */}
    <circle cx={25} cy={40} r={4.5}/><circle cx={40} cy={40} r={4.5}/><circle cx={55} cy={40} r={4.5}/><circle cx={70} cy={40} r={4.5}/><circle cx={85} cy={40} r={4.5}/><circle cx={100} cy={40} r={4.5}/><circle cx={115} cy={40} r={4.5}/><circle cx={130} cy={40} r={4.5}/><circle cx={145} cy={40} r={4.5}/><circle cx={160} cy={40} r={4.5}/><circle cx={175} cy={40} r={4.5}/>
    {/* řádek 3 (55): 13 bodů, předsunutý okrajový bod */}
    <circle cx={10} cy={55} r={4.5}/><circle cx={25} cy={55} r={4.5}/><circle cx={40} cy={55} r={4.5}/><circle cx={55} cy={55} r={4.5}/><circle cx={70} cy={55} r={4.5}/><circle cx={85} cy={55} r={4.5}/><circle cx={115} cy={55} r={4.5}/><circle cx={130} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/><circle cx={160} cy={55} r={4.5}/><circle cx={175} cy={55} r={4.5}/><circle cx={190} cy={55} r={4.5}/>
    {/* řádek 4 (70): 13 bodů, druhý předsunutý okrajový bod (pár nad sebou) */}
    <circle cx={10} cy={70} r={4.5}/><circle cx={25} cy={70} r={4.5}/><circle cx={40} cy={70} r={4.5}/><circle cx={55} cy={70} r={4.5}/><circle cx={70} cy={70} r={4.5}/><circle cx={85} cy={70} r={4.5}/><circle cx={115} cy={70} r={4.5}/><circle cx={130} cy={70} r={4.5}/><circle cx={145} cy={70} r={4.5}/><circle cx={160} cy={70} r={4.5}/><circle cx={175} cy={70} r={4.5}/><circle cx={190} cy={70} r={4.5}/>
    {/* řádek 5 (85): vodorovné raménko kříže uprostřed */}
    <circle cx={25} cy={85} r={4.5}/><circle cx={40} cy={85} r={4.5}/><circle cx={55} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/><circle cx={160} cy={85} r={4.5}/><circle cx={175} cy={85} r={4.5}/>
    {/* řádek 6 (100) */}
    <circle cx={40} cy={100} r={4.5}/><circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/><circle cx={160} cy={100} r={4.5}/>
    {/* řádek 7 (115) */}
    <circle cx={55} cy={115} r={4.5}/><circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
    {/* řádek 8 (130) */}
    <circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/><circle cx={100} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/>
    {/* řádek 9 (145) */}
    <circle cx={85} cy={145} r={4.5}/><circle cx={100} cy={145} r={4.5}/><circle cx={115} cy={145} r={4.5}/>
    {/* řádek 10 (160) — špička srdce */}
    <circle cx={100} cy={160} r={4.5}/>
  </g>
  {/* bílý kříž — plný plus, 9 bodů, vyplněný střed + ramena 2 body do všech stran */}
  <g fill="#f8f6f0">
    <circle cx={100} cy={55} r={4.5}/>
    <circle cx={100} cy={70} r={4.5}/>
    <circle cx={70} cy={85} r={4.5}/><circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/><circle cx={130} cy={85} r={4.5}/>
    <circle cx={100} cy={100} r={4.5}/>
    <circle cx={100} cy={115} r={4.5}/>
  </g>
</>;

// 04 Klimatická změna — koule r=78, střed (100,100), vzor 3-7-9-9-11-11-11-9-9-7-3
const G04 = <>
  <g fill="#5e66d5">
    <circle cx={85} cy={25} r={4.5}/><circle cx={100} cy={25} r={4.5}/><circle cx={115} cy={25} r={4.5}/>
    <circle cx={55} cy={40} r={4.5}/><circle cx={70} cy={40} r={4.5}/><circle cx={85} cy={40} r={4.5}/><circle cx={100} cy={40} r={4.5}/><circle cx={115} cy={40} r={4.5}/><circle cx={130} cy={40} r={4.5}/><circle cx={145} cy={40} r={4.5}/>
    <circle cx={40} cy={55} r={4.5}/><circle cx={55} cy={55} r={4.5}/><circle cx={70} cy={55} r={4.5}/><circle cx={85} cy={55} r={4.5}/><circle cx={100} cy={55} r={4.5}/><circle cx={115} cy={55} r={4.5}/><circle cx={130} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/><circle cx={160} cy={55} r={4.5}/>
  </g>
  <g fill="#ffcf02">
    <circle cx={40} cy={70} r={4.5}/><circle cx={55} cy={70} r={4.5}/><circle cx={70} cy={70} r={4.5}/><circle cx={85} cy={70} r={4.5}/><circle cx={100} cy={70} r={4.5}/><circle cx={115} cy={70} r={4.5}/><circle cx={130} cy={70} r={4.5}/><circle cx={145} cy={70} r={4.5}/><circle cx={160} cy={70} r={4.5}/>
    <circle cx={25} cy={85} r={4.5}/><circle cx={40} cy={85} r={4.5}/><circle cx={55} cy={85} r={4.5}/><circle cx={70} cy={85} r={4.5}/><circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/><circle cx={130} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/><circle cx={160} cy={85} r={4.5}/><circle cx={175} cy={85} r={4.5}/>
  </g>
  <g fill="#f76800">
    <circle cx={25} cy={100} r={4.5}/><circle cx={40} cy={100} r={4.5}/><circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={100} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/><circle cx={160} cy={100} r={4.5}/><circle cx={175} cy={100} r={4.5}/>
    <circle cx={25} cy={115} r={4.5}/><circle cx={40} cy={115} r={4.5}/><circle cx={55} cy={115} r={4.5}/><circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/><circle cx={160} cy={115} r={4.5}/><circle cx={175} cy={115} r={4.5}/>
  </g>
  <g fill="#de1743">
    <circle cx={40} cy={130} r={4.5}/><circle cx={55} cy={130} r={4.5}/><circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/><circle cx={100} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/><circle cx={160} cy={130} r={4.5}/>
    <circle cx={40} cy={145} r={4.5}/><circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/><circle cx={85} cy={145} r={4.5}/><circle cx={100} cy={145} r={4.5}/><circle cx={115} cy={145} r={4.5}/><circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/><circle cx={160} cy={145} r={4.5}/>
    <circle cx={55} cy={160} r={4.5}/><circle cx={70} cy={160} r={4.5}/><circle cx={85} cy={160} r={4.5}/><circle cx={100} cy={160} r={4.5}/><circle cx={115} cy={160} r={4.5}/><circle cx={130} cy={160} r={4.5}/><circle cx={145} cy={160} r={4.5}/>
    <circle cx={85} cy={175} r={4.5}/><circle cx={100} cy={175} r={4.5}/><circle cx={115} cy={175} r={4.5}/>
  </g>
</>;

// 05 Bezpečnost a konflikty — bytelný zámek
const G08 = <>
  <g fill="rgba(255,255,255,0.4)">
    <circle cx={70} cy={85} r={4.5}/><circle cx={130} cy={85} r={4.5}/>
    <circle cx={70} cy={70} r={4.5}/><circle cx={130} cy={70} r={4.5}/>
    <circle cx={70} cy={55} r={4.5}/><circle cx={130} cy={55} r={4.5}/>
    <circle cx={85} cy={40} r={4.5}/><circle cx={115} cy={40} r={4.5}/>
    <circle cx={100} cy={40} r={4.5}/>
  </g>
  <g fill="#efb704">
    <circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={100} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/>
    <circle cx={55} cy={115} r={4.5}/><circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
    <circle cx={55} cy={130} r={4.5}/><circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/><circle cx={85} cy={145} r={4.5}/><circle cx={100} cy={145} r={4.5}/><circle cx={115} cy={145} r={4.5}/><circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
  </g>
  <circle cx={100} cy={115} r={4.5} fill="#101432"/>
  <circle cx={100} cy={130} r={4.5} fill="#101432"/>
</>;

// 06 AI a trh práce — neuronový čip
const G06 = <>
  <g fill="rgba(255,255,255,0.2)">
    <circle cx={85} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/>
    <circle cx={85} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/>
    <circle cx={100} cy={70} r={4.5}/><circle cx={100} cy={130} r={4.5}/>
    <circle cx={70} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/>
  </g>
  <g fill="#9b59b6">
    <circle cx={55} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
  </g>
  <g fill="#5e66d5">
    <circle cx={100} cy={40} r={4.5}/><circle cx={100} cy={160} r={4.5}/>
    <circle cx={40} cy={100} r={4.5}/><circle cx={160} cy={100} r={4.5}/>
    <circle cx={70} cy={70} r={4.5}/><circle cx={130} cy={70} r={4.5}/>
    <circle cx={70} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/>
  </g>
  <circle cx={100} cy={100} r={4.5} fill="#ffcf02"/>
</>;

// 07 Oligarchizace a korupce — odtržená elita
const G07 = <>
  <g fill="rgba(255,255,255,0.25)">
    <circle cx={25} cy={160} r={4.5}/><circle cx={40} cy={160} r={4.5}/><circle cx={55} cy={160} r={4.5}/><circle cx={70} cy={160} r={4.5}/><circle cx={85} cy={160} r={4.5}/><circle cx={100} cy={160} r={4.5}/><circle cx={115} cy={160} r={4.5}/><circle cx={130} cy={160} r={4.5}/><circle cx={145} cy={160} r={4.5}/><circle cx={160} cy={160} r={4.5}/><circle cx={175} cy={160} r={4.5}/>
    <circle cx={40} cy={145} r={4.5}/><circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/><circle cx={85} cy={145} r={4.5}/><circle cx={100} cy={145} r={4.5}/><circle cx={115} cy={145} r={4.5}/><circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/><circle cx={160} cy={145} r={4.5}/>
    <circle cx={55} cy={130} r={4.5}/><circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/><circle cx={100} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/>
  </g>
  <g fill="#ffcf02">
    <circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/>
    <circle cx={100} cy={70} r={4.5}/>
  </g>
  <circle cx={100} cy={55} r={4.5} fill="#de1743"/>
</>;

// 08 Nedostupnost bydlení — dům s okny
const G05 = <>
  <g fill="#de1743">
    <circle cx={100} cy={55} r={4.5}/>
    <circle cx={85} cy={70} r={4.5}/><circle cx={100} cy={70} r={4.5}/><circle cx={115} cy={70} r={4.5}/>
    <circle cx={70} cy={85} r={4.5}/><circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/><circle cx={130} cy={85} r={4.5}/>
    <circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={100} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/>
  </g>
  <g fill="rgba(255,255,255,0.3)">
    <circle cx={55} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
    <circle cx={55} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
    <circle cx={55} cy={160} r={4.5}/><circle cx={70} cy={160} r={4.5}/><circle cx={85} cy={160} r={4.5}/><circle cx={115} cy={160} r={4.5}/><circle cx={130} cy={160} r={4.5}/><circle cx={145} cy={160} r={4.5}/>
  </g>
  <circle cx={85} cy={115} r={4.5} fill="#ffcf02"/><circle cx={115} cy={115} r={4.5} fill="#ffcf02"/>
  <circle cx={85} cy={130} r={4.5} fill="#ffcf02"/><circle cx={115} cy={130} r={4.5} fill="#ffcf02"/>
  <circle cx={100} cy={130} r={4.5} fill="#f76800"/>
  <circle cx={100} cy={145} r={4.5} fill="#f76800"/>
  <circle cx={100} cy={160} r={4.5} fill="#f76800"/>
</>;

// 09 Ekonomická nerovnost — váhy příjmů
const G09 = <>
  <g fill="rgba(255,255,255,0.15)">
    <circle cx={25} cy={160} r={4.5}/><circle cx={40} cy={160} r={4.5}/><circle cx={55} cy={160} r={4.5}/><circle cx={70} cy={160} r={4.5}/><circle cx={85} cy={160} r={4.5}/><circle cx={100} cy={160} r={4.5}/><circle cx={115} cy={160} r={4.5}/><circle cx={130} cy={160} r={4.5}/><circle cx={145} cy={160} r={4.5}/><circle cx={160} cy={160} r={4.5}/><circle cx={175} cy={160} r={4.5}/>
  </g>
  <g fill="rgba(255,255,255,0.4)">
    <circle cx={55} cy={145} r={4.5}/>
    <circle cx={55} cy={130} r={4.5}/>
    <circle cx={55} cy={115} r={4.5}/>
    <circle cx={70} cy={145} r={4.5}/>
    <circle cx={70} cy={130} r={4.5}/>
    <circle cx={70} cy={115} r={4.5}/>
  </g>
  <g fill="#efb704">
    <circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
    <circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
    <circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/>
    <circle cx={130} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/>
    <circle cx={130} cy={70} r={4.5}/><circle cx={145} cy={70} r={4.5}/>
    <circle cx={130} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/>
  </g>
  <circle cx={130} cy={40} r={4.5} fill="#f76800"/>
  <circle cx={145} cy={40} r={4.5} fill="#de1743"/>
</>;

// 10 Digitalizace a inovace — notebook s daty
const G10 = <>
  <g fill="rgba(255,255,255,0.25)">
    <circle cx={55} cy={55} r={4.5}/><circle cx={70} cy={55} r={4.5}/><circle cx={85} cy={55} r={4.5}/><circle cx={100} cy={55} r={4.5}/><circle cx={115} cy={55} r={4.5}/><circle cx={130} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/>
    <circle cx={55} cy={70} r={4.5}/><circle cx={145} cy={70} r={4.5}/>
    <circle cx={55} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/>
    <circle cx={55} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/>
    <circle cx={55} cy={115} r={4.5}/><circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
  </g>
  <g fill="rgba(255,255,255,0.5)">
    <circle cx={40} cy={130} r={4.5}/><circle cx={55} cy={130} r={4.5}/><circle cx={70} cy={130} r={4.5}/><circle cx={85} cy={130} r={4.5}/><circle cx={100} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/><circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/><circle cx={160} cy={130} r={4.5}/>
  </g>
  <circle cx={100} cy={70} r={4.5} fill="#de1743"/>
  <circle cx={85} cy={85} r={4.5} fill="#5e66d5"/>
  <circle cx={100} cy={85} r={4.5} fill="#ffcf02"/>
  <circle cx={115} cy={85} r={4.5} fill="#f76800"/>
  <circle cx={100} cy={100} r={4.5} fill="#5e66d5"/>
</>;

// 11 Vzdělávání — otevřená kniha
const G02 = <>
  <g fill="#5e66d5">
    <circle cx={25} cy={130} r={4.5}/><circle cx={40} cy={130} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/><circle cx={85} cy={145} r={4.5}/>
    <circle cx={115} cy={145} r={4.5}/><circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
    <circle cx={160} cy={130} r={4.5}/><circle cx={175} cy={130} r={4.5}/>
  </g>
  <g fill="rgba(255,255,255,0.25)">
    <circle cx={40} cy={70} r={4.5}/><circle cx={40} cy={85} r={4.5}/><circle cx={40} cy={100} r={4.5}/><circle cx={40} cy={115} r={4.5}/>
    <circle cx={55} cy={85} r={4.5}/><circle cx={55} cy={100} r={4.5}/><circle cx={55} cy={115} r={4.5}/><circle cx={55} cy={130} r={4.5}/>
    <circle cx={70} cy={100} r={4.5}/><circle cx={70} cy={115} r={4.5}/><circle cx={70} cy={130} r={4.5}/>
    <circle cx={85} cy={115} r={4.5}/><circle cx={85} cy={130} r={4.5}/>
    <circle cx={115} cy={115} r={4.5}/><circle cx={115} cy={130} r={4.5}/>
    <circle cx={130} cy={100} r={4.5}/><circle cx={130} cy={115} r={4.5}/><circle cx={130} cy={130} r={4.5}/>
    <circle cx={145} cy={85} r={4.5}/><circle cx={145} cy={100} r={4.5}/><circle cx={145} cy={115} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={160} cy={70} r={4.5}/><circle cx={160} cy={85} r={4.5}/><circle cx={160} cy={100} r={4.5}/><circle cx={160} cy={115} r={4.5}/>
  </g>
  <circle cx={100} cy={115} r={4.5} fill="rgba(255,255,255,0.4)"/>
  <circle cx={100} cy={130} r={4.5} fill="rgba(255,255,255,0.4)"/>
  <g fill="#ffcf02">
    <circle cx={100} cy={145} r={4.5}/>
    <circle cx={100} cy={160} r={4.5}/>
  </g>
</>;

// 12 Informační manipulace — digitální oko
const G12 = <>
  {/* pupila */}
  <circle cx={100} cy={100} r={4.5} fill="#de1743"/>
  {/* duhovka — teal */}
  <g fill="#5e66d5">
    <circle cx={85} cy={70} r={4.5}/><circle cx={100} cy={70} r={4.5}/><circle cx={115} cy={70} r={4.5}/>
    <circle cx={70} cy={85} r={4.5}/><circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/><circle cx={130} cy={85} r={4.5}/>
    <circle cx={70} cy={100} r={4.5}/><circle cx={85} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/><circle cx={130} cy={100} r={4.5}/>
    <circle cx={70} cy={115} r={4.5}/><circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/><circle cx={130} cy={115} r={4.5}/>
    <circle cx={85} cy={130} r={4.5}/><circle cx={100} cy={130} r={4.5}/><circle cx={115} cy={130} r={4.5}/>
  </g>
  {/* bělmo — šedé body po stranách */}
  <g fill="rgba(255,255,255,0.3)">
    <circle cx={55} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/>
    <circle cx={40} cy={100} r={4.5}/><circle cx={55} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/><circle cx={160} cy={100} r={4.5}/>
    <circle cx={55} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
  </g>
</>;

const CHAPTERS = [
  {n:'01',title:'Energie a energetická bezpečnost',href:'/specialy/data-pro-budouci-premierku/01-energie-a-energeticka-bezpecnost',available:true,dots:D01,accent:'#ffcf02',customSvg:G01},
  {n:'02',title:'Demografie',href:'/clanek/data-pro-budouci-premierku-02-demografie',available:true,dots:D01,accent:'#f76800',customSvg:G_DEMO},
  {n:'03',title:'Zdravotnictví a péče',href:'/specialy/data-pro-budouci-premierku/03-zdravotnictvi-a-pece',available:true,dots:D03,accent:'#5e66d5',customSvg:G03},
  {n:'04',title:'Klimatická změna',href:'/specialy/data-pro-budouci-premierku/04-klimaticka-zmena',available:true,dots:D04,accent:'#de1743',customSvg:G04},
  {n:'05',title:'Bezpečnost a konflikty',href:'/specialy/data-pro-budouci-premierku/05-bezpecnost-a-konflikty',available:true,dots:D05,accent:'#efb704',customSvg:G08},
  {n:'06',title:'AI a trh práce',href:'/specialy/data-pro-budouci-premierku/06-ai-a-trh-prace',available:true,dots:D06,accent:'#ffcf02',customSvg:G06},
  {n:'07',title:'Oligarchizace a korupce',href:'/specialy/data-pro-budouci-premierku/07-oligarchizace-a-korupce',available:true,dots:D07,accent:'#ffcf02',customSvg:G07},
  {n:'08',title:'Nedostupnost bydlení',href:'/specialy/data-pro-budouci-premierku/08-nedostupnost-bydleni',available:true,dots:D05,accent:'#de1743',customSvg:G05},
  {n:'09',title:'Ekonomická nerovnost',href:'/specialy/data-pro-budouci-premierku/09-ekonomicka-nerovnost',available:true,dots:D09,accent:'#efb704',customSvg:G09},
  {n:'10',title:'Digitalizace a inovace',href:'/specialy/data-pro-budouci-premierku/10-digitalizace-a-inovace',available:true,dots:D10,accent:'#5e66d5',customSvg:G10},
  {n:'11',title:'Úroveň vzdělávání',href:'/specialy/data-pro-budouci-premierku/11-uroven-vzdelavani',available:true,dots:D02,accent:'#5e66d5',customSvg:G02},
  {n:'12',title:'Informační manipulace',href:'/specialy/data-pro-budouci-premierku/12-medialni-manipulace',available:true,dots:D12,accent:'#de1743',customSvg:G12},
];

const DARK = '#101432';
const CRIMSON = '#de1743';
const FONT = "var(--font-roboto-slab), Georgia, serif";
const TEXT = '#f8f6f0';

function ChapterTile({ chapter }: { chapter: typeof CHAPTERS[0] }) {
  const inner = (
    <div
      className="ch-card ch-active"
      style={{
        ['--ch-accent' as string]: chapter.accent,
        background: DARK,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.10)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 300,
        cursor: 'pointer',
        transition: 'border-color 0.22s ease, background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease',
      }}
    >
      {/* Top row: large number (left) + piktogram (right). The SVG viewBox has
          built-in empty padding below the dots, so plain flex align-items:
          flex-end aligns the invisible box, not the ink — translateY below
          nudges the icon down to visually compensate. */}
      <div style={{ flex: '1 1 0', padding: '8px 8px 0', marginBottom: 24, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
        <div className="ch-card-number" style={{
          fontSize: 'clamp(60px, 8vw, 90px)',
          lineHeight: 0.8,
          fontWeight: 800,
          fontStyle: 'italic',
          fontFamily: FONT,
          color: CRIMSON,
          letterSpacing: '-0.03em',
          flex: '0 0 auto',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}>
          {chapter.n}
        </div>
        <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          {chapter.customSvg ? (
            <svg viewBox="-10 -10 220 220" xmlns="http://www.w3.org/2000/svg"
              style={{ height: 'clamp(120px, 16vw, 180px)', width: 'auto', maxWidth: '100%', display: 'block', transform: 'translateY(15px)' }}
              aria-hidden>
              {chapter.customSvg}
            </svg>
          ) : (
            <svg viewBox="0 0 280 165" xmlns="http://www.w3.org/2000/svg"
              style={{ height: 'clamp(120px, 16vw, 180px)', width: 'auto', maxWidth: '100%', display: 'block', transform: 'translateY(15px)' }}
              aria-hidden>
              {chapter.dots.map((d, i) => (
                <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Accent line — chapter color */}
      <div style={{ height: 2, background: '#ff3f30', margin: '0 16px', opacity: 0.7 }} />

      {/* Info area */}
      <div style={{ padding: '10px 16px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="ch-card-title" style={{
          fontSize: 'clamp(14px, 1.2vw, 18px)',
          fontWeight: 700,
          fontFamily: FONT,
          color: '#f8f6f0',
          lineHeight: 1.35,
          letterSpacing: '0.01em',
          paddingTop: 12,
          marginBottom: 12,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}>
          {chapter.title}
        </div>
        <div className="ch-card-cta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            fontFamily: "'Roboto', system-ui, sans-serif",
            color: '#f76800',
          }}>
            Číst kapitolu
          </span>
          <svg className="ch-card-arrow" width="34" height="10" viewBox="0 0 34 10" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <line x1="0" y1="5" x2="27" y2="5" stroke="#f76800" strokeWidth="2.5" />
            <path d="M22 1 L28 5 L22 9" fill="none" stroke="#f76800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );

  if (!chapter.available) return (
    <div style={{ height: '100%', display: 'block' }}>
      {inner}
    </div>
  );
  return (
    <a href={chapter.href} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
      {inner}
    </a>
  );
}

export default function DpbpLandingPage() {
  return (
    <Container size="lg" maw="1200px" w="100%" p={0} m="0 auto">
      <style>{`
        .ch-card {
          box-shadow: 0 2px 12px rgba(0,0,0,0.35);
          will-change: transform, background-color, box-shadow;
          transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94),
                      background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .ch-active:hover {
          transform: scale(1.025);
          background: #171c42 !important;
          border-color: #de1743 !important;
          box-shadow:
            inset 0 0 0 1px #de1743,
            0 12px 30px rgba(0,0,0,0.4),
            0 0 28px rgba(222,23,67,0.18) !important;
        }
        .ch-card-number {
          margin-bottom: 10px;
          opacity: 0.85;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .ch-active:hover .ch-card-number {
          opacity: 1;
          transform: translateX(3px);
        }
        .ch-card-arrow {
          transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ch-active:hover .ch-card-arrow {
          transform: scaleX(1.4) translateX(2px);
        }
        .dt-hero {
          background: linear-gradient(90deg, #101432 0%, #f71b4b 100%);
          padding: 52px 40px 44px;
          display: flex;
          flex-direction: column-reverse;
          gap: 2rem;
          align-items: center;
        }
        @media (min-width: 768px) {
          .dt-hero {
            flex-direction: row;
            justify-content: space-between;
            align-items: stretch;
          }
        }
        @media (max-width: 600px) {
          .ch-card-title {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
          }
        }
        .dt-hero-content {
          flex: 1;
          max-width: 750px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dt-tag {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #f8f6f0;
          opacity: 0.7;
          margin: 0;
          font-family: 'Roboto', system-ui, sans-serif;
          text-align: left;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .dt-hero-title {
          font-family: 'Roboto Slab', Georgia, serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 2.2vw, 2rem);
          white-space: nowrap;
          color: #f8f6f0;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
          transition: color 0.35s ease, text-shadow 0.35s ease;
          cursor: default;
        }
        .dt-hero-title:hover {
          color: #ff3f30;
          text-shadow: 0 0 24px rgba(255, 63, 48, 0.45);
        }
        .dt-hero-lead {
          font-size: clamp(15px, 1.5vw, 18px);
          font-weight: 400;
          color: #f8f6f0;
          opacity: 0.7;
          line-height: 1.6;
          max-width: 65ch;
          font-family: 'Roboto', system-ui, sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .dt-hero-visual {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .dt-hero-profile svg,
        .dt-hero-profile img {
          width: clamp(140px, 16vw, 220px);
          height: auto;
          display: block;
        }
        .dt-infobox {
          background: #8b0e2b;
          border-radius: 8px;
          padding: 20px 28px;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.65;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          margin: 0 0 32px;
        }
        .dt-infobox a {
          color: #ffcf02;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,207,2,0.4);
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .dt-infobox a:hover { border-bottom-color: #ffffff; color: #ffffff; }
        .dt-infobox strong {
          color: #ffcf02;
          font-family: 'Roboto Slab', serif;
        }
      `}</style>
      <Box style={{ background: DARK, minHeight: '100vh' }}>

        {/* Hero — eyebrow → nadpis → jedna úderná věta; hover na nadpis
            "probarví" profilovou hlavu vpravo (sibling-selector, beze JS) */}
        <div className="dt-hero">
          <div className="dt-hero-content">
            <div className="dt-tag">
              Speciál
            </div>
            <h1 className="dt-hero-title">Data pro budoucí premiérku</h1>
            <p className="dt-hero-lead">
              Dvanáct klíčových výzev pro budoucí vedení státu, opřených o data a fakta
            </p>
          </div>
          <div className="dt-hero-visual">
            <div className="dt-hero-profile">
              <ProfileHead />
            </div>
          </div>
        </div>

        {/* Kapitoly + Infobox — stejný Container pro přesné zarovnání */}
        <Container size="lg" py={44} px="md">
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
            {CHAPTERS.map(ch => (
              <ChapterTile key={ch.n} chapter={ch} />
            ))}
          </SimpleGrid>

          {/* Infobox */}
          <div className="dt-infobox" style={{ marginTop: 32 }}>
          <strong>O speciálu Data pro budoucí premiérku:</strong>{' '}
          Dlouhodobý projekt dvojice datových novinářů a analytiků{' '}
          <a href="https://www.mahdalova-skop.cz" target="_blank" rel="noopener noreferrer">Kateřina Mahdalová &amp; Michal Škop</a>,
          {' '}který mapuje stav věcí v klíčových tematických blocích.
          Projekt vzniká s grantovou podporou{' '}
          <a href="https://www.nfnz.cz" target="_blank" rel="noopener noreferrer">Nadačního fondu nezávislé žurnalistiky</a>
          {' '}a stojí na originálních datových analýzách a vlastním zpracování velkého množství zdrojů.
          </div>
        </Container>

        <SupportBanner />
      </Box>
    </Container>
  );
}

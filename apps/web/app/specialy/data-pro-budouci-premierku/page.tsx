// app/specialy/data-pro-budouci-premierku/page.tsx
import { Container, Title, Text, Box, SimpleGrid } from '@mantine/core';
import type { Metadata } from 'next';
import SupportBanner from '@/components/common/SupportBanner';

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

// Hero head silhouette
const SIL_PATH = "M4505 7963 c-130 -6 -403 -34 -524 -53 -875 -143 -1458 -484 -1863 -1090 -346 -518 -477 -1123 -368 -1705 43 -227 39 -248 -73 -460 -80 -152 -188 -320 -354 -551 -209 -292 -206 -335 33 -435 232 -98 281 -180 198 -336 -79 -149 -63 -208 69 -257 80 -30 86 -62 22 -137 -73 -85 -67 -119 34 -223 97 -99 125 -156 153 -308 35 -198 89 -290 200 -339 72 -32 227 -32 338 0 487 140 868 94 1071 -127 132 -144 194 -445 149 -727 -30 -196 -25 -214 37 -117 392 610 481 1639 233 2680 -56 232 -151 553 -257 860 -212 618 -252 809 -240 1147 28 809 505 1251 1512 1400 322 47 693 35 950 -31 455 -117 664 -411 601 -843 -23 -155 -12 -163 42 -31 99 245 86 520 -34 708 -290 453 -1118 597 -2214 386 -102 -19 -277 -55 -390 -79 -274 -57 -296 -60 -326 -40 -95 62 112 247 407 364 466 185 1039 256 1523 190 135 -18 160 -18 140 0 -28 27 -336 105 -494 125 -129 16 -422 37 -475 34 -16 -1 -61 -3 -100 -5z";
const SIL_T = "translate(-117.098299,796.836783) scale(0.100000,-0.100000)";
// Hero head: logo-dpbp(42) — silueta #ff1a4a, kroužky pestrobarevná paleta
const HERO_DOTS: [number, number, number, string][] = [
  [358.4,156.6,40.6,'#ff3f30'],[412.8,347.0,35.3,'#ff7f2a'],[340.9,512.7,24.7,'#5fcce6'],
  [280.6,220.0,24.7,'#4a51ab'],[379.8,253.5,21.2,'#ff7e6e'],[311.7,364.6,17.6,'#5e66d5'],
  [537.3,304.7,17.6,'#efb704'],[313.7,292.3,17.6,'#7997e1'],[449.8,213.0,17.6,'#efb704'],
  [358.4,435.1,15.9,'#6493d4'],[471.2,424.6,12.3,'#ff5c4a'],[525.6,361.1,12.3,'#ff7f2a'],
  [469.2,280.0,12.3,'#ff934d'],[457.6,138.9,12.3,'#ffdc33'],[412.8,488.0,8.8,'#ff934d'],
  [539.2,234.1,8.8,'#ffe680'],
];

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

// 02 Demografie — populační pyramida
const G_DEMO = <>
  <g fill="#f76800">
    <circle cx={92.5} cy={70} r={4.5}/>
    <circle cx={92.5} cy={85} r={4.5}/><circle cx={77.5} cy={85} r={4.5}/>
    <circle cx={92.5} cy={100} r={4.5}/><circle cx={77.5} cy={100} r={4.5}/><circle cx={62.5} cy={100} r={4.5}/>
    <circle cx={92.5} cy={115} r={4.5}/><circle cx={77.5} cy={115} r={4.5}/><circle cx={62.5} cy={115} r={4.5}/><circle cx={47.5} cy={115} r={4.5}/>
    <circle cx={92.5} cy={130} r={4.5}/><circle cx={77.5} cy={130} r={4.5}/><circle cx={62.5} cy={130} r={4.5}/><circle cx={47.5} cy={130} r={4.5}/><circle cx={32.5} cy={130} r={4.5}/>
    <circle cx={92.5} cy={145} r={4.5}/><circle cx={77.5} cy={145} r={4.5}/><circle cx={62.5} cy={145} r={4.5}/><circle cx={47.5} cy={145} r={4.5}/><circle cx={32.5} cy={145} r={4.5}/><circle cx={17.5} cy={145} r={4.5}/>
  </g>
  <g fill="#de1743">
    <circle cx={107.5} cy={70} r={4.5}/>
    <circle cx={107.5} cy={85} r={4.5}/><circle cx={122.5} cy={85} r={4.5}/>
    <circle cx={107.5} cy={100} r={4.5}/><circle cx={122.5} cy={100} r={4.5}/><circle cx={137.5} cy={100} r={4.5}/>
    <circle cx={107.5} cy={115} r={4.5}/><circle cx={122.5} cy={115} r={4.5}/><circle cx={137.5} cy={115} r={4.5}/><circle cx={152.5} cy={115} r={4.5}/>
    <circle cx={107.5} cy={130} r={4.5}/><circle cx={122.5} cy={130} r={4.5}/><circle cx={137.5} cy={130} r={4.5}/><circle cx={152.5} cy={130} r={4.5}/><circle cx={167.5} cy={130} r={4.5}/>
    <circle cx={107.5} cy={145} r={4.5}/><circle cx={122.5} cy={145} r={4.5}/><circle cx={137.5} cy={145} r={4.5}/><circle cx={152.5} cy={145} r={4.5}/><circle cx={167.5} cy={145} r={4.5}/><circle cx={182.5} cy={145} r={4.5}/>
  </g>
  <g fill="rgba(255,255,255,0.1)">
    <circle cx={92.5} cy={160} r={4.5}/><circle cx={77.5} cy={160} r={4.5}/><circle cx={62.5} cy={160} r={4.5}/><circle cx={47.5} cy={160} r={4.5}/><circle cx={32.5} cy={160} r={4.5}/><circle cx={17.5} cy={160} r={4.5}/>
    <circle cx={107.5} cy={160} r={4.5}/><circle cx={122.5} cy={160} r={4.5}/><circle cx={137.5} cy={160} r={4.5}/><circle cx={152.5} cy={160} r={4.5}/><circle cx={167.5} cy={160} r={4.5}/><circle cx={182.5} cy={160} r={4.5}/>
  </g>
</>;

// 03 Zdravotnictví a péče — zdvojené H
const G03 = <>
  <g fill="#5e66d5">
    <circle cx={55} cy={40} r={4.5}/><circle cx={70} cy={40} r={4.5}/>
    <circle cx={55} cy={55} r={4.5}/><circle cx={70} cy={55} r={4.5}/>
    <circle cx={55} cy={70} r={4.5}/><circle cx={70} cy={70} r={4.5}/>
    <circle cx={55} cy={85} r={4.5}/><circle cx={70} cy={85} r={4.5}/>
    <circle cx={55} cy={100} r={4.5}/><circle cx={70} cy={100} r={4.5}/>
    <circle cx={55} cy={115} r={4.5}/><circle cx={70} cy={115} r={4.5}/>
    <circle cx={55} cy={130} r={4.5}/><circle cx={70} cy={130} r={4.5}/>
    <circle cx={55} cy={145} r={4.5}/><circle cx={70} cy={145} r={4.5}/>
    <circle cx={55} cy={160} r={4.5}/><circle cx={70} cy={160} r={4.5}/>
    <circle cx={130} cy={40} r={4.5}/><circle cx={145} cy={40} r={4.5}/>
    <circle cx={130} cy={55} r={4.5}/><circle cx={145} cy={55} r={4.5}/>
    <circle cx={130} cy={70} r={4.5}/><circle cx={145} cy={70} r={4.5}/>
    <circle cx={130} cy={85} r={4.5}/><circle cx={145} cy={85} r={4.5}/>
    <circle cx={130} cy={100} r={4.5}/><circle cx={145} cy={100} r={4.5}/>
    <circle cx={130} cy={115} r={4.5}/><circle cx={145} cy={115} r={4.5}/>
    <circle cx={130} cy={130} r={4.5}/><circle cx={145} cy={130} r={4.5}/>
    <circle cx={130} cy={145} r={4.5}/><circle cx={145} cy={145} r={4.5}/>
    <circle cx={130} cy={160} r={4.5}/><circle cx={145} cy={160} r={4.5}/>
    <circle cx={85} cy={85} r={4.5}/><circle cx={100} cy={85} r={4.5}/><circle cx={115} cy={85} r={4.5}/>
    <circle cx={85} cy={100} r={4.5}/><circle cx={100} cy={100} r={4.5}/><circle cx={115} cy={100} r={4.5}/>
    <circle cx={85} cy={115} r={4.5}/><circle cx={100} cy={115} r={4.5}/><circle cx={115} cy={115} r={4.5}/>
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
  {n:'01',title:'Energie a bezpečnost',href:'#',available:false,dots:D01,accent:'#ffcf02',customSvg:G01},
  {n:'02',title:'Demografie',href:'/specialy/data-pro-budouci-premierku-01-demografie',available:true,dots:D01,accent:'#f76800',customSvg:G_DEMO},
  {n:'03',title:'Zdravotnictví a péče',href:'#',available:false,dots:D03,accent:'#5e66d5',customSvg:G03},
  {n:'04',title:'Klimatická změna',href:'#',available:false,dots:D04,accent:'#de1743',customSvg:G04},
  {n:'05',title:'Bezpečnost a konflikty',href:'#',available:false,dots:D05,accent:'#efb704',customSvg:G08},
  {n:'06',title:'AI a trh práce',href:'#',available:false,dots:D06,accent:'#ffcf02',customSvg:G06},
  {n:'07',title:'Oligarchizace a korupce',href:'#',available:false,dots:D07,accent:'#ffcf02',customSvg:G07},
  {n:'08',title:'Nedostupnost bydlení',href:'#',available:false,dots:D05,accent:'#de1743',customSvg:G05},
  {n:'09',title:'Ekonomická nerovnost',href:'#',available:false,dots:D09,accent:'#efb704',customSvg:G09},
  {n:'10',title:'Digitalizace a inovace',href:'#',available:false,dots:D10,accent:'#5e66d5',customSvg:G10},
  {n:'11',title:'Úroveň vzdělávání',href:'#',available:false,dots:D02,accent:'#5e66d5',customSvg:G02},
  {n:'12',title:'Informační manipulace',href:'#',available:false,dots:D12,accent:'#de1743',customSvg:G12},
];

const DARK = '#101432';
const CRIMSON = '#de1743';
const FONT = "'Roboto Slab', Georgia, serif";
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
      {/* Abstract dot composition / ISOTYPE piktogram */}
      <div style={{ flex: '1 1 0', padding: '8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {chapter.customSvg ? (
          <svg viewBox="-10 -10 220 220" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', maxWidth: 200, height: 'auto', display: 'block', margin: '0 auto' }}
            aria-hidden>
            {chapter.customSvg}
          </svg>
        ) : (
          <svg viewBox="0 0 280 165" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            aria-hidden>
            {chapter.dots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
            ))}
          </svg>
        )}
      </div>

      {/* Accent line — chapter color */}
      <div style={{ height: 2, background: '#ff3f30', margin: '0 16px', opacity: 0.7 }} />

      {/* Info area */}
      <div style={{ padding: '10px 16px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Large italic chapter number */}
        <div className="ch-card-number" style={{
          fontSize: 'clamp(38px, 3.5vw, 52px)',
          fontWeight: 800,
          fontStyle: 'italic',
          fontFamily: FONT,
          color: CRIMSON,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          marginBottom: 8,
        }}>
          {chapter.n}
        </div>
        <div style={{
          fontSize: 'clamp(14px, 1.2vw, 18px)',
          fontWeight: 500,
          fontFamily: FONT,
          color: '#ffffff',
          lineHeight: 1.35,
          letterSpacing: '0.01em',
          marginBottom: 12,
        }}>
          {chapter.title}
        </div>
        <div>
          <span style={{
            fontSize: 13, fontWeight: 500,
            fontFamily: "'Roboto Slab', Georgia, serif",
            color: chapter.available ? chapter.accent : 'rgba(255,255,255,0.4)',
          }}>
            Číst kapitolu →
          </span>
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
            align-items: flex-start;
          }
        }
        .dt-hero-content {
          flex: 1;
          max-width: 750px;
        }
        .dt-tag {
          font-size: clamp(15px, 1.5vw, 18px);
          font-weight: 400;
          letter-spacing: 0em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
          font-family: 'Roboto Slab', Georgia, serif;
          text-align: center;
        }
        .dt-hero-title {
          font-family: 'Roboto Slab', Georgia, serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 2.2vw, 2rem);
          white-space: nowrap;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 20px 0;
        }
        .dt-hero-lead {
          font-size: clamp(15px, 1.5vw, 18px);
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          line-height: 1.75;
          font-family: 'Roboto Slab', Georgia, serif;
          margin: 0;
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
          margin: 0 24px 32px;
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

        {/* Hero */}
        <div className="dt-hero">
          <div className="dt-hero-content">
            <h1 className="dt-hero-title">Data pro budoucí premiérku</h1>
            <p className="dt-hero-lead">
              Dvanáct klíčových výzev pro nové vedení státu. Nechceme plané politické sliby,
              chceme návrhy opřené o data a fakta. Jaká je skutečná kondice Česka –
              a co s ní může politika reálně udělat?
            </p>
            <div className="dt-tag" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6em' }}>
              <span>Speciál</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block', flexShrink: 0 }}/>
              <span>DataTimes.cz</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block', flexShrink: 0 }}/>
              <span>Mahdalová &amp; Škop</span>
            </div>
          </div>
          <div className="dt-hero-visual">
            <div className="dt-hero-profile">
              <svg viewBox="-8 -8 716 716" xmlns="http://www.w3.org/2000/svg" aria-hidden overflow="visible">
                <defs>
                  <clipPath id="sil-hero" clipPathUnits="userSpaceOnUse">
                    <path transform={SIL_T} d={SIL_PATH} />
                  </clipPath>
                </defs>
                <g clipPath="url(#sil-hero)">
                  <rect x="0" y="0" width="700" height="700" fill="#ff1a4a" />
                </g>
                <path transform={SIL_T} d={SIL_PATH} fill="none" stroke="#ff1a4a" strokeWidth={80} />
                {HERO_DOTS.map(([cx,cy,r,fill],i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill={fill} stroke={fill} strokeWidth={8} />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Kapitoly */}
        <Container size="lg" py={44} px="md">
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
            {CHAPTERS.map(ch => (
              <ChapterTile key={ch.n} chapter={ch} />
            ))}
          </SimpleGrid>
        </Container>

        {/* Infobox */}
        <div className="dt-infobox">
          <strong>O speciálu Data pro budoucí premiérku:</strong>{' '}
          Dlouhodobý projekt dvojice datových novinářů a analytiků{' '}
          <a href="https://www.mahdalova-skop.cz" target="_blank" rel="noopener noreferrer">Kateřina Mahdalová &amp; Michal Škop</a>,
          {' '}který mapuje stav věcí v klíčových tematických blocích.
          Projekt vzniká s grantovou podporou{' '}
          <a href="https://www.nfnz.cz" target="_blank" rel="noopener noreferrer">Nadačního fondu nezávislé žurnalistiky</a>
          {' '}a stojí na originálních datových analýzách a vlastním zpracování velkého množství zdrojů.
        </div>

        <SupportBanner />
      </Box>
    </Container>
  );
}

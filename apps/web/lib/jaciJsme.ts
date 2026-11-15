// Speciál „Jací jsme byli, jací jsme – 1989 × 2026“: mapování kapitol na zdrojové složky článků.
// Jediný zdroj pravdy je app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/kapitoly.json.
import fs from 'fs';
import path from 'path';
import data from '@/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/kapitoly.json';

export type Kapitola = { kapitola: string; zdroj: string; nazev: string };

export const JACI_JSME = data as { slug: string; nazev: string; podtitul: string; kapitoly: Kapitola[] };
export const JACI_JSME_PATH = `/specialy/${JACI_JSME.slug}`;
// Cover speciálu (schválen 15. 11. 2026): app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline, soubory na CDN.
const CDN = 'https://media.datatimes.org/datatimes-cz/articles/2026/11/jaci-jsme-byli-jaci-jsme-1989-2026';
export const JACI_JSME_OG = `${CDN}/cover-og.jpg`;
export const JACI_JSME_COVER = `${CDN}/cover-homepage.png`;
export const JACI_JSME_DLAZDICE = `${CDN}/dlazdice-v2.png`;

const ARTICLES_DIR = path.join(process.cwd(), 'app/clanek/_articles');

/** Kapitoly, jejichž zdrojový článek už existuje (index.md). */
export function hotoveKapitoly(): Kapitola[] {
  return JACI_JSME.kapitoly.filter((k) => fs.existsSync(path.join(ARTICLES_DIR, k.zdroj, 'index.md')));
}

/** Zdrojové složky článků, které mají kanonickou adresu ve speciálu (ne /clanek/). */
export const JACI_JSME_ZDROJE = JACI_JSME.kapitoly.map((k) => k.zdroj);

/** Veřejná adresa kapitoly podle zdrojové složky. */
export const JACI_JSME_HREF: Record<string, string> = Object.fromEntries(
  JACI_JSME.kapitoly.map((k) => [k.zdroj, `${JACI_JSME_PATH}/${k.kapitola}`])
);

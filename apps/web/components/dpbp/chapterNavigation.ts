import dpbpChapters from './dpbpChapters.json';

export const DPBP_HOME = '/specialy/data-pro-budouci-premierku';

export interface DpbpChapterNavItem {
  id: string;
  slug: string;
  shortTitle: string;
  title: string;
  accent: string;
}

// Data i barvy pocházejí z jediného zdroje – dpbpChapters.json. Nikde v kódu
// (ani v landing page, ani v _meta.json) se hex neopakuje ani neupravuje.
export const DPBP_CHAPTERS: DpbpChapterNavItem[] = dpbpChapters.chapters;

export function chapterHref(slug: string) {
  return `${DPBP_HOME}/${slug}`;
}

// Barva kapitoly patří výhradně sem. Nikde jinde – ani v _meta.json, ani
// v dlaždicích landing page – se hexadecimální hodnoty neopakují a neupravují.
export function chapterAccent(slug: string): string {
  const chapter = DPBP_CHAPTERS.find(c => c.slug === slug);
  if (!chapter) throw new Error(`Neznámá kapitola DPBP: ${slug}`);
  return chapter.accent;
}

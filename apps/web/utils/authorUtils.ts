// utils/authorUtils.ts
export function normalizeAuthor(author: string): string {
  return author
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitAuthors(author: unknown): string[] {
  if (!author) return [];

  if (Array.isArray(author)) {
    return author
      .filter((a): a is string => typeof a === 'string')
      .map((a) => a.trim())
      .filter(Boolean);
  }

  if (typeof author === 'string') {
    return author
      .split(/,|&|\s+and\s+|\s+a\s+/i)
      .map((a) => a.trim())
      .filter(Boolean);
  }

  return [];
}

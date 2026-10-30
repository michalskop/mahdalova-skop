/**
 * Date on article cards and in related-article boxes.
 * Czech keeps the compact numeric form („30. 10. 2026"); other locales get the
 * written-out month, e.g. en-GB → "30 October 2026" (numeric "30/10/2026" reads
 * ambiguously for an international audience).
 */
export function formatCardDate(date: string | number | Date, locale: string = 'cs-CZ'): string {
  const d = new Date(date);
  if (locale.toLowerCase().startsWith('cs')) return d.toLocaleDateString(locale);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

// app/nahled/page.tsx
// Náhled konceptu pro hub (hub.datatimes.cz): hub stránku vloží jako iframe a pošle jí text článku.
// Vykreslí ho stejný kód jako publikovaný článek (lib/articleData.ts + ArticleRenderer), takže v hubu
// je vidět přesně to, co vyjde. Na webu se nic neukládá; bez zprávy z hubu je stránka prázdná.
import type { Metadata } from 'next';
import { getArticles } from '@/components/common/getArticles';
import NahledKonceptu from '@/components/clanek/NahledKonceptu';

export const metadata: Metadata = {
  title: 'Náhled konceptu',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function NahledPage() {
  // Pool pro RelatedArticles se zapeče při stavbě webu – stejný jako u publikovaných článků.
  const pool = await getArticles(9999, undefined, true);
  return <NahledKonceptu pool={pool} />;
}

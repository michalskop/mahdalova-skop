import { permanentRedirect } from 'next/navigation';

// Speciál KVIFF/Vary je od druhého kola revize jedna souvislá stránka
// (/specialy/kviff). Bývalé podstránky teď jen trvale přesměrovávají
// na odpovídající kotvu na hlavní stránce.
const redirects: Record<string, string> = {
  historie: '/specialy/kviff#historie',
  'historie-festivalu-v-datech': '/specialy/kviff#historie',
  oceneni: '/specialy/kviff#oceneni',
  'crystal-globe': '/specialy/kviff#oceneni',
  'hoste-a-prestiz': '/specialy/kviff#oceneni',
  'oceneni-v-datech': '/specialy/kviff#oceneni',
  'filmy-a-svet': '/specialy/kviff#filmy-a-svet',
  'mapa-filmu': '/specialy/kviff#filmy-a-svet',
  'temata-filmu': '/specialy/kviff#filmy-a-svet',
  'festival-a-penize': '/specialy/kviff#festival-a-penize',
  'ekonomika-pozornosti': '/specialy/kviff#festival-a-penize',
  'trzby-filmu': '/specialy/kviff#festival-a-penize',
};

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return Object.keys(redirects).map((slug) => ({ slug }));
}

export default function KviffBranchRedirectPage({ params }: PageProps) {
  const target = redirects[params.slug] ?? '/specialy/kviff';
  permanentRedirect(target);
}

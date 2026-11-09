'use client';
import { usePathname } from 'next/navigation';
import { MatomoAnalytics as _MatomoAnalytics } from '@repo/ui/components/MatomoAnalytics';

export function MatomoAnalytics() {
  // Náhled konceptu z hubu (/nahled/) není čtení článku – do statistik nepatří.
  const pathname = usePathname();
  if (pathname?.startsWith('/nahled')) return null;
  return <_MatomoAnalytics siteId="2" />;
}

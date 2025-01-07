// components/MatomoAnalytics.tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// Add TypeScript declaration for window._paq
declare global {
  interface Window {
    _paq: any[];
  }
}

function MatomoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initial tracking script setup
    window._paq = window._paq || [];
    window._paq.push(['enableLinkTracking']);
    
    const u = "//matomo.kohovolit.eu/";
    window._paq.push(['setTrackerUrl', u + 'matomo.php']);
    window._paq.push(['setSiteId', '5']);

    // Load Matomo script only once
    if (!document.getElementById('matomo-script')) {
      const d = document;
      const g = d.createElement('script');
      g.id = 'matomo-script';
      g.async = true;
      g.src = u + 'matomo.js';
      const s = d.getElementsByTagName('script')[0];
      s.parentNode?.insertBefore(g, s);
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    window._paq.push(['setCustomUrl', fullPath]);
    window._paq.push(['setDocumentTitle', document.title]);
    window._paq.push(['trackPageView']);
  }, [pathname, searchParams]);

  return null;
}

export function MatomoAnalytics() {
  return (
    <Suspense fallback={null}>
      <MatomoTracker />
    </Suspense>
  );
}
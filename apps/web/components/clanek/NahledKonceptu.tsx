// components/clanek/NahledKonceptu.tsx
'use client';

// Náhled konceptu pro hub. Hub tuhle stránku (/nahled/) vloží jako iframe a pošle zprávu
//   { type: 'dt-nahled', text, slug, folder, mode: 'clanek' | 'blok' }
// – text = celý index.md (s frontmatterem), nebo jeden blok z editoru; folder = složka článku s daty (URL).
// Stránka text zpracuje stejným kódem jako stavba webu (lib/articleData.ts) a vykreslí ho jako publikovaný
// článek (app/clanek/[slug]/page.tsx). Zprávy bere jen od hubu; zpátky posílá „ready“ a výšku obsahu.

import { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import { Box, Container, Text } from '@mantine/core';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { TagList } from '@/components/common/TagList';
import { FollowBar } from '@/components/common/FollowBar';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import ArticleRating from '@/components/common/ArticleRating';
import { ARTICLE_MDX_OPTIONS, loadArticleData, rankRelatedPool } from '@/lib/articleData';
import type { Article } from '@repo/ui/lib/getArticles';

// Odkud smí přijít text konceptu (hub a jeho lokální běh přes wrangler).
const HUB_ORIGINS = ['https://hub.datatimes.cz', 'http://localhost:8788', 'http://127.0.0.1:8788'];
// Odkud smí náhled číst data konceptu: repo webu na GitHubu (hub tam data konceptu nahrává) a web sám.
const DATA_ORIGINS = ['https://raw.githubusercontent.com'];

interface Zprava {
  type: 'dt-nahled';
  text: string;
  slug: string;
  folder?: string | null;
  mode?: 'clanek' | 'blok';
}

interface Vysledek {
  mode: 'clanek' | 'blok';
  slug: string;
  fm: Record<string, any>;
  mdxSource: MDXRemoteSerializeResult;
  scrollyContent: any;
  htmlContent: string | null;
}

function splitFrontmatter(text: string): { fm: Record<string, any>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { fm: {}, body: text };
  const fm = (yaml.load(m[1]) as Record<string, any>) || {};
  return { fm, body: text.slice(m[0].length) };
}

function makeReader(slug: string, folder?: string | null) {
  const bases: string[] = [];
  if (folder) {
    try {
      const u = new URL(folder);
      if (DATA_ORIGINS.includes(u.origin) || u.origin === location.origin) bases.push(u.href.endsWith('/') ? u.href : `${u.href}/`);
    } catch { /* neplatná adresa složky – zůstane jen web */ }
  }
  // Na webu leží obrázky a JSON z kořene složky článku (scripts/copyImages.js).
  bases.push(`${location.origin}/clanek/_articles/${encodeURIComponent(slug)}/`);
  return async (rel: string): Promise<string | null> => {
    if (/^[a-z]+:|^\/|\.\.|\\/i.test(rel)) return null; // jen soubory uvnitř složky článku
    for (const base of bases) {
      try {
        const r = await fetch(new URL(rel, base).href, { cache: 'no-store' });
        if (r.ok) return await r.text();
      } catch { /* zkusit další zdroj */ }
    }
    return null;
  };
}

const BLOK_CSS = `
  html[data-nahled="blok"] .mantine-AppShell-header,
  html[data-nahled="blok"] .mantine-AppShell-main > :not([data-nahled-obsah]) { display: none !important; }
  html[data-nahled="blok"] .mantine-AppShell-main { padding-top: 0 !important; min-height: 0 !important; }
  html[data-nahled="blok"] body { background: transparent !important; }
`;

export default function NahledKonceptu({ pool }: { pool: Article[] }) {
  const [vysledek, setVysledek] = useState<Vysledek | null>(null);
  const [chyba, setChyba] = useState<string | null>(null);
  const [cekam, setCekam] = useState(true);

  useEffect(() => {
    let hubOrigin: string | null = null;
    let poradi = 0;

    const onMessage = async (event: MessageEvent) => {
      if (!HUB_ORIGINS.includes(event.origin)) return;
      const z = event.data as Zprava;
      if (!z || z.type !== 'dt-nahled' || typeof z.text !== 'string' || typeof z.slug !== 'string') return;
      if (!/^[a-z0-9][a-z0-9-]*$/.test(z.slug)) return;
      hubOrigin = event.origin;
      const moje = ++poradi;
      const mode = z.mode === 'blok' ? 'blok' : 'clanek';
      document.documentElement.dataset.nahled = mode;
      setCekam(false);
      try {
        const { fm, body } = mode === 'clanek' ? splitFrontmatter(z.text) : { fm: {}, body: z.text };
        const { htmlContent, scrollyContent, scope } = await loadArticleData(body, fm, makeReader(z.slug, z.folder), z.slug);
        const { serialize } = await import('next-mdx-remote/serialize');
        const mdxSource = await serialize(body, {
          scope: { ...scope, relatedArticlesPool: rankRelatedPool(pool, z.slug, fm.tags || []) },
          mdxOptions: ARTICLE_MDX_OPTIONS,
        });
        if (moje !== poradi) return; // mezitím přišel novější text
        setChyba(null);
        setVysledek({ mode, slug: z.slug, fm, mdxSource, scrollyContent, htmlContent });
      } catch (e) {
        if (moje !== poradi) return;
        setChyba(e instanceof Error ? e.message : String(e));
      }
    };
    window.addEventListener('message', onMessage);

    // Výška obsahu pro hub (u bloků v editoru podle ní nastaví výšku rámečku).
    let last = 0;
    const report = () => {
      if (!hubOrigin) return;
      const obsah = document.querySelector('[data-nahled-obsah]');
      const height = Math.ceil(obsah ? obsah.getBoundingClientRect().bottom + window.scrollY : document.documentElement.scrollHeight);
      if (height !== last) {
        last = height;
        window.parent.postMessage({ type: 'dt-nahled-vyska', height }, hubOrigin);
      }
    };
    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    const mo = new MutationObserver(() => { const o = document.querySelector('[data-nahled-obsah]'); if (o) ro.observe(o); });
    mo.observe(document.body, { childList: true, subtree: true });

    // Ohlásit se hubu; cíl '*' je v pořádku, zpráva nic neobsahuje. Text pak přijímáme jen z HUB_ORIGINS.
    if (window.parent !== window) window.parent.postMessage({ type: 'dt-nahled-ready' }, '*');

    return () => {
      window.removeEventListener('message', onMessage);
      ro.disconnect();
      mo.disconnect();
    };
  }, [pool]);

  const css = <style>{BLOK_CSS}</style>;

  if (chyba) {
    return (
      <Container maw={800} py="xl" data-nahled-obsah>
        {css}
        <Text c="red.8" fw={600}>Koncept se nepodařilo vykreslit tak, jak vyjde na webu.</Text>
        <Text size="sm" mt="xs">{chyba}</Text>
        <Text size="sm" mt="xs" c="dimmed">Stejná chyba by zastavila i stavbu webu – opravte text nebo data článku.</Text>
      </Container>
    );
  }

  if (!vysledek) {
    return (
      <Container maw={800} py="xl" data-nahled-obsah>
        {css}
        <Text c="dimmed">{cekam ? 'Tady se ukazuje náhled konceptu z hubu.' : 'Vykresluji koncept…'}</Text>
      </Container>
    );
  }

  const { mode, slug, fm, mdxSource, scrollyContent, htmlContent } = vysledek;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';

  if (mode === 'blok') {
    return (
      <div data-nahled-obsah>
        {css}
        <ArticleRenderer mdxSource={mdxSource} slug={slug} scrollyContent={scrollyContent} withSupportBanner={false} />
      </div>
    );
  }

  // Stejné složení jako app/clanek/[slug]/page.tsx (bez JSON-LD a vyjížděcího newsletteru).
  return (
    <div data-nahled-obsah>
      {css}
      <ArticleRenderer
        mdxSource={mdxSource}
        scrollyContent={scrollyContent}
        htmlContent={htmlContent}
        title={fm.title || 'Untitled'}
        date={fm.date ? String(fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : fm.date) : ''}
        author={fm.author || 'Anonymous'}
        translator={fm.translator || ''}
        slug={slug}
        shareUrl={`${baseUrl}/clanek/${slug}`}
      />
      <Box my="lg">
        <TagList tags={fm.tags || []} />
      </Box>
      <Container size="md" maw="800px" w="100%" px={0} my="lg">
        <FollowBar />
      </Container>
      <Container size="md" bg="background.2" maw="800px" w="100%" p={0} m="0 auto">
        <ArticleRating />
      </Container>
      <Container size="md" bg="background.2" maw="800px" w="100%" p={0} m="0 auto">
        <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088' position='center' />
      </Container>
    </div>
  );
}

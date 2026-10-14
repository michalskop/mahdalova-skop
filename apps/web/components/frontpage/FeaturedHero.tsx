'use client';

import { Paper, Title, useMantineTheme } from '@mantine/core';
import { ArticleCard } from '@repo/ui/components/ArticleCard';
import { Arrow } from '@repo/ui/components/Arrow';
import type { Article } from '@repo/ui/lib/getArticles';
import { useEffect, useRef, type RefObject } from 'react';
import classes from './FeaturedHero.module.css';

const MAX_LEAD_LINES = 40;

/**
 * Lead vlevo a sloupec tří karet vpravo lícují dole: perex leadu (doplněný
 * o navazující text z těla článku, `leadText`) dostane tolik celých řádků,
 * aby lead byl co nejblíž výšce pravého sloupce (a nikdy vyšší) – v kartě
 * tak nezůstává prázdné místo pod krátkým perexem. Když ani bez perexu nestačí, roztáhnou se mezery mezi kartami
 * vpravo. Na mobilu (jeden sloupec) se nic nevyrovnává.
 */
function useEqualColumns(
  leadRef: RefObject<HTMLDivElement | null>,
  sideRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const leadEl = leadRef.current;
    const sideEl = sideRef.current;
    if (!leadEl || !sideEl) return;
    const card = leadEl.querySelector<HTMLElement>('.mantine-Card-root');
    const excerpt = card?.querySelector<HTMLElement>(':scope > p');
    if (!card || !excerpt) return;

    const setLines = (n: number) => {
      excerpt.style.setProperty('--text-line-clamp', String(n));
      excerpt.style.display = n === 0 ? 'none' : '';
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const apply = () => {
      // Výchozí stav pro měření: přirozené výšky obou sloupců.
      card.style.height = '';
      sideEl.style.minHeight = '';
      sideEl.style.justifyContent = '';
      const twoCols = getComputedStyle(leadEl.parentElement!).gridTemplateColumns.split(' ').length > 1;
      if (!twoCols) {
        setLines(4);
        return;
      }
      const target = sideEl.getBoundingClientRect().height;
      let n = MAX_LEAD_LINES;
      for (; n > 0; n--) {
        setLines(n);
        if (card.getBoundingClientRect().height <= target + 0.5) break;
      }
      if (n === 0) setLines(0);
      const leadH = card.getBoundingClientRect().height;
      if (leadH < target) {
        // Doplň zbytek pod perex (patička se drží dole), ať hrany sedí na pixel.
        card.style.height = `${target}px`;
      } else if (leadH > target) {
        sideEl.style.minHeight = `${leadH}px`;
        sideEl.style.justifyContent = 'space-between';
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(apply, 30);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(leadEl.parentElement!);
    // Pravý sloupec mění výšku i bez změny šířky celé mřížky (dočtené CSS,
    // zalomení textu) – sledujeme ho zvlášť.
    ro.observe(sideEl);
    window.addEventListener('resize', schedule);
    // Obrázky a webfonty mění výšky až po načtení.
    leadEl.parentElement!.querySelectorAll('img').forEach((img) => img.addEventListener('load', schedule));
    document.fonts?.ready.then(schedule);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [leadRef, sideRef]);
}

/**
 * Perex bočních karet vyplní jen místo, které vedle náhledu 5:4 zbude po
 * titulku a patičce (CSS mu dá `contain: size`, takže kartu nezvětšuje):
 * tady se dopočítá počet celých řádků, ať se poslední řádek neusekne v půlce.
 * Na úzkém telefonu (svislá karta, bez `contain`) se nic nemění.
 */
function useSideExcerptFit(sideRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const sideEl = sideRef.current;
    if (!sideEl) return;
    const excerpts = Array.from(sideEl.querySelectorAll<HTMLElement>('.mantine-Card-root > p'));
    const fit = () => {
      for (const p of excerpts) {
        const cs = getComputedStyle(p);
        if (!cs.contain.includes('size')) {
          p.style.removeProperty('--side-lines');
          p.style.visibility = '';
          continue;
        }
        const lh = parseFloat(cs.lineHeight);
        if (!lh) continue;
        const n = Math.floor((p.clientHeight + 1) / lh);
        p.style.setProperty('--side-lines', String(Math.max(n, 1)));
        p.style.visibility = n === 0 ? 'hidden' : '';
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    excerpts.forEach((p) => ro.observe(p));
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [sideRef]);
}

/**
 * Cover 5:4 (cover-homepage 1500×1200) se v bočních kartách nikdy neořízne:
 * když delší titulek kartu protáhne, náhled by se ořízl na střed a useknul
 * titulek coveru. Takovým náhledům hook nastaví `data-letterbox` a
 * `--cover-url` – CSS pak ukáže celý obrázek (contain) a místo nad a pod ním
 * vyplní rozmazanou kopií téhož coveru. Obrázky jiného poměru (starší fotky)
 * dál řídí coverFit v ArticleCard.
 */
function useSideCoverLetterbox(sideRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const sideEl = sideRef.current;
    if (!sideEl) return;
    const imgs = Array.from(
      sideEl.querySelectorAll<HTMLImageElement>('.mantine-Card-root > .mantine-Card-section img'),
    );
    const mark = (img: HTMLImageElement) => {
      const section = img.closest<HTMLElement>('.mantine-Card-section');
      if (!section || !img.naturalWidth || !img.naturalHeight) return;
      if (Math.abs(img.naturalWidth / img.naturalHeight - 5 / 4) > 0.02) return;
      section.dataset.letterbox = '';
      section.style.setProperty('--cover-url', `url("${img.currentSrc || img.src}")`);
    };
    const onLoad = (e: Event) => mark(e.currentTarget as HTMLImageElement);
    imgs.forEach((img) => {
      if (img.complete) mark(img);
      img.addEventListener('load', onLoad);
    });
    return () => imgs.forEach((img) => img.removeEventListener('load', onLoad));
  }, [sideRef]);
}

// Hero blok homepage (styl The Nerve): vlevo velký hlavní článek (cover +
// titulek + perex + autor), vpravo tři nejnovější jako kompaktní vodorovné
// karty a pod nimi tlačítko „Více". Celá šířka, žádný boční nadpis.
interface FeaturedHeroProps {
  articles: (Article & { leadText?: string })[];
  articleBasePath?: string;
  locale?: string;
  /** Barva pozadí bloku (token palety nebo hex). */
  themeColor?: string;
  /** Kam vede „Více" (výpis rubriky). */
  moreLink?: string;
  moreLabel?: string;
}

export function FeaturedHero({
  articles,
  articleBasePath,
  locale,
  themeColor = 'brand',
  moreLink = '/vyber',
  moreLabel = 'Více',
}: FeaturedHeroProps) {
  const theme = useMantineTheme();
  const light = theme.colors.background[0];
  const leadRef = useRef<HTMLDivElement | null>(null);
  const sideRef = useRef<HTMLDivElement | null>(null);
  useEqualColumns(leadRef, sideRef);
  useSideExcerptFit(sideRef);
  useSideCoverLetterbox(sideRef);
  const lead = articles[0];
  const side = articles.slice(1, 4);
  if (!lead) return null;

  return (
    <Paper bg={themeColor} radius={0} py={16} className={classes.block}>
      <div className={classes.grid}>
        <div ref={leadRef} className={classes.lead}>
          <ArticleCard
            {...lead}
            excerpt={lead.leadText ? `${lead.excerpt} ${lead.leadText}` : lead.excerpt}
            articleBasePath={articleBasePath}
            locale={locale}
          />
        </div>

        <div ref={sideRef} className={classes.side}>
          {side.map((article) => (
            <div key={article.slug} className={classes.sideItem}>
              {/* bylineFull: v bočních kartách je pro jméno samostatný řádek pod
                  datem, tak ukaž celé jméno (i u dvojice), ne zkrácené příjmení. */}
              <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} bylineFull />
            </div>
          ))}
        </div>
      </div>

      {/* „Více" jako původní nadpis rubriky „Výběr": velký sans nadpis +
          vlnovková šipka, u levého okraje celého bloku, odkaz na výpis rubriky.
          Obal s justify-content:flex-start drží odkaz vlevo bez ohledu na
          zděděný text-align rodiče. */}
      <div className={classes.moreRow}>
        <a className={classes.more} href={moreLink}>
          <Title order={2} c={light} className={classes.moreTitle}>
            {moreLabel}
            <Arrow size={80} color={light} />
          </Title>
        </a>
      </div>
    </Paper>
  );
}

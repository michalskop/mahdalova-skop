'use client';

/**
 * RouteTimeline fed by the same YAML as the classic Timeline (TimelineContent),
 * for articles: `<RouteTimeline yamlFile="timeline.yaml" />`.
 *
 * Each event becomes a card: date (eyebrow), title, optional thumb image,
 * description (HTML) or summary, optional link. Cards alternate sides.
 * Facets, year collapsing and the horizontal layout of the classic Timeline
 * are not used here.
 */

import type { TimelineContent, TimelineEvent } from '@/types/timeline';
import { fixCzechTypography } from '@/lib/remark-czech-typography';
import RouteTimeline, { RouteTimelineItem } from './RouteTimeline';
import styles from './RouteTimelineFromYaml.module.css';

type RouteTimelineFromYamlProps = {
  content: TimelineContent;
  slug?: string;
};

function assetPath(src: string, slug?: string) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
  return slug ? `/clanek/_articles/${slug}/${src}` : src;
}

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    .toLocaleDateString('cs-CZ', { timeZone: 'UTC' });
}

function EventCard({ event, slug }: { event: TimelineEvent; slug?: string }) {
  return (
    <>
      <span className={styles.date}>{formatDate(event.date)}</span>
      {event.thumb ? (
        <figure className={styles.figure}>
          <img
            className={styles.thumb}
            src={assetPath(event.thumb, slug)}
            alt={event.thumbAlt ?? ''}
            loading="lazy"
            style={event.thumbPosition ? { objectPosition: event.thumbPosition } : undefined}
          />
          {event.thumbCredit ? (
            <figcaption className={styles.credit} dangerouslySetInnerHTML={{ __html: event.thumbCredit }} />
          ) : null}
        </figure>
      ) : null}
      <h3>{fixCzechTypography(event.title)}</h3>
      {event.description ? (
        <p dangerouslySetInnerHTML={{ __html: fixCzechTypography(event.description) }} />
      ) : event.summary ? (
        <p>{fixCzechTypography(event.summary)}</p>
      ) : null}
      {event.link && event.linkText ? (
        <p>
          <a href={event.link} target="_blank" rel="noopener noreferrer">
            → {event.linkText}
          </a>
        </p>
      ) : null}
    </>
  );
}

export default function RouteTimelineFromYaml({ content, slug }: RouteTimelineFromYamlProps) {
  const items: RouteTimelineItem[] = (content.events || []).map((event, index) => ({
    id: event.id || `${event.date}-${index}`,
    side: index % 2 === 0 ? 'left' : 'right',
    content: <EventCard event={event} slug={slug} />,
  }));

  return (
    <section className={[styles.wrapper, content.theme ? styles[content.theme] : ''].filter(Boolean).join(' ')}>
      {content.title ? (
        <header className={styles.header}>
          <h2>{fixCzechTypography(content.title)}</h2>
          {content.subtitle ? <p>{fixCzechTypography(content.subtitle)}</p> : null}
        </header>
      ) : null}
      <RouteTimeline items={items} className={styles.timeline} style={{ marginBottom: 32 }} />
    </section>
  );
}

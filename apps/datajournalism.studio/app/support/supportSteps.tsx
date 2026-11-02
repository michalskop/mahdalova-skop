'use client';

/**
 * Ways to support DataTimes – one source for both places they appear:
 * the wavy timeline on /support (SupportScrolly) and the accordion at
 * the bottom of /about (SupportAccordion). English port of
 * apps/web/app/podporte-nas/supportSteps.tsx; all links are the same.
 */

import { ReactNode } from 'react';
import { FollowBar } from '@/components/common/FollowBar';
import styles from './SupportScrolly.module.css';

const GOOGLE_PREFERRED_SOURCE = 'https://www.google.com/preferences/source?q=mahdalova-skop.cz';

// Stripe Payment Links – the same three tiers as the "Support us" menu (SupportMenuButton).
const TIERS = [
  { label: 'Student', amount: 'CZK 29', url: 'https://buy.stripe.com/dRm9AU8U6dlOaEa1x93ks0b' },
  { label: 'Standard', amount: 'CZK 199', url: 'https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a', highlight: true },
  { label: 'Patron', amount: 'CZK 499', url: 'https://buy.stripe.com/eVq5kE9Ya3LebIea3F3ks0c' },
];

type Action = { label: string; href: string; external?: boolean; primary?: boolean };

export type SupportStep = {
  id: string;
  /** Short badge: how much it costs / how long it takes. */
  effort?: string;
  title: string;
  /** Centred title in ink blue (intro and the money card). */
  masthead?: boolean;
  paragraphs: string[];
  /** Bulleted list under the paragraphs. */
  list?: string[];
  actions?: Action[];
  extra?: ReactNode;
  side: 'left' | 'right';
};

/** The first step is the intro (no effort badge); the rest are the ways to help. */
export const supportSteps: SupportStep[] = [
  {
    id: 'intro',
    title: 'How you can support us',
    masthead: true,
    paragraphs: [
      'Independent data journalism cannot be sustained by money alone. It is sustained by the people who read it, pass it on and tell us when they come across something that ought to come to light.',
      'Follow the route down the page. Most stops are free and take a minute. Pick whatever suits you – even a single step helps.',
    ],
    side: 'left',
  },
  {
    id: 'share',
    effort: 'Free · 1 minute',
    title: 'Pass our articles on',
    paragraphs: [
      'Social-media algorithms favour shortcuts and emotions, not thorough work with data. Every share helps our stories reach the people we write them for.',
    ],
    list: [
      'local Facebook and WhatsApp groups, neighbourhood communities',
      'colleagues at work, friends, parents at school',
      'associations, libraries and schools that can pass them on',
    ],
    actions: [{ label: 'Pick an article to share', href: '/' }],
    side: 'right',
  },
  {
    id: 'google',
    effort: 'Free · 10 seconds',
    title: 'Make us a preferred source on Google',
    paragraphs: [
      'Google lets you choose your preferred news sources. Add DataTimes.cz to them and you will see our articles higher up and more often in search results. It takes a single click on a tick box.',
    ],
    actions: [
      { label: 'Add DataTimes.cz to your Google sources', href: GOOGLE_PREFERRED_SOURCE, external: true, primary: true },
    ],
    side: 'left',
  },
  {
    id: 'subscribe',
    effort: 'Free · email',
    title: 'Subscribe to our newsletter',
    paragraphs: [
      'New analyses and data stories land straight in your inbox – with no algorithm deciding what you get to see. You will find the sign-up form right on this page.',
    ],
    actions: [{ label: 'Sign up for the newsletter', href: '#newsletter' }],
    side: 'right',
  },
  {
    id: 'follow',
    effort: 'Free',
    title: 'Follow us',
    paragraphs: [
      'A podcast, videos, a WhatsApp channel and discussions on Discord. Choose where you want to keep us close at hand.',
    ],
    extra: (
      <div className={styles.follow}>
        <FollowBar />
      </div>
    ),
    side: 'left',
  },
  {
    id: 'tip',
    effort: 'Your eyes and ears',
    title: 'Tip us off about data and topics',
    paragraphs: [
      'Have you come across interesting data, an odd figure in your municipal budget, an official decision that makes no sense, or a topic nobody is talking about? Write to us. We check every tip against the sources and dig out the context.',
    ],
    actions: [{ label: 'Newsroom contacts', href: '/about#contacts' }],
    side: 'right',
  },
  {
    id: 'calculator',
    effort: 'Volunteers before elections',
    title: 'Help with the Voting Advice Application',
    paragraphs: [
      'Ahead of the 2026 municipal elections, we approached the parties standing in more than seventy towns and cities. But the Voting Advice Application (Volební kalkulačka) only works if the parties respond – and if people hear about it.',
    ],
    list: [
      '<strong>Nudge the candidates.</strong> Do you know someone on a party list, or can you track down a contact? Remind them that they have not filled in the questionnaire yet. And if they decline to take part, let us know.',
      '<strong>Get the application out to people.</strong> Share it in local groups, communities and organisations in your town.',
    ],
    actions: [
      { label: 'Voting Advice Application', href: 'https://www.volebnikalkulacka.cz/', external: true },
      { label: 'I want to get involved', href: '/about#contacts' },
    ],
    side: 'left',
  },
  {
    id: 'projects',
    effort: 'Free',
    title: 'Use our data projects',
    paragraphs: [
      'Besides articles, we build tools that are publicly available. Use them, cite them and recommend them to others.',
    ],
    list: [
      '<a href="https://snemovna.datatimes.cz/" target="_blank" rel="noopener noreferrer"><strong>Sněmovna.DataTimes.cz</strong></a> – how Czech MPs vote, who rebels against their parliamentary group and who is absent',
      '<a href="https://mandaty.cz/" target="_blank" rel="noopener noreferrer"><strong>Mandáty.cz</strong></a> – the average of election polls, converted into seats',
      '<a href="https://www.volebnikalkulacka.cz/" target="_blank" rel="noopener noreferrer"><strong>Volební kalkulačka</strong></a> (Voting Advice Application) – which party you agree with most at elections',
    ],
    side: 'right',
  },
  {
    id: 'money',
    title: 'Support us financially',
    masthead: true,
    paragraphs: [
      'Our journalism stays free for everyone – no paywall and no login. But thorough work with data takes time and money. Regular support gives us the security to go in depth without having to keep an eye on advertisers or interest groups.',
    ],
    extra: (
      <div className={styles.tiers}>
        {TIERS.map((tier) => (
          <a
            key={tier.label}
            href={tier.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.tier} ${tier.highlight ? styles.tierHighlight : ''}`}
          >
            <span className={styles.tierLabel}>{tier.label}</span>
            <span className={styles.tierAmount}>{tier.amount}</span>
            <span className={styles.tierPeriod}>per month</span>
          </a>
        ))}
      </div>
    ),
    side: 'left',
  },
];

/** Everything under a step's title – shared by the timeline card and the accordion panel. */
export function StepBody({ step }: { step: SupportStep }) {
  return (
    <>
      {step.paragraphs.map((paragraph) => (
        <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
      ))}
      {step.list ? (
        <ul className={styles.list}>
          {step.list.map((item) => (
            <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      ) : null}
      {step.extra}
      {step.actions ? (
        <div className={styles.actions}>
          {step.actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`${styles.action} ${action.primary ? styles.actionPrimary : ''}`}
              {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {action.label} {action.external ? '↗' : '→'}
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}

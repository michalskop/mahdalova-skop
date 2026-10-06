'use client';

import { ReactNode } from 'react';
import RouteTimeline, { RouteTimelineItem } from '@/components/common/RouteTimeline/RouteTimeline';
import { FollowBar } from '@/components/common/FollowBar';
import aboutStyles from '../o-nas/AboutScrolly.module.css';
import styles from './SupportScrolly.module.css';

const GOOGLE_PREFERRED_SOURCE = 'https://www.google.com/preferences/source?q=mahdalova-skop.cz';

// Stripe Payment Links – the same three tiers as the header's „Podpořte nás" menu.
const TIERS = [
  { label: 'Student', amount: '29 Kč', url: 'https://buy.stripe.com/dRm9AU8U6dlOaEa1x93ks0b' },
  { label: 'Standard', amount: '199 Kč', url: 'https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a', highlight: true },
  { label: 'Patron', amount: '499 Kč', url: 'https://buy.stripe.com/eVq5kE9Ya3LebIea3F3ks0c' },
];

type Action = { label: string; href: string; external?: boolean; primary?: boolean };

type Step = {
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

const steps: Step[] = [
  {
    id: 'uvod',
    title: 'Jak nás můžete podpořit',
    masthead: true,
    paragraphs: [
      'Nezávislou datovou žurnalistiku neudrží jen peníze. Udrží ji lidé, kteří ji čtou, posílají dál a&nbsp;upozorní nás, když narazí na něco, co by mělo vyjít najevo.',
      'Projeďte si cestu dolů. Většina zastávek je zdarma a&nbsp;zabere minutu. Vyberte si, co vám sedí – i&nbsp;jediný krok nám pomůže.',
    ],
    side: 'left',
  },
  {
    id: 'sdilejte',
    effort: 'Zdarma · 1 minuta',
    title: 'Pošlete naše články dál',
    paragraphs: [
      'Algoritmy sociálních sítí přejí zkratkám a&nbsp;emocím, ne důkladné práci s&nbsp;daty. Každé sdílení pomáhá, aby naše texty našli lidé, pro které je píšeme.',
    ],
    list: [
      'místní facebookové a&nbsp;WhatsApp skupiny, sousedské komunity',
      'kolegové v&nbsp;práci, známí, rodiče ve škole',
      'spolky, knihovny a&nbsp;školy, které mohou sdílet dál',
    ],
    actions: [{ label: 'Vybrat článek ke sdílení', href: '/' }],
    side: 'right',
  },
  {
    id: 'google',
    effort: 'Zdarma · 10 vteřin',
    title: 'Nastavte si nás ve vyhledávači Google',
    paragraphs: [
      'Google umožňuje zvolit si preferované zdroje zpráv. Když mezi ně přidáte DataTimes.cz, uvidíte naše články ve výsledcích vyhledávání výš a&nbsp;častěji. Stačí jedno kliknutí na zaškrtávátko.',
    ],
    actions: [
      { label: 'Přidat DataTimes.cz do zdrojů Googlu', href: GOOGLE_PREFERRED_SOURCE, external: true, primary: true },
    ],
    side: 'left',
  },
  {
    id: 'newsletter',
    effort: 'Zdarma · e-mail',
    title: 'Odebírejte náš newsletter',
    paragraphs: [
      'Nové analýzy a&nbsp;datové příběhy vám přijdou rovnou do schránky – bez algoritmu, který by rozhodoval, co uvidíte. Přihlásit se můžete na konci této stránky.',
    ],
    actions: [{ label: 'Přihlásit se k newsletteru', href: '#newsletter' }],
    side: 'right',
  },
  {
    id: 'site',
    effort: 'Zdarma',
    title: 'Sledujte nás',
    paragraphs: [
      'Podcast, videa, kanál na WhatsAppu i&nbsp;diskuse na Discordu. Vyberte si, kde nás chcete mít po ruce.',
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
    effort: 'Vaše oči a uši',
    title: 'Upozorněte nás na data a témata',
    paragraphs: [
      'Narazili jste na zajímavá data, podivné číslo v&nbsp;rozpočtu obce, rozhodnutí úřadu, které nedává smysl, nebo téma, o&nbsp;kterém se mlčí? Napište nám. Každý podnět si ověříme ze zdrojů a&nbsp;dohledáme kontext.',
    ],
    actions: [{ label: 'Kontakty na redakci', href: '/o-nas#kontakty' }],
    side: 'right',
  },
  {
    id: 'kalkulacka',
    effort: 'Dobrovolníci před volbami',
    title: 'Pomozte s Volební kalkulačkou',
    paragraphs: [
      'Před komunálními volbami 2026 jsme oslovili kandidující strany ve více než sedmi desítkách měst. Kalkulačka ale funguje jen tehdy, když strany odpovědí – a&nbsp;když se o&nbsp;ní lidé dozvědí.',
    ],
    list: [
      '<strong>Připomeňte se kandidátům.</strong> Znáte někoho z&nbsp;kandidátky nebo dohledáte kontakt? Upozorněte je, že dotazník ještě nevyplnili. A&nbsp;když účast odmítnou, dejte nám vědět.',
      '<strong>Dostaňte kalkulačku mezi lidi.</strong> Pošlete ji do místních skupin, komunit a&nbsp;organizací ve svém městě.',
    ],
    actions: [
      { label: 'Volební kalkulačka', href: 'https://www.volebnikalkulacka.cz/', external: true },
      { label: 'Chci se zapojit', href: '/o-nas#kontakty' },
    ],
    side: 'left',
  },
  {
    id: 'projekty',
    effort: 'Zdarma',
    title: 'Používejte naše datové projekty',
    paragraphs: [
      'Kromě článků stavíme nástroje, které jsou veřejně k&nbsp;dispozici. Používejte je, citujte je a&nbsp;doporučujte je dál.',
    ],
    list: [
      '<a href="https://snemovna.datatimes.cz/" target="_blank" rel="noopener noreferrer"><strong>Sněmovna.DataTimes.cz</strong></a> – jak hlasují poslanci, kdo rebeluje proti svému klubu a&nbsp;kdo chybí',
      '<a href="https://mandaty.cz/" target="_blank" rel="noopener noreferrer"><strong>Mandáty.cz</strong></a> – průměr volebních průzkumů a&nbsp;přepočet na mandáty',
      '<a href="https://www.volebnikalkulacka.cz/" target="_blank" rel="noopener noreferrer"><strong>Volební kalkulačka</strong></a> – s&nbsp;kým se ve volbách nejvíc shodnete',
    ],
    side: 'right',
  },
  {
    id: 'penize',
    title: 'Podpořte nás finančně',
    masthead: true,
    paragraphs: [
      'Naše žurnalistika zůstává zdarma pro všechny, bez paywallu a&nbsp;bez přihlašování. Důkladná práce s&nbsp;daty ale stojí čas a&nbsp;peníze. Pravidelná podpora nám dává jistotu, že můžeme jít do hloubky a&nbsp;nemusíme se ohlížet na inzerenty ani zájmové skupiny.',
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
            <span className={styles.tierPeriod}>měsíčně</span>
          </a>
        ))}
      </div>
    ),
    side: 'left',
  },
];

function StepContent({ step }: { step: Step }) {
  return (
    <>
      {step.masthead ? (
        <div className={aboutStyles.bubbleMasthead}>
          <h3 className={aboutStyles.titleInk}>{step.title}</h3>
        </div>
      ) : (
        <>
          {step.effort ? <span className={styles.effort}>{step.effort}</span> : null}
          <h3>{step.title}</h3>
        </>
      )}
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

const items: RouteTimelineItem[] = steps.map((step) => ({
  id: step.id,
  side: step.side,
  content: (
    <div id={step.id} className={styles.anchor}>
      <StepContent step={step} />
    </div>
  ),
}));

/** The /podporte-nas route: ways to support DataTimes along the shared wavy line. */
export default function SupportScrolly() {
  return <RouteTimeline items={items} />;
}

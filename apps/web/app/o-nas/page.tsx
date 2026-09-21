import { Fragment } from 'react';
import type { Metadata } from 'next';
import { Anchor, Box, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ContactsBlock } from '@/components/common/ContactsBlock';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import AboutScrolly from './AboutScrolly';

const SUPPORT_URL = 'https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a';

export const metadata: Metadata = {
  title: 'O nás',
  description:
    'Kdo jsme, proč děláme datovou žurnalistiku a jaký konkrétní problém umíme řešit. Data. Kontext. Srozumitelnost. Odvaha.',
  alternates: { canonical: '/o-nas' },
  openGraph: {
    title: 'O nás — DataTimes / Mahdalová & Škop',
    description:
      'Kdo jsme, proč děláme datovou žurnalistiku a jaký konkrétní problém umíme řešit.',
    url: '/o-nas',
    type: 'website',
  },
};

function Kicker({ children, color = 'brand.6' }: { children: React.ReactNode; color?: string }) {
  return (
    <Text tt="uppercase" size="xs" fw={900} c={color} style={{ letterSpacing: '0.12em' }}>
      {children}
    </Text>
  );
}

const bigProblemStats = [
  { value: '54 %', label: 'bere zprávy ze sociálních sítí a videa (2026)' },
  { value: '51 %', label: 'přímo ze zpravodajských webů a aplikací — pokles z 63 % v roce 2021' },
  { value: '10 %', label: 'už bere zprávy od AI chatbotů — nárůst ze 7 %' },
];

const measures = [
  'Kolik zásadních informačních mezer jsme zaplnili.',
  'Kolik lidí jsme svými výstupy skutečně zasáhli — i mimo vlastní bublinu.',
  'Kolik lidí po přečtení tématu prokazatelně lépe rozumí.',
  'Kolikrát média, školy a instituce naše data převzaly nebo odcitovaly.',
  'Kolikrát byly naše grafy, mapy a databáze vloženy jinam.',
  'Jestli nás jako zdroj správně používají vyhledávače a jazykové modely.',
  'Kolik výstupů zůstává používaných i po půl roce nebo roce.',
];

export default function AboutPage() {
  return (
    <Container size="lg" bg="background.1" maw={1200} w="100%" p={0} m="0 auto">
      {/* Hero */}
      <Box component="header" bg="brand.9" c="background.0" px={{ base: 24, md: 64 }} py={{ base: 48, md: 88 }}>
        <Stack gap="lg" maw={860}>
          <Kicker color="brandYellow.5">DataTimes · Mahdalová &amp; Škop</Kicker>
          <Title order={1} style={{ fontSize: 'clamp(2.6rem, 7vw, 5.4rem)', lineHeight: 0.98 }}>
            O nás
          </Title>
          <Text size="xl" c="background.2" lh={1.55} maw={740}>
            Jsme dvojice novinářů a&nbsp;analytiků: Kateřina Mahdalová &amp; Michal Škop.
            Vyprávíme příběhy, které tvoříme z&nbsp;dat, hledáme kontext a&nbsp;na vlastní kůži
            jsme si už vyzkoušeli, že věrně popisovat skutečnost si leckdy žádá i&nbsp;kus
            odvahy (nás to stálo práci).
          </Text>
          <Text size="lg" c="background.2" lh={1.6} maw={740}>
            Hodně nám záleží na tom, aby naše práce odrážela realitu co nejvěrněji. Víme
            samozřejmě, že skutečnost je leckdy nepříjemná, ale to nás neodrazuje.
          </Text>
          <Text size="lg" fw={700} c="background.0" lh={1.6} maw={740}>
            Hledáme a&nbsp;poctivě zachycujeme. Nepřibarvujeme. Nepracujeme pro zájmové skupiny.
            A&nbsp;rozhodně se nebojíme.
          </Text>
          <Group gap="sm" mt="xs" align="center">
            {['Data', 'Kontext', 'Srozumitelnost', 'Odvaha'].map((word, index) => (
              <Fragment key={word}>
                {index > 0 && (
                  <Text
                    aria-hidden
                    span
                    c="brandYellow.5"
                    style={{ fontSize: 'clamp(0.8rem, 1.4vw, 1rem)', opacity: 0.65, lineHeight: 1 }}
                  >
                    •
                  </Text>
                )}
                <Text
                  span
                  fw={900}
                  c="brandYellow.5"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)' }}
                >
                  {word}
                </Text>
              </Fragment>
            ))}
          </Group>
        </Stack>
      </Box>

      {/* Flowing wave – who we are */}
      <Box px={{ base: 12, md: 40 }} pt={{ base: 40, md: 72 }}>
        <Stack gap="md" maw={820} m="0 auto" mb={{ base: 0, md: 8 }}>
          <Kicker>Kdo jsme</Kicker>
          <Title order={2} style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', lineHeight: 1.1 }}>
            Dva lidé, dvě desetiletí práce s daty a jedna kombinace, která tu chyběla
          </Title>
          <Text size="lg" c="dimmed" lh={1.6}>
            Projděte se křivkou dolů — postupně se rozsvítí, kdo jsme, co za sebou máme a proč to
            děláme.
          </Text>
        </Stack>
        <AboutScrolly />
      </Box>

      {/* Strategic framing – the problem X exercise from the meeting */}
      <Box component="section" bg="background.2" px={{ base: 20, md: 64 }} py={{ base: 52, md: 88 }}>
        <Stack gap="xl" maw={1000} m="0 auto">
          <Stack gap="md" maw={820}>
            <Kicker>Náš úkol</Kicker>
            <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4.4vw, 3rem)', lineHeight: 1.08 }}>
              Velký problém — a ten dílčí, který skutečně umíme řešit
            </Title>
            <Text size="xl" lh={1.6}>
              Nechceme slibovat, že zachráníme demokracii nebo porazíme dezinformace. Umíme ale
              pojmenovat menší, konkrétní problém, na který naše práce přímo dosáhne — a u kterého
              si za rok dokážeme změřit, jestli jsme ho posunuli.
            </Text>
          </Stack>

          {/* Two contrasting problems */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper p={{ base: 24, md: 32 }} radius={8} bg="brand.9" c="background.0">
              <Kicker color="brandYellow.5">Velký problém</Kicker>
              <Title order={3} size="1.35rem" mt="sm" mb="md" c="background.0">
                Lhát je levné. Říkat pravdu je drahé.
              </Title>
              <Text c="background.2" lh={1.6} mb="lg">
                Vyrábět a šířit neověřené informace, polopravdy a účelová PR sdělení je stonásobně
                levnější než dělat kvalitní žurnalistiku. Veřejný prostor válcují dezinformace,
                influenceři parazitující na novinařině a marketingové projekty — nesené algoritmy
                sociálních sítí a partikulárními zájmy.
              </Text>
              <Stack gap="sm">
                {bigProblemStats.map((stat) => (
                  <Group key={stat.value} gap="md" wrap="nowrap" align="baseline">
                    <Text fw={900} c="brandYellow.5" style={{ fontSize: '1.5rem', minWidth: 68 }}>
                      {stat.value}
                    </Text>
                    <Text size="sm" c="background.2" lh={1.4}>
                      {stat.label}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Text size="xs" c="background.4" mt="lg">
                Zdroj: Digital News Report 2026, 48 zemí, ~100 000 respondentů.
              </Text>
            </Paper>

            <Paper p={{ base: 24, md: 32 }} radius={8} bg="background.0" style={{ border: '2px solid var(--mantine-color-brand-6)' }}>
              <Kicker>Náš dílčí, řešitelný problém</Kicker>
              <Title order={3} size="1.35rem" mt="sm" mb="md">
                Kvalitní fakta se k lidem nedostanou včas a srozumitelně
              </Title>
              <Text lh={1.6} mb="md">
                U mnoha důležitých témat kvalitní poznání existuje — ale je rozptýlené v datech,
                odborných dokumentech a nesrozumitelných tabulkách. Málokdo je zpracuje tak, aby jim
                běžný člověk porozuměl. A ještě méně lidí je zpracuje tak, aby je mohl převzít
                novinář, učitel, instituce, sociální síť nebo jazykový model.
              </Text>
              <Text lh={1.6}>
                V informačním oběhu tak vznikají prázdná místa, která rychle obsadí nejjednodušší,
                nejhlasitější nebo nejlépe zaplacený výklad. Tato prázdná místa umíme vyplnit
                spolehlivým veřejným zdrojem.
              </Text>
            </Paper>
          </SimpleGrid>

          {/* Sharp statement */}
          <Paper p={{ base: 28, md: 44 }} radius={8} bg="brand.6" c="background.0">
            <Text style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', lineHeight: 1.35, fontWeight: 800 }}>
              Problém není jen v tom, že lidé věří lžím. Problém je, že u mnoha důležitých témat
              nemají snadno dostupnou, srozumitelnou a důvěryhodnou alternativu.
            </Text>
            <Text mt="md" c="background.1" style={{ fontWeight: 700 }}>
              A právě tuto konkrétní věc umíme změnit.
            </Text>
          </Paper>

          {/* Problem -> Solution -> Impact triad */}
          <Stack gap="md">
            <Kicker>Jak o tom uvažujeme</Kicker>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {[
                {
                  step: 'Problém',
                  color: 'var(--mantine-color-brand-6)',
                  text: 'Důvěryhodné poznání se k lidem nedostává ve chvíli a podobě, v níž si vytvářejí názor.',
                },
                {
                  step: 'Řešení',
                  color: 'var(--mantine-color-brandOrange-6)',
                  text: 'Převádíme data na srozumitelné, ověřitelné a široce použitelné veřejné zdroje.',
                },
                {
                  step: 'Měřitelný dopad',
                  color: 'var(--mantine-color-brandTeal-6)',
                  text: 'Víc lidí, médií a informačních systémů tyto zdroje skutečně používá.',
                },
              ].map((item) => (
                <Paper key={item.step} p={{ base: 22, md: 28 }} radius={8} bg="background.0" style={{ borderTop: `5px solid ${item.color}` }}>
                  <Text fw={900} tt="uppercase" size="sm" style={{ letterSpacing: '0.06em', color: item.color }} mb="sm">
                    {item.step}
                  </Text>
                  <Text lh={1.55} style={{ fontSize: '1.05rem' }}>
                    {item.text}
                  </Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>

          {/* What we can measure */}
          <Paper p={{ base: 24, md: 40 }} radius={8} bg="background.0">
            <Title order={3} size="1.4rem" mb="xs">
              Naší jednotkou úspěchu není počet článků. Je jí použití důvěryhodné informace.
            </Title>
            <Text c="dimmed" mb="lg">
              Neměříme, kolik textů jsme vyrobili. Měříme, jestli je někdo — člověk i stroj —
              skutečně použil. Například:
            </Text>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              {measures.map((measure) => (
                <Group key={measure} gap="sm" wrap="nowrap" align="flex-start">
                  <Box mt={7} style={{ minWidth: 10, width: 10, height: 10, borderRadius: 2, background: 'var(--mantine-color-brand-6)' }} />
                  <Text lh={1.5}>{measure}</Text>
                </Group>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Closing punchline */}
          <Box ta="center" py={{ base: 8, md: 24 }}>
            <Title
              order={2}
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3.4rem)', lineHeight: 1.15, maxWidth: 900, margin: '0 auto' }}
            >
              Důležitá fakta existují. Do veřejného prostoru se ale často nedostanou.{' '}
              <span style={{ color: 'var(--mantine-color-brand-6)' }}>My je tam dostáváme.</span>
            </Title>
            <Text mt="lg" size="lg" c="dimmed">
              Chcete být u toho?{' '}
              <Anchor href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" fw={700} c="brand.7">
                Podpořte DataTimes
              </Anchor>
              .
            </Text>
          </Box>
        </Stack>
      </Box>

      <SupportBanner />

      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" position="center" />

      <ContactsBlock />
    </Container>
  );
}

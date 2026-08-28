'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  List,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconHeartHandshake,
  IconBuildingBank,
  IconDeviceMobileShare,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import {
  MONTHLY,
  YEARLY,
  HIGHLIGHT_TIER,
  ONE_OFF,
  FOUNDER,
  CUSTOM_URL,
  BANK,
  DONIO_URL,
  HEROHERO_URL,
  STRIPE_PORTAL_URL,
  NEWSLETTER_ACTION_URL,
  CONTACT_EMAIL,
  type Period,
  type Tier,
} from './config';

const CRIMSON = '#de1743';
const NAVY = '#272a59';
const NEWSPRINT = '#fdfbf7';
const INK_WASH = '#f8f6f0';

function money(amount: number) {
  return `${amount.toLocaleString('cs-CZ')} Kč`;
}

function CtaButton({
  url,
  children,
  variant = 'filled',
}: {
  url: string;
  children: React.ReactNode;
  variant?: 'filled' | 'outline' | 'light';
}) {
  if (!url) {
    return (
      <Button variant="default" disabled fullWidth radius="md">
        Připravujeme
      </Button>
    );
  }
  return (
    <Button
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      color="brand"
      variant={variant}
      fullWidth
      radius="md"
    >
      {children}
    </Button>
  );
}

function TierCard({ tier, highlighted }: { tier: Tier; highlighted: boolean }) {
  return (
    <Paper
      radius="md"
      p="lg"
      withBorder
      style={{
        background: highlighted ? '#fff' : NEWSPRINT,
        borderColor: highlighted ? CRIMSON : '#e8e8dc',
        borderWidth: highlighted ? 2 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group justify="space-between" align="center" mb={4}>
        <Text fw={700} size="sm" c={NAVY}>
          {tier.label}
        </Text>
        {highlighted && (
          <Badge color="brand" variant="filled" radius="sm">
            Nejčastější volba
          </Badge>
        )}
      </Group>

      <Group gap={6} align="baseline" mt={4} mb={8}>
        <Text fw={700} style={{ fontSize: 34, lineHeight: 1.1 }} c={NAVY}>
          {money(tier.amount)}
        </Text>
      </Group>

      <Text size="sm" c="dimmed" style={{ flex: 1 }} mb="md">
        {tier.note}
      </Text>

      <CtaButton url={tier.url} variant={highlighted ? 'filled' : 'outline'}>
        Podpořit
      </CtaButton>
    </Paper>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Title order={2} c={CRIMSON} mb="md" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
      {children}
    </Title>
  );
}

export default function KlubPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const tiers = period === 'monthly' ? MONTHLY : YEARLY;

  return (
    <Box bg={NEWSPRINT}>
      {/* HERO */}
      <Paper radius={0} bg={NAVY} py={{ base: 48, md: 76 }}>
        <Container size="md">
          <Text tt="uppercase" fw={700} c="brandYellow.6" style={{ letterSpacing: '0.08em' }} mb="xs">
            Klub DataTimes
          </Text>
          <Title
            order={1}
            c="#fff"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15 }}
            mb="md"
          >
            Držte v české debatě hlas, který stojí na datech.
          </Title>
          <Text c="#e9ebfa" size="lg" maw={640} mb="xl">
            Naše analýzy jsou a zůstanou zdarma a bez paywallu. Klub je způsob, jak
            umožnit, aby vznikaly — ať už naše texty čtete každý den, nebo jen chcete,
            aby existovaly.
          </Text>
          <Group>
            <Button
              component="a"
              href="#castky"
              size="md"
              radius="md"
              color="brandYellow.6"
              c={NAVY}
            >
              Přidat se
            </Button>
            <Button
              component="a"
              href="#transparentnost"
              size="md"
              radius="md"
              variant="outline"
              color="#e9ebfa"
            >
              Jak je to s nezávislostí
            </Button>
          </Group>
        </Container>
      </Paper>

      {/* PROČ */}
      <Container size="md" py={{ base: 40, md: 64 }}>
        <SectionTitle>Proč to má smysl</SectionTitle>
        <Stack gap="md">
          <Text>
            Vyrábět a šířit lži, polopravdy a účelový šum je stokrát levnější než
            dělat pořádnou datovou žurnalistiku. Historický model médií — cena za
            výtisk a reklama — dožívá. Velká média se kupují jako nástroj vlivu,
            veřejnoprávní jsou pod politickým tlakem.
          </Text>
          <Text>
            DataTimes dělá datové analýzy a investigace, které obstojí — s metodikou,
            se zdroji a bez ohledu na to, o kom jsou. Aby takový hlas v debatě zůstal,
            potřebuje lidi, kteří ho drží.
          </Text>
          <Paper
            radius="md"
            p="lg"
            style={{ background: INK_WASH, borderLeft: `4px solid ${CRIMSON}` }}
          >
            <Text fw={600} size="lg" c={NAVY}>
              Lhát je levné. Říkat pravdu doloženě ne. A proto pravda bez aktivní
              podpory prohrává.
            </Text>
          </Paper>
        </Stack>
      </Container>

      <Divider />

      {/* JAK TO FUNGUJE */}
      <Container size="md" py={{ base: 40, md: 64 }}>
        <SectionTitle>Jak to funguje</SectionTitle>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {[
            {
              t: 'Všechno zůstává zdarma',
              d: 'Žádný paywall, žádný obsah jen pro platící. Data i metodika jsou veřejné.',
            },
            {
              t: 'Podporujete existenci',
              d: 'Stejně jako spousta čtenářů Deníku N nebo Respektu platí za to, aby takový hlas byl slyšet — ne aby ho denně konzumovali.',
            },
            {
              t: 'Podpora nedává vliv',
              d: 'Podporovatelé, patroni ani mecenáši nemluví do výběru témat ani do závěrů. Když píšeme o někom, s kým nás něco pojí, řekneme to.',
            },
          ].map((x) => (
            <Stack key={x.t} gap={6}>
              <Text fw={700} c={NAVY}>
                {x.t}
              </Text>
              <Text size="sm" c="dimmed">
                {x.d}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Container>

      {/* ČÁSTKY */}
      <Box id="castky" bg={INK_WASH} py={{ base: 40, md: 64 }}>
        <Container size="md">
          <SectionTitle>Kolik a jak</SectionTitle>

          <Group justify="center" mb="xl">
            <SegmentedControl
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              data={[
                { label: 'Měsíčně', value: 'monthly' },
                { label: 'Ročně (2 měsíce zdarma)', value: 'yearly' },
              ]}
              radius="md"
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {tiers.map((tier) => (
              <TierCard key={tier.key} tier={tier} highlighted={tier.key === HIGHLIGHT_TIER} />
            ))}
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="lg">
            <Paper radius="md" p="lg" withBorder style={{ background: NEWSPRINT }}>
              <Text fw={700} c={NAVY} mb={4}>
                Vlastní částka
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Chcete dát víc nebo jinak? Nastavte si částku sami.
              </Text>
              <CtaButton url={CUSTOM_URL} variant="outline">
                Zvolit částku
              </CtaButton>
            </Paper>

            <Paper radius="md" p="lg" withBorder style={{ background: NEWSPRINT }}>
              <Text fw={700} c={NAVY} mb={4}>
                Jednou za čas
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Jednorázový dar, doporučeně od {money(ONE_OFF.defaultAmount)}. Klidně
                „za tenhle text“.
              </Text>
              <CtaButton url={ONE_OFF.url} variant="outline">
                Přispět jednorázově
              </CtaButton>
            </Paper>

            <Paper
              radius="md"
              p="lg"
              withBorder
              style={{ background: NEWSPRINT, borderColor: '#e8e8dc' }}
            >
              <Text fw={700} c={NAVY} mb={4}>
                Zakládající příspěvek
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                {money(FOUNDER.amount)} jednorázově. Staňte se jedním ze zakladatelů —
                jméno bude v první výroční zprávě.
              </Text>
              <CtaButton url={FOUNDER.url} variant="outline">
                Stát se zakladatelem
              </CtaButton>
            </Paper>
          </SimpleGrid>

          <Text size="sm" c="dimmed" mt="lg">
            Platbu i případné zrušení spravuje Stripe. Zrušit jde kdykoli jedním
            klikem{STRIPE_PORTAL_URL ? '' : ' přes odkaz v potvrzovacím e-mailu'}.
            {STRIPE_PORTAL_URL && (
              <>
                {' '}
                <Anchor href={STRIPE_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                  Správa podpory
                </Anchor>
                .
              </>
            )}
          </Text>
        </Container>
      </Box>

      {/* CO ZÍSKÁTE */}
      <Container size="md" py={{ base: 40, md: 64 }}>
        <SectionTitle>Co s tím máte</SectionTitle>
        <Text mb="lg" c="dimmed">
          Žádný obsah navíc — všechno vychází pro všechny. Co dostáváte, je
          poděkování a přístup k lidem a k tomu, jak analýza vzniká.
        </Text>
        <Stack gap="lg">
          <Box>
            <Text fw={700} c={NAVY}>
              Každý
            </Text>
            <List
              spacing={4}
              size="sm"
              mt={4}
              icon={
                <ThemeIcon color="brand" size={18} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Měsíční dopis z redakce — na čem děláme, co jsme zabili a proč.</List.Item>
              <List.Item>Možnost kdykoli skončit, bez volání a bez vyčítání.</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={700} c={NAVY}>
              Od úrovně patron
            </Text>
            <List
              spacing={4}
              size="sm"
              mt={4}
              icon={
                <ThemeIcon color="brand" size={18} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Pozvánky na online redakční hovory — ptejte se na cokoli.</List.Item>
              <List.Item>Náhledy velkých projektů před vydáním (v den vydání jdou stejně všem).</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={700} c={NAVY}>
              Od úrovně mecenáš / ročně
            </Text>
            <List
              spacing={4}
              size="sm"
              mt={4}
              icon={
                <ThemeIcon color="brand" size={18} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Jméno ve výroční zprávě o financování (když budete chtít).</List.Item>
              <List.Item>Jednou za rok setkání a formulář na návrhy témat.</List.Item>
            </List>
          </Box>
        </Stack>
      </Container>

      <Divider />

      {/* PROJEKTOVÁ PODPORA */}
      <Container size="md" py={{ base: 40, md: 64 }}>
        <SectionTitle>Podpořte konkrétní část naší práce</SectionTitle>
        <Text mb="lg" c="dimmed">
          Můžete směřovat podporu k tomu, co je vám blízké. Nekupujete si tím článek
          ani jeho vyznění — posilujete celou tu část práce.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Paper radius="md" p="lg" withBorder style={{ background: NEWSPRINT }}>
            <Group gap={8} mb={6}>
              <ThemeIcon color="brand" variant="light" radius="md" size={32}>
                <IconDeviceMobileShare size={18} />
              </ThemeIcon>
              <Text fw={700} c={NAVY}>
                DataTimes na sítích
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Grafika, vysvětlovačky a vyvracení nesmyslů tam, kde se šíří — přímo ve
              feedu. Držte nás tam.
            </Text>
          </Paper>

          <Paper radius="md" p="lg" withBorder style={{ background: NEWSPRINT }}>
            <Group gap={8} mb={6}>
              <ThemeIcon color="brand" variant="light" radius="md" size={32}>
                <IconBuildingCommunity size={18} />
              </ThemeIcon>
              <Text fw={700} c={NAVY}>
                Města v datech
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              mesta.datatimes.cz sleduje hospodaření a rozhodování obcí. Firma nebo
              člověk může „adoptovat“ své město a platit údržbu jeho dat. Platí to
              pozornost, ne příznivé zprávy — když najdeme problém, napíšeme o něm.
            </Text>
            <Text size="sm" mt="sm">
              Chcete adoptovat své město?{' '}
              <Anchor href={`mailto:${CONTACT_EMAIL}`}>Napište nám</Anchor>.
            </Text>
          </Paper>
        </SimpleGrid>
      </Container>

      {/* PŘEVOD / QR */}
      <Box bg={INK_WASH} py={{ base: 40, md: 64 }}>
        <Container size="md">
          <SectionTitle>Převodem nebo přes QR</SectionTitle>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            <Stack gap="xs">
              <Group gap={8}>
                <ThemeIcon color="brand" variant="light" radius="md" size={32}>
                  <IconBuildingBank size={18} />
                </ThemeIcon>
                <Text fw={700} c={NAVY}>
                  Bankovním převodem
                </Text>
              </Group>
              {BANK.account ? (
                <>
                  <Text size="sm">
                    Číslo účtu: <b>{BANK.account}</b>
                  </Text>
                  {BANK.variableSymbol && (
                    <Text size="sm">
                      Variabilní symbol: <b>{BANK.variableSymbol}</b>
                    </Text>
                  )}
                  <Text size="sm">
                    Zpráva pro příjemce: <b>{BANK.message}</b>
                  </Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  Číslo účtu doplníme brzy (chystáme transparentní účet). Zatím
                  podpořte kartou výše, nebo nám{' '}
                  <Anchor href={`mailto:${CONTACT_EMAIL}`}>napište</Anchor>.
                </Text>
              )}
              {BANK.qrSvgPath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={BANK.qrSvgPath} alt="QR platba" width={160} height={160} />
              )}
            </Stack>

            <Stack gap="xs">
              <Group gap={8}>
                <ThemeIcon color="brand" variant="light" radius="md" size={32}>
                  <IconHeartHandshake size={18} />
                </ThemeIcon>
                <Text fw={700} c={NAVY}>
                  Kampaň na Donio
                </Text>
              </Group>
              {DONIO_URL ? (
                <Anchor href={DONIO_URL} target="_blank" rel="noopener noreferrer">
                  Podpořit na Donio
                </Anchor>
              ) : (
                <Text size="sm" c="dimmed">
                  Jednorázovou sbírku na Donio chystáme na podzim 2026.
                </Text>
              )}
              <Text size="sm" c="dimmed" mt="sm">
                Podporujete nás přes Herohero? Necháváme ho běžet. Nově doporučujeme
                jít přímo přes tuhle stránku — víc peněz jde na práci.
                {HEROHERO_URL && (
                  <>
                    {' '}
                    <Anchor href={HEROHERO_URL} target="_blank" rel="noopener noreferrer">
                      Herohero
                    </Anchor>
                    .
                  </>
                )}
              </Text>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* TRANSPARENTNOST */}
      <Container size="md" py={{ base: 40, md: 64 }} id="transparentnost">
        <SectionTitle>Nezávislost a transparentnost</SectionTitle>
        <Stack gap="md">
          <Text>
            Naše žurnalistika zůstane vždy zdarma a bez paywallu. Podporovatelé,
            patroni ani mecenáši nemají vliv na výběr témat ani na závěry. Když píšeme
            o někom, s kým nás pojí vztah, uvedeme to přímo u textu.
          </Text>
          <Text>
            Jednou ročně zveřejníme, odkud peníze byly a co zaplatily. Granty a další
            externí financování přiznáváme u textů i v patičce.
          </Text>
          <Text size="sm" c="dimmed">
            Uchováváme jen e-mail, jméno a výši podpory (zpracovává Stripe a Ecomail).
            Nikdy je neprodáme ani nepředáme dál.
          </Text>
        </Stack>
      </Container>

      <Divider />

      {/* FAQ */}
      <Container size="md" py={{ base: 40, md: 64 }}>
        <SectionTitle>Časté otázky</SectionTitle>
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="dane">
            <Accordion.Control>Můžu si podporu odečíst z daní?</Accordion.Control>
            <Accordion.Panel>
              Zatím ne. DataTimes provozuje Michal Škop jako OSVČ, takže
              nevystavujeme potvrzení o daru. Pokud vznikne nezisková forma, přidáme
              i tuhle možnost.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="zruseni">
            <Accordion.Control>Jak podporu zruším?</Accordion.Control>
            <Accordion.Panel>
              Jedním klikem přes odkaz, který dostanete v potvrzovacím e-mailu
              (spravuje ho Stripe). Bez volání, bez vyčítání.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="nectu">
            <Accordion.Control>
              Nečtu vaše články každý den. Má smysl, abych přispíval?
            </Accordion.Control>
            <Accordion.Panel>
              Má. Většina podpory jde od lidí, kteří chtějí hlavně to, aby takový hlas
              v debatě byl — ne aby ho denně konzumovali.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="kdo">
            <Accordion.Control>Kdo za DataTimes stojí?</Accordion.Control>
            <Accordion.Panel>
              Kateřina Mahdalová a Michal Škop. Víc na{' '}
              <Anchor component={Link} href="/kdo-jsme">
                stránce Kdo jsme
              </Anchor>
              .
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="penize">
            <Accordion.Control>Kam peníze jdou?</Accordion.Control>
            <Accordion.Panel>
              Na čas strávený analýzami a investigacemi, na data, nástroje a provoz.
              Jednou ročně to rozepíšeme ve zprávě o financování.
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Container>

      {/* ZÁVĚREČNÁ VÝZVA */}
      <Paper radius={0} bg={NAVY} py={{ base: 40, md: 56 }}>
        <Container size="md">
          <Title order={2} c="#fff" mb="sm" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Přidejte se
          </Title>
          <Text c="#e9ebfa" mb="lg" maw={560}>
            I malá pravidelná částka drží v české debatě hlas, který stojí na datech.
          </Text>
          <Button component="a" href="#castky" size="md" radius="md" color="brandYellow.6" c={NAVY}>
            Vybrat částku
          </Button>
        </Container>
      </Paper>

      {/* NEWSLETTER */}
      <NewsletterInline />
    </Box>
  );
}

function NewsletterInline() {
  return (
    <Box bg={NEWSPRINT} py={{ base: 32, md: 48 }}>
      <Container size="md">
        <Text fw={700} c={NAVY} mb={4}>
          Nechcete platit, ale chcete být v obraze?
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Přihlaste se k newsletteru — to hlavní z našich článků přímo do e-mailu.
        </Text>
        <form method="post" action={NEWSLETTER_ACTION_URL} target="_blank">
          <Group gap="xs" maw={420}>
            <input
              type="email"
              name="email"
              required
              placeholder="vas.email@example.com"
              style={{
                flex: 1,
                minWidth: 200,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #d4d4c8',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
            />
            <Button type="submit" color="brandTeal.6" radius="md">
              Odeslat
            </Button>
          </Group>
        </form>
      </Container>
    </Box>
  );
}

// app/klub/dekujeme/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { NEWSLETTER_ACTION_URL } from '../config';

const NAVY = '#272a59';
const NEWSPRINT = '#fdfbf7';

export const metadata: Metadata = {
  title: 'Děkujeme',
  description: 'Děkujeme za podporu Klubu DataTimes.',
  alternates: { canonical: '/klub/dekujeme' },
  robots: { index: false, follow: true },
};

export default function DekujemePage() {
  return (
    <Box bg={NEWSPRINT}>
      <Container size="sm" py={{ base: 56, md: 88 }}>
        <Text tt="uppercase" fw={700} c="brand.6" style={{ letterSpacing: '0.08em' }} mb="xs">
          Klub DataTimes
        </Text>
        <Title order={1} c={NAVY} mb="md" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Děkujeme. Bez vás to nejde.
        </Title>
        <Stack gap="md">
          <Text>
            Vaše podpora právě pomohla udržet v české debatě hlas, který stojí na
            datech. Potvrzení platby vám přišlo e-mailem — je v něm i odkaz, kterým
            podporu kdykoli spravíte nebo zrušíte.
          </Text>
          <Text>
            Jednou měsíčně vám pošleme dopis z redakce: na čem děláme, co jsme zabili
            a proč. Ať vám nic neuteče, přihlaste se i k běžnému newsletteru.
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

          <Group mt="md">
            <Button component={Link} href="/" variant="outline" color="brand" radius="md">
              Zpět na hlavní stránku
            </Button>
            <Button component={Link} href="/klub" variant="subtle" color="brand" radius="md">
              Zpět na Klub
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}

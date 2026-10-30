import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Title, Text, Badge, Box, Button, Group } from '@mantine/core';
import { IconHome, IconSearch, IconChartBar, IconNews } from '@tabler/icons-react';
import MinesweeperGame from '@/components/minesweeper/MinesweeperGame';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404: Stránka nenalezena',
  description: 'Hledaná data se nepodařilo najít. Vyzkoušejte si datového hledače min.',
};

export default function NotFound() {
  return (
    <Container size="lg" maw={880} w="100%" px={{ base: 16, md: 24 }} py={{ base: 36, md: 56 }}>
      <Box className={styles.container}>
        <div className={styles.errorCode} aria-label="404" role="img">
          <span className={styles.digit}>4</span>
          <span className={styles.logoWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/datatimes-donut.svg"
              alt=""
              aria-hidden="true"
              className={styles.logoImg}
            />
          </span>
          <span className={styles.digit}>4</span>
        </div>

        <Badge
          color="brand"
          variant="light"
          size="lg"
          radius="xl"
          className={styles.kicker}
        >
          CHYBA 404 • STRÁNKA NENALEZENA
        </Badge>

        <Title order={1} className={styles.title}>
          Tato data v&nbsp;archivu chybí
        </Title>

        <Text className={styles.perex}>
          Stránka, kterou hledáte, buď neexistuje, nebo byla přesunuta.
          V&nbsp;datové žurnalistice se ale nikdy nevzdáváme: než se vrátíte zpět,
          otestujte svůj analytický postřeh. Odkryjte všechna bezpečná data bez toho,
          abyste šlápli na neověřený údaj nebo dezinformaci (🚩).
        </Text>

        {/* Minesweeper Interactive Game */}
        <Box className={styles.gameWrapper}>
          <MinesweeperGame />
        </Box>

        {/* Quick Navigation fallback */}
        <Box className={styles.navSection}>
          <Text className={styles.navTitle}>
            Kam dál pokračovat?
          </Text>

          <Group justify="center" gap="sm">
            <Button
              component={Link}
              href="/"
              variant="filled"
              color="brand"
              leftSection={<IconHome size={16} />}
            >
              Hlavní strana
            </Button>

            <Button
              component={Link}
              href="/search"
              variant="outline"
              color="dark"
              leftSection={<IconSearch size={16} />}
            >
              Hledat na webu
            </Button>

            <Button
              component={Link}
              href="/analyzy"
              variant="subtle"
              color="dark"
              leftSection={<IconChartBar size={16} />}
            >
              Analýzy
            </Button>

            <Button
              component={Link}
              href="/kontext"
              variant="subtle"
              color="dark"
              leftSection={<IconNews size={16} />}
            >
              Kontext
            </Button>
          </Group>
        </Box>
      </Box>
    </Container>
  );
}

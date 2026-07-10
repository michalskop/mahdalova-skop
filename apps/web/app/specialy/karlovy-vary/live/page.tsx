import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Box, Button, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  current2026,
  finalStats,
  formatNumber,
  industryShare2026,
  journalistsShare2026,
  maxTickets,
  passesShare2026,
  pct,
  publicMil2026,
  screeningsShare2026,
  spendingRatio2026,
  sponsorMil2026,
  ticketShare2026,
} from '../stats';

export const metadata: Metadata = {
  title: 'KVIFF live brief | Karlovy Vary v datech',
  description: 'Rychlý datový podklad k průběžným statistikám 60. ročníku MFF Karlovy Vary a srovnání se závěrečnými statistikami 2023-2025.',
  alternates: { canonical: '/specialy/karlovy-vary/live' },
};

function BarRow({ label, value, max, color = '#547ca8', suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: '96px 1fr 92px', gap: 12, alignItems: 'center', margin: '12px 0' }}>
      <Text fw={700}>{label}</Text>
      <Box h={24} bg="#efe7d8" style={{ border: '1px solid #ded2bf', borderRadius: 999, overflow: 'hidden' }}>
        <Box h="100%" w={`${Math.min(100, pct(value, max))}%`} style={{ background: color, borderRadius: 999 }} />
      </Box>
      <Text ta="right" fw={800} ff="monospace">{suffix ? `${value.toString().replace('.', ',')} ${suffix}` : formatNumber(value)}</Text>
    </Box>
  );
}

export default function KviffLivePage() {
  return (
    <Container size="lg" bg="#fffaf0" maw="1200px" w="100%" p={0} m="0 auto">
      <Box px={{ base: 18, md: 42 }} py={{ base: 28, md: 48 }} style={{ background: '#11100e', color: '#fffaf0' }}>
        <Stack gap="lg">
          <Button component={Link} href="/specialy/karlovy-vary" variant="subtle" color="yellow" w="fit-content" px={0}>
            Karlovy Vary v datech
          </Button>
          <Badge w="fit-content" color="yellow" variant="light">Live brief</Badge>
          <Title order={1} style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontSize: 'clamp(2.4rem, 6vw, 5.6rem)', lineHeight: 0.95, maxWidth: 900 }}>
            Festival se dá počítat i před závěrečnými titulky.
          </Title>
          <Text size="xl" maw={780} c="#f4ead8">
            Rychlý datový podklad k 60. ročníku KVIFF. Letošní čísla jsou průběžný stav k 8. 7. 2026 v 10:00, finální ročníky 2023-2025 vycházejí ze závěrečných tiskových zpráv festivalu.
          </Text>
        </Stack>
      </Box>

      <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 34 }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {[
            ['97 075', 'prodaných vstupenek k 8. 7. v 10:00'],
            ['262', 'proběhlých projekcí'],
            ['7 882', 'prodaných Fest.Passů'],
            ['578', 'akreditovaných novinářů'],
          ].map(([value, label]) => (
            <Paper key={label} p="lg" radius={8} withBorder bg="#fffdf8">
              <Text fw={900} size="xl" ff="monospace">{value}</Text>
              <Text c="dimmed">{label}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" px={{ base: 16, md: 24 }} pb={24}>
        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Vstupenky: finále ročníků a letošní průběžný stav</Title>
          <Text c="dimmed" mb="md">2023-2025 jsou finální čísla. 2026 je průběžný stav, ne závěrečná statistika.</Text>
          {finalStats.map((row) => <BarRow key={row.year} label={String(row.year)} value={row.tickets} max={maxTickets} />)}
          <BarRow label="2026*" value={current2026.tickets} max={maxTickets} color="#d7a84a" />
          <Text mt="md">Citace: k 8. červenci bylo prodáno zhruba <strong>{ticketShare2026.toString().replace('.', ',')} %</strong> loňského finálního počtu vstupenek.</Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Stav 2026 proti finálnímu roku 2025</Title>
          <Text c="dimmed" mb="md">Srovnání je orientační: rozběhnutý ročník proti uzavřenému.</Text>
          <BarRow label="Vstupenky" value={ticketShare2026} max={100} color="#d7a84a" suffix="%" />
          <BarRow label="Projekce" value={screeningsShare2026} max={100} color="#c84a50" suffix="%" />
          <BarRow label="Fest.Passy" value={passesShare2026} max={100} color="#6f9b75" suffix="%" />
          <BarRow label="Novináři" value={journalistsShare2026} max={110} color="#6f9b75" suffix="%" />
          <BarRow label="Industry" value={industryShare2026} max={110} color="#6f9b75" suffix="%" />
          <Text mt="md">Fest.Passy, novináři a filmoví profesionálové jsou už kolem loňského finále nebo nad ním.</Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Peníze: rozpočet a stopa návštěvníků</Title>
          <Text c="dimmed" mb="md">Údaje 2026 podle průběžného stat stavu.</Text>
          <BarRow label="Rozpočet" value={current2026.budgetMil} max={current2026.spendingMil} color="#547ca8" suffix="mil." />
          <BarRow label="Útrata" value={current2026.spendingMil} max={current2026.spendingMil} color="#d7a84a" suffix="mil." />
          <Text mt="md" size="lg">Každá koruna festivalového rozpočtu odpovídá zhruba <strong>{spendingRatio2026.toString().replace('.', ',')} korunám</strong> festivalové útraty ve městě a okolí.</Text>
          <Text c="dimmed" mt="xs">Říkat jako orientační poměr, ne jako kauzální návratnost.</Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Financování rozpočtu 2026</Title>
          <Text c="dimmed" mb="md">Při rozpočtu 250 mil. Kč a poměru 80/20.</Text>
          <BarRow label="Sponzoři" value={sponsorMil2026} max={current2026.budgetMil} color="#d7a84a" suffix="mil." />
          <BarRow label="Veřejné" value={publicMil2026} max={current2026.budgetMil} color="#547ca8" suffix="mil." />
          <Text mt="md">Festival je z velké části soukromě financovaná kulturní infrastruktura. Veřejné peníze netvoří většinu rozpočtu, ale pomáhají držet instituci s výraznou ekonomickou stopou.</Text>
        </Paper>
      </SimpleGrid>

      <Box px={{ base: 16, md: 24 }} pb={34}>
        <Paper p="lg" radius={8} withBorder bg="#11100e" c="#fffaf0">
          <Title order={2} mb="md" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Věty do vysílání</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Text>Vary nejsou jen červený koberec. Jsou to kina, hotely, restaurace, novináři, distributoři, producenti a město, které na devět dní funguje v jiném rytmu.</Text>
            <Text>Lidé na festivalu podle průběžných čísel utratili asi 650 milionů korun. To je 2,6násobek festivalového rozpočtu; ekonomická stopa, ne zisk festivalu.</Text>
            <Text>Fest.Passy jsou skoro na loňském finále: 7 882 letos průběžně proti 7 926 v závěrečné statistice roku 2025.</Text>
            <Text>Média a industry jsou už nad loňským finále: 578 novinářů proti 557 loni a 1 112 filmových profesionálů proti 1 055 loni.</Text>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box px={{ base: 16, md: 24 }} pb={44}>
        <Title order={2} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Pozor na formulace</Title>
        <Stack gap={6}>
          <Text>• Neříkat, že 2026 překonal rok 2025 ve vstupenkách. Zatím jde o průběžný stav.</Text>
          <Text>• 650 mil. Kč útraty neříkat jako zisk festivalu. Je to ekonomická stopa návštěvníků.</Text>
          <Text>• U 891 filmových tvůrců ověřit metodiku, protože proti 411 v letech 2024 a 2025 jde o velký skok.</Text>
          <Text>• Zdroje: závěrečné tiskové zprávy KVIFF 2025, 2024 a 2023; letošní průběžný stat stav k 8. 7. 2026 v 10:00.</Text>
        </Stack>
        <Group mt="lg">
          <Button component="a" href="https://www.kviff.com/cs/press/tiskova-zprava/2025/421844.pdf" target="_blank" rel="noopener noreferrer" variant="outline">TZ 2025</Button>
          <Button component="a" href="https://www.kviff.com/cs/press/tiskova-zprava/2024/371715.pdf" target="_blank" rel="noopener noreferrer" variant="outline">TZ 2024</Button>
          <Button component="a" href="https://www.kviff.com/cs/press/tiskova-zprava/2023/303159.pdf" target="_blank" rel="noopener noreferrer" variant="outline">TZ 2023</Button>
        </Group>
      </Box>
    </Container>
  );
}


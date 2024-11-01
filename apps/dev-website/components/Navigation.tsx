// components/Navigation.tsx
'use client';
import { Group, Button, Flex } from '@mantine/core';
import Link from 'next/link';
import LogoWithText from './common/LogoWithText';
import { ThemeSwitcher } from './common/ThemeSwitcher';

export default function Navigation() {
  return (
    <Flex justify="space-between" align="center" h="100%" px="md">
      <Group>
        <LogoWithText />
        <Link href="/clanek">
          <Button variant="subtle" color="brand">Články</Button>
        </Link>
        <Link href="/special">
          <Button variant="subtle" color="brand">Speciály</Button>
        </Link>
        <Link href="/kdo-jsme">
          <Button variant="subtle" color="brand">About</Button>
        </Link>
      </Group>
      
      <ThemeSwitcher />
    </Flex>
  );
}
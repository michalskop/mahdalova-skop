'use client';

import { useState, useEffect } from 'react';
import { Container, Group, Burger, Drawer, Stack, ActionIcon, useMantineColorScheme } from '@mantine/core';  // Add useMantineColorScheme
import { useDisclosure } from '@mantine/hooks';
// import { IconSun, IconMoon } from '@tabler/icons-react';  // Add icons
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoWithText from '../common/LogoWithText';
import classes from './HeaderSimple.module.css';

const links = [
  { link: '/clanek', label: 'Články' },
  // { link: '/special', label: 'Speciály' },
  { link: '/kdo-jsme', label: 'Kdo jsme' },
];

export function HeaderSimple() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();  // Add this

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  const items = links.map((link) => (
    <Link 
      href={link.link} 
      key={link.label}
      className={`${classes.link} ${pathname === link.link ? classes.linkActive : ''}`}
      onClick={close}
    >
      {link.label}
    </Link>
  ));

  const mobileItems = links.map((link) => (
    <Link 
      href={link.link} 
      key={link.label}
      className={`${classes.mobileLink} ${pathname === link.link ? classes.mobileLinkActive : ''}`}
      onClick={close}
    >
      {link.label}
    </Link>
  ));

  if (!mounted) {
    return (
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <LogoWithText />
          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>
        </Container>
      </header>
    );
  }

  return (
    <>
      <header className={classes.header}>
        <Container size="md" className={classes.inner} flex="flex" style={{ justifyContent: 'space-between', alignItems: 'center'}} >
          <LogoWithText />
          <Group gap={10} visibleFrom="xs" ml="auto">
            {items}
          </Group>
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
          </Group>
        </Container>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="xs"
        zIndex={1000}
      >
        <Stack>
          {mobileItems}
        </Stack>
      </Drawer>
    </>
  );
}
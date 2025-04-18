'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Group, Burger, Drawer, Stack, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core'; 
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoWithText from '@/components/common/LogoWithText';
import classes from './HeaderSimple.module.css';

const links = [
  // { link: '/special', label: 'Speciály' },
  { link: '/work', label: 'Work' },
  { link: '/blog', label: 'Blog' },
  { link: '/about', label: 'About us' },
];

export function HeaderSimple() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const logoColor = scrolled ? theme.colors.brand[6] : theme.colors.background[9];
  const headerHeight = scrolled ? '60px' : '56px';


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
      <header className={classes.header} style={{ height: headerHeight }}>
        <Container size="md" className={classes.inner}>
          <LogoWithText color={logoColor} size="md" />
          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>
        </Container>
      </header>
    );
  }

  return (
    <>
      <header 
        className={classes.header}
        style={{
          background: theme.colors.brandRoyalBlue[9],
          paddingBottom: '0',
          borderBottom: 'none',
          height: headerHeight 
        }}
      >
        <Container 
          size="md"
          className={classes.inner}
          flex="flex" 
          style={{ justifyContent: 'space-between', alignItems: 'center', gap: '20px', paddingBottom: '0', borderBottom: 'none' }}
        >
          <LogoWithText  color={logoColor}/>
          <Button
            component="a"
            href="/about#contact"
            c={theme.colors.brandRoyalBlue[9]}
            color={theme.colors.brandYellow[6]}
            radius="xl"
            style={{
              // marginLeft: '20px', // Add padding to the left
              '&:hover': {
                bg: theme.colors.brand[7], // Change to your desired hover color
              },
            }}
          >Contact
          </Button>
          <Group gap={10} visibleFrom="sm" ml="auto">
            {items}
          </Group>
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={theme.colors.brand[5]} />
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
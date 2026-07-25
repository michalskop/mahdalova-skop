'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Group, Burger, Drawer, Stack, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from '@mantine/core';
import { IconSearch, IconChevronDown } from '@tabler/icons-react';
import LogoWithText from '@/components/common/LogoWithText';
import classes from './HeaderSimple.module.css';

const navLinks = [
  { link: '/analyzy', label: 'Analýzy' },
  { link: '/kontext', label: 'Kontext' },
  { link: '/podcasty', label: 'Podcasty' },
  { link: '/kdo-jsme', label: 'Kdo jsme' },
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

  const desktopNavItems = (
    <>
      {/* Speciály Dropdown */}
      <Menu trigger="hover" openDelay={40} closeDelay={140} shadow="lg" width={240}>
        <Menu.Target>
          <Link
            href="/specialy"
            className={classes.link}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Speciály</span>
            <IconChevronDown size={14} stroke={1.8} />
          </Link>
        </Menu.Target>
        <Menu.Dropdown style={{ background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', padding: '6px', zIndex: 1100 }}>
          <Menu.Item
            component={Link}
            href="/specialy/data-pro-budouci-premierku"
            style={{ color: '#101432', fontSize: '13.5px', fontWeight: 600 }}
          >
            Data pro budoucí premiérku
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/kviff"
            style={{ color: '#101432', fontSize: '13.5px' }}
          >
            Festival KVIFF v datech
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/svobodna-media"
            style={{ color: '#101432', fontSize: '13.5px' }}
          >
            Svobodná média
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/investigace"
            style={{ color: '#101432', fontSize: '13.5px' }}
          >
            M & Š investigace
          </Menu.Item>
          <Menu.Item
            component="a"
            href="https://snemovna.datatimes.cz"
            target="_blank"
            style={{ color: '#101432', fontSize: '13.5px' }}
          >
            Sněmovna DataTimes.cz ↗
          </Menu.Item>
          <Menu.Divider style={{ borderColor: '#e2e8f0', margin: '4px 0' }} />
          <Menu.Item
            component={Link}
            href="/specialy"
            style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}
          >
            Přehled všech speciálů
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {navLinks.map(link => (
        <Link
          href={link.link}
          key={link.label}
          className={`${classes.link} ${pathname === link.link ? classes.linkActive : ''}`}
          onClick={close}
        >
          {link.label}
        </Link>
      ))}

      {/* Lupa ikona pro hledání */}
      <Link
        href="/search"
        className={`${classes.link} ${pathname === '/search' ? classes.linkActive : ''}`}
        aria-label="Hledat"
        title="Hledat"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
      >
        <IconSearch size={18} stroke={1.8} />
      </Link>
    </>
  );

  const mobileItems = (
    <>
      <Link
        href="/specialy"
        className={`${classes.mobileLink} ${pathname?.startsWith('/specialy') ? classes.mobileLinkActive : ''}`}
        onClick={close}
      >
        Speciály
      </Link>
      {navLinks.map(link => (
        <Link
          href={link.link}
          key={link.label}
          className={`${classes.mobileLink} ${pathname === link.link ? classes.mobileLinkActive : ''}`}
          onClick={close}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/search"
        className={`${classes.mobileLink} ${pathname === '/search' ? classes.mobileLinkActive : ''}`}
        onClick={close}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <IconSearch size={18} stroke={1.8} />
        <span>Hledat</span>
      </Link>
    </>
  );

  if (!mounted) {
    return (
      <header className={classes.header} style={{ height: headerHeight }}>
        <Container size="md" className={classes.inner}>
          <LogoWithText color={logoColor} size="md" />
          <Group gap={5} visibleFrom="md">
            {desktopNavItems}
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
          <Box style={{ flexShrink: 0 }}>
            <LogoWithText color={logoColor} />
          </Box>
          <Group gap={16} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Button
              component="a"
              href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a"
              c={theme.colors.brandRoyalBlue[9]}
              color={theme.colors.brandYellow[6]}
              target="_blank"
              radius="xl"
              style={{ flexShrink: 0 }}
            >
              <Box component="span" hiddenFrom="xs">Podpořit</Box>
              <Box component="span" visibleFrom="xs">Podpořte nás</Box>
            </Button>
            <Group gap={10} visibleFrom="md" wrap="nowrap">
              {desktopNavItems}
            </Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color={theme.colors.brand[5]} />
          </Group>
        </Container>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="md"
        zIndex={1000}
      >
        <Stack>
          {mobileItems}
        </Stack>
      </Drawer>
    </>
  );
}
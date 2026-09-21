'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Group, Burger, Drawer, Stack, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from '@mantine/core';
import { IconSearch, IconChevronDown, IconStar } from '@tabler/icons-react';
import LogoWithText from '@/components/common/LogoWithText';
import { Arrow } from '@repo/ui/components/Arrow';
import classes from './HeaderSimple.module.css';

const navLinks = [
  { link: '/tag/volby', label: 'Volby' },
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

  // Zkrácená vlnitá šipka jako „ukazovátko" v dropdownu speciálů: stejná šipka
  // jako u rubrik, ale viewBox oříznutý jen na špičku + první vlnku (celá šipka
  // je 0 0 400 200). Malá, bílá, umístěná CSS (.specialsPointer).
  const specialsPointer = (
    <Arrow
      className={classes.specialsPointer}
      viewBox="165 54 210 128"
      width={22}
      height={13}
      color="#ffffff"
      aria-hidden
    />
  );

  const desktopNavItems = (
    <>
      {/* Lupa ikona pro hledání – první v pořadí (hned za tlačítkem Podpořte nás). */}
      <Link
        href="/search"
        className={`${classes.link} ${pathname === '/search' ? classes.linkActive : ''}`}
        aria-label="Hledat"
        title="Hledat"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
      >
        <IconSearch size={18} stroke={1.8} />
      </Link>

      {/* Speciály Dropdown */}
      <Menu trigger="hover" openDelay={40} closeDelay={140} shadow="lg" width={310}>
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
        <Menu.Dropdown className={classes.specialsDropdown} style={{ zIndex: 1100 }}>
          <Menu.Item
            component={Link}
            href="/tag/volby"
            className={`${classes.specialsItem} ${classes.specialsItemFeatured}`}
          >
            {specialsPointer}Volby
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/data-pro-budouci-premierku"
            className={classes.specialsItem}
          >
            {specialsPointer}Data pro budoucí premiérku
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/kviff"
            className={classes.specialsItem}
          >
            {specialsPointer}Festival Karlovy Vary v datech
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/svobodna-media"
            className={classes.specialsItem}
          >
            {specialsPointer}Svobodná média
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/investigace"
            className={classes.specialsItem}
          >
            {specialsPointer}M & Š investigace
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/specialy/klima"
            className={classes.specialsItem}
          >
            {specialsPointer}Data o klimatu
          </Menu.Item>
          <Menu.Item
            component="a"
            href="https://snemovna.datatimes.cz"
            target="_blank"
            className={classes.specialsItem}
          >
            {specialsPointer}Sněmovna.DataTimes.cz ↗
          </Menu.Item>
          <Menu.Item
            component="a"
            href="https://mandaty.cz"
            target="_blank"
            className={classes.specialsItem}
          >
            {specialsPointer}Mandáty.cz ↗
          </Menu.Item>
          <Menu.Divider className={classes.specialsDivider} />
          <Menu.Item
            component={Link}
            href="/specialy"
            className={classes.specialsOverview}
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
          <LogoWithText color={logoColor} size="md" scrolled={scrolled} />
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
            <LogoWithText color={logoColor} scrolled={scrolled} />
          </Box>
          <Group gap={16} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Menu shadow="lg" width={250} position="bottom-end" offset={8}>
              <Menu.Target>
                <Button
                  c={theme.colors.brandRoyalBlue[9]}
                  color={theme.colors.brandYellow[6]}
                  radius="md"
                  style={{ flexShrink: 0 }}
                >
                  <Box component="span" hiddenFrom="xs">Podpořit</Box>
                  <Box component="span" visibleFrom="xs">Podpořte nás</Box>
                </Button>
              </Menu.Target>
              <Menu.Dropdown style={{ background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', padding: '6px', zIndex: 1100 }}>
                <Menu.Item
                  component="a"
                  href="https://buy.stripe.com/dRm9AU8U6dlOaEa1x93ks0b"
                  target="_blank"
                  style={{ color: '#101432', fontSize: '13.5px', fontWeight: 600, borderRadius: '6px' }}
                >
                  Student &nbsp;29 Kč / měs.
                </Menu.Item>
                <Menu.Item
                  component="a"
                  href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a"
                  target="_blank"
                  leftSection={<IconStar size={14} stroke={1.8} fill={theme.colors.brandRoyalBlue[9]} />}
                  style={{
                    color: theme.colors.brandRoyalBlue[9],
                    background: theme.colors.brandYellow[1],
                    fontSize: '13.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                >
                  Standard &nbsp;199 Kč / měs.
                </Menu.Item>
                <Menu.Item
                  component="a"
                  href="https://buy.stripe.com/eVq5kE9Ya3LebIea3F3ks0c"
                  target="_blank"
                  style={{ color: '#101432', fontSize: '13.5px', fontWeight: 600, borderRadius: '6px' }}
                >
                  Patron &nbsp;499 Kč / měs.
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
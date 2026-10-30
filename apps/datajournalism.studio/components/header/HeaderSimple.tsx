'use client';

// Header in the DataTimes.cz style (ported from apps/web / apps/datatimes-org):
// ink-blue bar, logo + name on the left, yellow "Support us" button, then the
// navigation. DJS order: Elections, Context, Specials, search magnifier,
// About us (hover dropdown with About us / Support us like "O nás" on
// DataTimes.cz). Mobile: Support button + burger → full-screen drawer.

import { useState, useEffect } from 'react';
import { Box, Container, Group, Burger, Drawer, Menu, Stack, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconSearch, IconChevronDown } from '@tabler/icons-react';
import LogoWithText from '@/components/common/LogoWithText';
import { SupportMenuButton } from '@/components/common/SupportMenuButton';
import { Arrow } from '@repo/ui/components/Arrow';
import classes from './HeaderSimple.module.css';
import { useGlidingPointer } from './useGlidingPointer';

const navLinks = [
  { link: '/elections', label: 'Elections' },
  { link: '/context', label: 'Context' },
  { link: '/specials', label: 'Specials' },
];

// "About us" dropdown (desktop hover); on mobile both are plain drawer links.
const aboutLinks = [
  { href: '/about', label: 'About us' },
  { href: '/support', label: 'Support us' },
];

export function HeaderSimple() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
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

  // Short wavy arrow as a "pointer" gliding between the dropdown items
  // (same as the Specials / O nás menus on DataTimes.cz).
  const { containerProps: aboutPointerContainerProps, pointerRef: aboutPointerRef } = useGlidingPointer();
  const aboutPointer = (
    <div ref={aboutPointerRef} className={classes.specialsPointer} data-visible="false" aria-hidden>
      <Arrow viewBox="0 54 380 128" width={36} height={12} color="#ffffff" />
    </div>
  );

  const isActive = (link: string) => pathname === link || pathname === `${link}.html`;

  const desktopNavItems = (
    <>
      {navLinks.map(link => (
        <Link
          href={link.link}
          key={link.label}
          className={`${classes.link} ${isActive(link.link) ? classes.linkActive : ''}`}
          onClick={close}
        >
          {link.label}
        </Link>
      ))}

      {/* Search magnifier sits between the sections and "About us". */}
      <Link
        href="/search"
        className={`${classes.link} ${isActive('/search') ? classes.linkActive : ''}`}
        aria-label="Search"
        title="Search"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
      >
        <IconSearch size={18} stroke={1.8} />
      </Link>

      <Menu trigger="hover" openDelay={40} closeDelay={140} shadow="lg" width={200} position="bottom-end">
        <Menu.Target>
          <Link
            href="/about"
            className={`${classes.link} ${aboutLinks.some(item => isActive(item.href)) ? classes.linkActive : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>About us</span>
            <IconChevronDown size={14} stroke={1.8} />
          </Link>
        </Menu.Target>
        <Menu.Dropdown className={classes.specialsDropdown} style={{ zIndex: 1100 }} {...aboutPointerContainerProps}>
          {aboutPointer}
          {aboutLinks.map(item => (
            <Menu.Item key={item.href} component={Link} href={item.href} className={classes.specialsItem} data-pointer-item>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
  );

  const mobileItems = (
    <>
      {navLinks.map(link => (
        <Link
          href={link.link}
          key={link.label}
          className={`${classes.mobileLink} ${isActive(link.link) ? classes.mobileLinkActive : ''}`}
          onClick={close}
        >
          {link.label}
        </Link>
      ))}
      {aboutLinks.map(item => (
        <Link
          href={item.href}
          key={item.href}
          className={`${classes.mobileLink} ${isActive(item.href) ? classes.mobileLinkActive : ''}`}
          onClick={close}
        >
          {item.label}
        </Link>
      ))}
      <Link
        href="/search"
        className={`${classes.mobileLink} ${isActive('/search') ? classes.mobileLinkActive : ''}`}
        onClick={close}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <IconSearch size={18} stroke={1.8} />
        <span>Search</span>
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
          <Box style={{ flexShrink: 1, minWidth: 0 }}>
            <LogoWithText color={logoColor} scrolled={scrolled} />
          </Box>
          <Group gap={16} wrap="nowrap" style={{ flexShrink: 0 }}>
            <SupportMenuButton compactOnMobile />
            <Group gap={10} visibleFrom="md" wrap="nowrap">
              {desktopNavItems}
            </Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color={theme.colors.brand[5]} aria-label="Menu" />
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

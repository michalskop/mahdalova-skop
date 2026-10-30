'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Group, Burger, Drawer, Stack, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core'; 
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoWithText from '@/components/common/LogoWithText';
import { IconSearch } from '@tabler/icons-react';
import classes from './HeaderSimple.module.css';

// Same order as the Czech DataTimes.cz header: sections, search, About, Support
const links = [
  { link: '/elections', label: 'Elections' },
  { link: '/context', label: 'Context' },
  { link: '/specials', label: 'Specials' },
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


  const searchLink = (
    <Link href="/search" key="search" aria-label="Search" title="Search"
      className={`${classes.link} ${pathname === '/search' ? classes.linkActive : ''}`}
      onClick={close}
      style={{ display: 'inline-flex', alignItems: 'center' }}>
      <IconSearch size={20} stroke={2} />
    </Link>
  );

  const linkItems = links.map((link) => (
    <Link 
      href={link.link} 
      key={link.label}
      className={`${classes.link} ${pathname === link.link ? classes.linkActive : ''}`}
      onClick={close}
    >
      {link.label}
    </Link>
  ));
  // search magnifier sits between the sections and "About us"
  const items = [...linkItems.slice(0, 3), searchLink, ...linkItems.slice(3)];

  const mobileItems = [...links, { link: '/search', label: 'Search' }, { link: '/support', label: 'Support us' }].map((link) => (
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
            href="/support"
            c={theme.colors.brandRoyalBlue[9]}
            color={theme.colors.brandYellow[6]}
            radius="xl"
            style={{
              // marginLeft: '20px', // Add padding to the left
              '&:hover': {
                bg: theme.colors.brand[7], // Change to your desired hover color
              },
            }}
          >Support us
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
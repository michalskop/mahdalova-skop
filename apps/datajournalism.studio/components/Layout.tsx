// components/Layout.tsx
'use client';

import { AppShell } from '@mantine/core';
import { HeaderSimple } from './header/HeaderSimple';
import { FooterCentered } from './footer/FooterCentered';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      header={{ height: 60 }}
      // footer={{ height: 60 }}
      // padding={0}
    >
      <AppShell.Header>
        <HeaderSimple />
      </AppShell.Header>
      <AppShell.Main>
        {children}
        <FooterCentered />
      </AppShell.Main>
    </AppShell>
  );
}
// components/Layout.tsx
'use client';

import { AppShell } from '@mantine/core';
import { HeaderSimple } from './header/HeaderSimple';
import { FooterCentered } from './footer/FooterCentered';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      header={{ height: 60 }}
      styles={{ main: { backgroundColor: '#fdfbf7', minHeight: '100vh' } }}
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
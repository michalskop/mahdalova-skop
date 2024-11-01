// app/layout.tsx
import "@mantine/core/styles.css";
import { ColorSchemeScript } from '@mantine/core';
import Layout from '@/components/Layout';
import { ThemeProvider } from './providers/ThemeProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mahdalová & Śkop',
  description: 'Datová žurnalistika, analýzy a vizualizace',
  icons: {
    icon: [{ url: '/favicon.svg' }],
    apple: [{ url: '/favicon.svg' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <ThemeProvider>
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}

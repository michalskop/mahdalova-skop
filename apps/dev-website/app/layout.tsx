// app/layout.tsx
import "@mantine/core/styles.css";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mahdalová & Śkop',
  description: 'Datová žurnalistika, analýzy a vizualizace',
  icons: {
    icon: [
      { url: '/favicon.svg' },
    ],
    // Optional: Add apple-touch-icon for iOS devices
    apple: [
      { url: '/favicon.svg' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: useState must be used in client components, so we need to handle this differently
  // Option 1: Move theme switching to a client component
  return (
    <html lang="cs">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider
          defaultColorScheme="auto"
          theme={{
            fontFamily: inter.style.fontFamily,
            // You can customize your theme here
            colors: {
              brand: [
                '#fff4f6',
                '#ffb3c0',
                '#ff8099',
                '#ff4d70',
                '#ff1a4a',
                '#f01745',
                '#de1743', // Main red at index 6
                '#c5143c',
                '#a81134',
                '#8b0e2b'],
              background: [
                '#ffffff',
                '#fdfbf7',
                '#f8f6f0',
                '#f3f1e9',
                '#eeeae2',
                '#e9e9dd',
                '#e8e8dc', // Main background at index 6
                '#d4d4c8',
                '#c8c8bc',
                '#bcbcb0'],
              yellow: [
                '#fffdf0',
                '#fff7d9',
                '#fff0b3',
                '#ffe680',
                '#ffdc33',
                '#ffd519',
                '#ffcf02', // Main yellow at index 6
                '#d6a404',
                '#bd9103',
                '#a47d03'],
              orange: [
                '#fff4eb',
                '#ffe4cc',
                '#ffd4b3',
                '#ffb380',
                '#ff934d',
                '#ff7519',
                '#f76800', // Main orange at index 6
                '#c55300',
                '#ac4800',
                '#933e00'],
            },
          }}
        >
          <Layout>
            {children}
          </Layout>
        </MantineProvider>
      </body>
    </html>
  );
}
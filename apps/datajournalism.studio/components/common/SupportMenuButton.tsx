'use client';

import { Box, Button, Menu, useMantineTheme } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

/**
 * Yellow "Support us" button with the membership menu (Student / Standard /
 * Patron) – English port of apps/web's SupportMenuButton. The Stripe Payment
 * Links are the same as on DataTimes.cz.
 * `compactOnMobile` = just "Support" on the narrowest screens.
 */
export function SupportMenuButton({ compactOnMobile = false }: { compactOnMobile?: boolean }) {
  const theme = useMantineTheme();

  return (
    <Menu shadow="lg" width={250} position="bottom-end" offset={8}>
      <Menu.Target>
        <Button
          c={theme.colors.brandRoyalBlue[9]}
          color={theme.colors.brandYellow[6]}
          radius="md"
          style={{ flexShrink: 0 }}
          // Optical centring: the middle of the capitals sits 0.08em below the
          // label's middle in IBM Plex Serif, so lift the label by that much.
          styles={{ label: { position: 'relative', top: '-0.08em' } }}
        >
          {compactOnMobile ? (
            <>
              <Box component="span" hiddenFrom="xs">Support</Box>
              <Box component="span" visibleFrom="xs">Support us</Box>
            </>
          ) : (
            'Support us'
          )}
        </Button>
      </Menu.Target>
      <Menu.Dropdown style={{ background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', padding: '6px', zIndex: 1100 }}>
        <Menu.Item
          component="a"
          href="https://buy.stripe.com/dRm9AU8U6dlOaEa1x93ks0b"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#101432', fontSize: '13.5px', fontWeight: 600, borderRadius: '6px' }}
        >
          Student &nbsp;CZK 29 / month
        </Menu.Item>
        <Menu.Item
          component="a"
          href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a"
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<IconStar size={14} stroke={1.8} fill={theme.colors.brandRoyalBlue[9]} />}
          style={{
            color: theme.colors.brandRoyalBlue[9],
            background: theme.colors.brandYellow[1],
            fontSize: '13.5px',
            fontWeight: 700,
            borderRadius: '6px',
          }}
        >
          Standard &nbsp;CZK 199 / month
        </Menu.Item>
        <Menu.Item
          component="a"
          href="https://buy.stripe.com/eVq5kE9Ya3LebIea3F3ks0c"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#101432', fontSize: '13.5px', fontWeight: 600, borderRadius: '6px' }}
        >
          Patron &nbsp;CZK 499 / month
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

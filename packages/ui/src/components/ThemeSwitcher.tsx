'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ThemeSwitcher() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      variant="subtle"
      onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
      size="lg"
      aria-label="Toggle theme"
      color="brand.2"
    >
      {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoon size="1.2rem" />}
    </ActionIcon>
  );
}

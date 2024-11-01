// components/clanek/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';

interface MediaBoxProps {
  children: string; // Accept HTML content as a string
}

export function MediaBox({ children }: MediaBoxProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      style={{ 
        backgroundColor: colorScheme === 'dark'
        ? theme.colors.gray[8]  // darker shade for dark mode
        : theme.colors.background[7],
     }}
      dangerouslySetInnerHTML={{ __html: children }} // Render HTML content directly
    />
  );
}

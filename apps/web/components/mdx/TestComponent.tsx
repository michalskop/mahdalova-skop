'use client';

import { Box, Text } from '@mantine/core';

export function TestComponent() {
  return (
    <Box
      p="md"
      my="lg"
      style={{
        backgroundColor: 'lightblue',
        border: '2px solid blue',
        borderRadius: '8px',
      }}
    >
      <Text>This is a custom React component!</Text>
    </Box>
  );
}

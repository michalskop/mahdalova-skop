'use client';

import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text, Title, Grid } from '@mantine/core';
import { BsFillPostageHeartFill } from "react-icons/bs";

interface FormProps {
  actionUrl: string;
  /** Ponecháno kvůli zpětné kompatibilitě; obálka je nově vždy vycentrovaná. */
  position?: 'left' | 'center' | 'right';
}

const SubscribeNewsletter = React.forwardRef<HTMLDivElement, FormProps>(
  function SubscribeNewsletter({ actionUrl }, ref) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      (event.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    // Vnější pruh: stejný okraj nahoře i dole (py) a po stranách (px).
    <Paper ref={ref} bg="brandDeepRed.9" py={40} px="md" radius={0}>
      {/* Obálka – vycentrovaná, responzivní šířka (na úzkém displeji vyplní,
          na širokém zůstane příjemně velká uprostřed). */}
      <Paper
        shadow="xs"
        w="100%"
        maw={520}
        mx="auto"
        withBorder
        p="lg"
        bd="2px dashed background"
        pos="relative"
        radius="md"
        c="background.0"
        bg="brandDeepRed.9"
      >
        <Box pos="absolute" top={14} right={14} style={{ zIndex: 1 }}>
          <BsFillPostageHeartFill size={36} />
        </Box>

        <form
          method="post"
          action={actionUrl}
          target="_blank"
          onSubmit={handleSubmit}
        >
          <Stack gap="sm">
            <Title order={2} size="xl" pr={44}>
              Newsletter
            </Title>

            <Text size="sm">
              To hlavní z našich článků přímo do vašeho emailu.
            </Text>

            {/* Na úzkém displeji se pole a tlačítko naskládají pod sebe (base: 12),
                od xs vedle sebe (8 + 4). */}
            <Grid gutter="sm" align="flex-end">
              <Grid.Col span={{ base: 12, xs: 8 }}>
                <TextInput
                  placeholder="vas.email@example.com"
                  name="email"
                  type="email"
                  aria-label="Váš email"
                  styles={(theme) => ({
                    input: {
                      backgroundColor: theme.colors.brandDeepRed[7],
                    },
                  })}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, xs: 4 }}>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  fullWidth
                  radius="xl"
                  variant="outline"
                  style={{ border: '1px solid' }}
                  color="background.0"
                >
                  {isSubmitting ? 'Posílám...' : 'Odeslat'}
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </Paper>
    </Paper>
  );
});

export default SubscribeNewsletter;

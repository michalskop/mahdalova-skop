'use client';

/**
 * Newsletter stripe used at the bottom of /about and /support – English port
 * of apps/web's SubscribeNewsletter (centred dashed "envelope" on the dark red
 * stripe). The site-wide components/common/SubscribeNewsletter is left as is.
 */

import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text, Title, Grid } from '@mantine/core';
import { BsFillPostageHeartFill } from 'react-icons/bs';

export const NEWSLETTER_URL =
  'https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088';

export default function NewsletterStripe({ actionUrl = NEWSLETTER_URL }: { actionUrl?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      (event.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <Paper bg="brandDeepRed.9" py={40} px="md" radius={0}>
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

        <form method="post" action={actionUrl} target="_blank" onSubmit={handleSubmit}>
          <Stack gap="sm">
            <Title order={2} size="xl" pr={44}>
              Newsletter
            </Title>

            <Text size="sm">The best of our stories, straight to your inbox.</Text>

            <Grid gutter="sm" align="flex-end">
              <Grid.Col span={{ base: 12, xs: 8 }}>
                <TextInput
                  placeholder="your.email@example.com"
                  name="email"
                  type="email"
                  aria-label="Your email"
                  styles={(theme) => ({
                    input: {
                      backgroundColor: theme.colors.brandDeepRed[7],
                      '--input-color': theme.colors.background[2],
                      '--input-placeholder-color': 'rgba(248, 246, 240, 0.6)',
                      color: theme.colors.background[2],
                      WebkitTextFillColor: theme.colors.background[2],
                      caretColor: theme.colors.background[2],
                    } as React.CSSProperties,
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
                  {isSubmitting ? 'Sending…' : 'Subscribe'}
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </Paper>
    </Paper>
  );
}

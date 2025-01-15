'use client';

import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text, Title, Grid, Group } from '@mantine/core';
import { BsFillPostageHeartFill } from "react-icons/bs";

interface FormProps {
  actionUrl: string;
  position?: 'left' | 'center' | 'right';  // New position prop
}

const SubscribeNewsletter = React.forwardRef<HTMLDivElement, FormProps>(
  function SubscribeNewsletter({ actionUrl, position = 'left' }, ref) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const form = event.target as HTMLFormElement;
      form.reset();
    }, 1000);
  };

  // Compute group justification based on position
  const getJustify = () => {
    switch (position) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  };

  return (
    <Paper
      bg="brandDeepRed.9"
      p="lg"
      radius={0}
    >
      <Group 
        gap={0}
        align="flex-start"
        wrap="wrap"
        justify={getJustify()}
        w="100%"
      >
        <Stack 
          w={{ base: '100%', md: position === 'left' ? 200 : 'auto' }}
          mb={{ base: 'xs', md: 0 }}
          pt={15}
          pl={{ base: 'md', md: 'md' }}
          style={{
            alignItems: position === 'center' ? 'center' : 
                       position === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          <Title 
            order={2} 
            ta={{ 
              base: position === 'center' ? 'center' : 
                    position === 'right' ? 'right' : 'left', 
              sm: position === 'center' ? 'center' : 
                  position === 'right' ? 'right' : 'left'
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: position === 'center' ? 'center' : 
                            position === 'right' ? 'flex-end' : 'flex-start',
              gap: '5px'
            }}
          >
          </Title>
        </Stack>  

        <Paper 
          shadow="xs" 
          maw="400px"
          withBorder 
          p="md" 
          bd="2px dashed background"
          pos="relative"
          radius="md"
          c="background.0"
          bg="brandDeepRed.9"
        >
          <Box 
            pos="absolute" 
            top={12} 
            right={12}
            style={{ zIndex: 1 }}
          >
            <BsFillPostageHeartFill size={36} />
          </Box>

          <form 
            method="post" 
            action={actionUrl}
            target="_blank"
            onSubmit={handleSubmit}
          >
            <Stack>
              <Title 
                order={2}
                size="xl"
              >
                Newsletter
              </Title>
              
              <Grid>
                <Grid.Col span={8}>
                  <Text size="sm">
                    To hlavní z našich článků
                  </Text>
                  <Text size="sm">
                    přímo do vašeho emailu.
                  </Text>
              
                  <TextInput
                    label="&nbsp;"
                    placeholder="vas.email@example.com"
                    name="email"
                    type="email"
                    styles={(theme) => ({
                      input: {
                        backgroundColor: theme.colors.brandDeepRed[7],
                      },
                    })}
                  />
                </Grid.Col>

                <Grid.Col 
                  span={4}
                  style={{
                    display: 'flex', 
                    alignItems: 'flex-end',
                  }}
                >
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
      </Group>
    </Paper>
  );
});

export default SubscribeNewsletter;
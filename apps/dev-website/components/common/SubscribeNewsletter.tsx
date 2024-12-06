'use client';
import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text, Title, Grid } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

interface FormProps {
  actionUrl: string;
}

const EcomailForm: React.FC<FormProps> = ({ actionUrl }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    
    // Reset the loading state after a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      // Optionally reset the form
      const form = event.target as HTMLFormElement;
      form.reset();
    }, 1000);
  };

  return (
    <Paper
      bg="brandEmeraldMint.6"
      p="lg"
    >
      <Paper 
        shadow="xs" 
        maw="400px" 
        mx="auto" 
        withBorder 
        p="md" 
        bd="2px dashed background"
        pos="relative"
        radius="md"
        c="background"
        bg="brandEmeraldMint.6"
        >
          <Box 
            pos="absolute" 
            top={12} 
            right={12}
            style={{ zIndex: 1 }}
            // c="background"
          >

            <IconMail size={24} />
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
                Newletter
              </Title>
              
              <Grid>
                <Grid.Col span={8}>
                  <Text size="sm">
                    To hlavní z našich článků <strong>zdarma</strong> přímo do vašeho emailu.
                  </Text>
              
                  <TextInput
                    required
                    label="Email:"
                    placeholder="vas.email@example.com"
                    name="email"
                    type="email"
                    styles={(theme) => ({
                      input: {
                        backgroundColor: theme.colors.brandEmeraldMint[7], // Set your desired background color here
                      },
                    })}
                  />

                  {/* <TextInput
                    label="Jméno"
                    placeholder="Vaše jméno"
                    name="name"
                  /> */}
                </Grid.Col>
                <Grid.Col span={4}
                   style={{ display: 'flex', alignItems: 'flex-end' }}>

                  <Button
                    type="submit"
                    // color="teal"
                    // c="background"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fullWidth
                    radius="xl"
                    style={{ border: '1px solid' }}
                    color="brandEmeraldMint.6"
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
};

export default EcomailForm;
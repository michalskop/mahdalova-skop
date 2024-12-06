'use client';
import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text, Title, Grid, Group } from '@mantine/core';
// import { IconMail } from '@tabler/icons-react';
import { BsFillPostageHeartFill } from "react-icons/bs";
import Flower from '@/components/common/Flower';

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
      bg="brandDeepRed.9"
      p="lg"
      radius={0}
    >
    <Group 
        gap={0}
        align="flex-start"
        wrap="wrap"
      >
        <Stack 
          w={{ base: '100%', md: 200 }}
          mb={{ base: 'xs', md: 0 }}
          pt={15}
          pl={{ base: 'md', md: 'md' }}
        >
          <Title 
            order={2} 
            ta={{ base: 'left', sm: 'right' }}
            style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-start', gap: '5px' }}
          >
            {/* {sectionTitle}
            <Arrow size={80} color="black" /> */}
          </Title>
        </Stack>  
      <Paper 
        shadow="xs" 
        maw="400px" 
        // mx="auto"
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
            // c="background"
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
                    // required
                    label="&nbsp;"
                    placeholder="vas.email@example.com"
                    name="email"
                    type="email"
                    styles={(theme) => ({
                      input: {
                        backgroundColor: theme.colors.brandDeepRed[7], // Set your desired background color here
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
                   style={{
                    display: 'flex', 
                    alignItems: 'flex-end',
                  }}>

                  {/* 65 is a quick fix, this part is not properly pushed down */}
                  {/* <Flower size={65} color="background" strokeWidth={2} /> */}

                  <Button
                    type="submit"
                    // color="teal"
                    // c="background"
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
};

export default EcomailForm;
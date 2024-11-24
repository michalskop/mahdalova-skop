'use client';
import React, { useState } from 'react';
import { Box, TextInput, Button, Paper, Stack, Text } from '@mantine/core';
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
      shadow="xs" 
      maw="500px" 
      mx="auto" 
      withBorder 
      p="md" 
      bd="2px dashed teal.6"
      pos="relative"
      radius="md"
      >
        <Box 
          pos="absolute" 
          top={12} 
          right={12}
          style={{ zIndex: 1 }}
          c="gray"
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
            <Text>
              Odběr newsletteru
            </Text>
            <TextInput
              required
              label="Email"
              placeholder="vas.email@example.com"
              name="email"
              type="email"
            />

            <TextInput
              label="Jméno"
              placeholder="Vaše jméno"
              name="name"
            />

            <Button
              type="submit"
              color="teal"
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
              radius="md"
            >
              {isSubmitting ? 'Posílám...' : 'Odeslat'}
            </Button>
          </Stack>
        </form>
    </Paper>
  );
};

export default EcomailForm;
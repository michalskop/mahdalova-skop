import { Box, Button, Anchor } from '@mantine/core';
import { IconChevronRight, IconActivity } from '@tabler/icons-react';

const SubscribeHH = () => {
  return (
    <Box py="lg" ta="center">
      <Anchor href="https://herohero.co/mahdalovaskop/" target="_blank">

        <Button 
          variant="filled" 
          color="teal"
          size="xl"
          radius="md"
          >
          Odebírejte naše analýzy
        </Button>
      </Anchor>
    </Box>
  );
};

export default SubscribeHH;
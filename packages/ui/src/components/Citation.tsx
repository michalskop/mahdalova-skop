import { Blockquote, Text } from '@mantine/core';
import { IconQuote } from '@tabler/icons-react';

const Citation = () => {
  const icon = <IconQuote />;
  return (
    <Blockquote color="brand" bg="background.2" icon={icon} mt="xl" fz="md" fs="italic">
      Jestliže jeden říká, že venku prší, a druhý, že venku svítí slunce, není nutné citovat oba. Novinář/ka má otevřít okno a zjistit skutečný stav věcí.
    </Blockquote>
  );
}

export default Citation;

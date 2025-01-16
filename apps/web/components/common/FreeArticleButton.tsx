'use client';

import React, { useState } from 'react';
import { Button, useMantineTheme } from '@mantine/core';

const FreeArticleButton = () => {
  const theme = useMantineTheme();
  const [isToggled, setIsToggled] = useState(false);

  const handleClick = () => {
    setIsToggled(!isToggled);
  };

  return (
    <Button
      className="BuyButton-ButtonTextContainer"
      bg={isToggled ? 'brandForestGreen.6' : 'brand.6'}
      c="gray.2"
      onClick={handleClick}
      // Add hover styles that respect the current state
      style={{
        width: '288px',
        height: '44px',
        minHeight: '44px',
        fontSize: '17px',
        fontWeight: 400,
        lineHeight: '18.4px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isToggled ? theme.colors.brandForestGreen[6] : theme.colors.brand[6],
        color: theme.colors.gray[2],
        '&:hover': {
          backgroundColor: isToggled 
            ? theme.colors.brandForestGreen[6]
            : theme.colors.brand[6]
        }
      }}
    >
      <span>
        OK článek 0 Kč
      </span>
    </Button>
  );
};

export default FreeArticleButton;
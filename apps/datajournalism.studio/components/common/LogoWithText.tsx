// app/components/common/LogoWithText.tsx

import { Group, Text, useMantineTheme } from '@mantine/core';
import Link from 'next/link';

const Logo = () => (
  // center of the svg: 250, 250; last point is slightly adjust manually to make the circle looked closed even in small sizes
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="60 60 330 330">
        <defs>
          <linearGradient id="Gradient" x1="1" x2="0.25" y1="0.5" y2="1">
            <stop offset="0%" stop-color="#ffdc33" stop-opacity="0"  />
            <stop offset="50%" stop-color="#ffdc33" stop-opacity="0" />
            <stop offset="50%" stop-color="#ffdc33" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffdc33" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g transform="rotate(-30 250 250)">
          <path fill="none" stroke="#ffdc33" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/>
          <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 250 150"/>
          <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M 250 150 A 100 100 0 0 0 250 350"/>
          <path fill="none" stroke="url(#Gradient)" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/>
        </g>
      </svg>
);

interface LogoWithTextProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  // inverted?: boolean;
  color?: string;
  onClick?: () => void; // Make onClick optional
}

const LogoWithText: React.FC<LogoWithTextProps> = ({ 
  href = "/",
  size = "md",
  // inverted = false,
  color,
  onClick
}) => {
  const theme = useMantineTheme();
  const textColor = color || theme.colors.brand[6];

  const textSize = {
    sm: 'lg',
    md: 'xl',
    lg: '2xl'
  }[size];

  const logoSize = {
    sm: 32,
    md: 48,
    lg: 64
  }[size];

  const content = (
    <Group gap={0} wrap="nowrap">
      <div style={{ width: logoSize, height: logoSize }}>
        <Logo />
      </div>
      <Text 
        fw={700}
        size={textSize}
        c={textColor}
      >
        Data&nbsp;Journalism Studio
      </Text>
    </Group>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        style={{ 
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link 
      href={href}
      style={{ 
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      {content}
    </Link>
  );
};

export default LogoWithText;
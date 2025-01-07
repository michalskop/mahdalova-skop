// app/components/common/LogoWithText.tsx

import { Group, Text, useMantineTheme } from '@mantine/core';
import Link from 'next/link';

const Logo = () => (
  // center of the svg: 250, 250; last point is slightly adjust manually to make the circle looked closed even in small sizes
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="60 60 330 330">
    <title>Logo</title>
    <path fill="none" stroke="#ffdc33" stroke-width="76" stroke-linecap="round" d="M 234.7876613810083 348.8361510467761 A 100 100 0 0 0 336.60254037844385 300"/>
    <path fill="none" stroke="#f76800" stroke-width="76" stroke-linecap="round" d="M 163.39745962155612 200.0 A 100 100 0 0 0 234.7876613810083 348.8361510467761"/>
    <path fill="none" stroke="#de1743" stroke-width="76" stroke-linecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 163.39745962155612 200"/>
    <path fill="none" stroke="#ffdc33" strokeWidth="78" strokeLinecap="round" d="M 325.47 315.61 A 100 100 0 0 0 341 291"/>
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
        Mahdalová & Škop
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
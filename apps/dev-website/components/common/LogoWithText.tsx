import { Group, Text } from '@mantine/core';
import Link from 'next/link';

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 500 500">
    <title>Logo</title>
    <path fill="none" stroke="#ffcf02" strokeWidth="48" strokeLinecap="round" d="M 234.7876613810083 348.8361510467761 A 100 100 0 0 0 336.60254037844385 300.00000000000006"/>
    <path fill="none" stroke="#f76800" strokeWidth="48" strokeLinecap="round" d="M 163.39745962155612 200.0 A 100 100 0 0 0 234.7876613810083 348.8361510467761"/>
    <path fill="none" stroke="#de1743" strokeWidth="48" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 163.39745962155612 200"/>
    <path fill="none" stroke="#ffcf02" strokeWidth="48" strokeLinecap="round" d="M 335.7167300702112 301.50380749100543 A 100 100 0 0 0 336.60254037844385 300.00000000000"/>
  </svg>
);

interface LogoWithTextProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
  onClick?: () => void; // Make onClick optional
}

const LogoWithText: React.FC<LogoWithTextProps> = ({ 
  href = "/",
  size = "md",
  inverted = false,
  onClick
}) => {
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
        c={inverted ? 'white' : 'dark.3'}
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
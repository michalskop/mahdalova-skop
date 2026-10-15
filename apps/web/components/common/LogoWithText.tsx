// app/components/common/LogoWithText.tsx
// Header name switch breakpoint lives in LogoWithText.module.css (640px).

import { Group, Text, useMantineTheme } from '@mantine/core';
import Link from 'next/link';
import classes from './LogoWithText.module.css';

const Logo = () => (
  // center of the svg: 250, 250; last point is slightly adjust manually to make the circle looked closed even in small sizes
  // viewBox je souměrný kolem středu kolečka (250 ± 165), aby kolečko leželo přesně uprostřed obrázku
  // (dřív 60–390: střed kolečka byl na 58 % výšky a logo v hlavičce sedělo o 2 px výš než nápis)
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="85 85 330 330" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="Gradient" x1="1" x2="0.25" y1="0.5" y2="1">
        <stop offset="0%" stopColor="#ffdc33" stopOpacity="0"  />
        <stop offset="50%" stopColor="#ffdc33" stopOpacity="0" />
        <stop offset="50%" stopColor="#ffdc33" stopOpacity="1" />
        <stop offset="100%" stopColor="#ffdc33" stopOpacity="1" />
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
  /**
   * Zda už uživatel odscrolloval z vršku stránky. Ovlivňuje jen úzké displeje:
   * nahoře (scrolled=false) ukážeme kratší druhý název „DataTimes.cz“ (hlavní
   * název „Mahdalová & Škop“ je v tu chvíli velký v heru, ať se neopakuje),
   * po odscrollování se do lišty vrátí „Mahdalová & Škop“ a responzivně se zmenší.
   */
  scrolled?: boolean;
}

const BRAND_NAME = 'Mahdalová & Škop';
const ALT_NAME = 'DataTimes.cz';

const LogoWithText: React.FC<LogoWithTextProps> = ({
  href = "/",
  size = "md",
  // inverted = false,
  color,
  onClick,
  scrolled = false,
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
    <Group gap={0} wrap="nowrap" style={{ flexShrink: 0 }}>
      {/* kolečko na ose lišty: blok loga sedí v 60px hlavičce o 1 px výš (změřeno 14. 10. 2026) */}
      <div style={{ width: logoSize, height: logoSize, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', top: 1 }}>
        <Logo />
      </div>
      {/* Široký displej: nahoře „DataTimes.cz“ (hero ukazuje velký M&Š), po odscrollování M&Š */}
      <Text
        component="span"
        className={classes.wideName}
        fw={700}
        size={textSize}
        c={textColor}
        style={{ whiteSpace: 'nowrap' }}
      >
        {scrolled ? BRAND_NAME : ALT_NAME}
      </Text>
      {/* Úzký displej (karty pod sebou): nahoře „DataTimes.cz“, po odscrollování zmenšený hlavní název */}
      <Text
        component="span"
        className={classes.narrowName}
        fw={700}
        c={textColor}
        style={{
          whiteSpace: 'nowrap',
          fontSize: 'clamp(0.95rem, 4.8vw, 1.25rem)',
        }}
      >
        {scrolled ? BRAND_NAME : ALT_NAME}
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
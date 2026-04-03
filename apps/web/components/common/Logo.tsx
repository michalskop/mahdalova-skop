import { Group } from '@mantine/core';
import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="hover:opacity-80 transition-opacity">
    <Group gap="xs">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="60 60 330 330" transform="rotate(345)">
        <defs>
          <linearGradient id="Gradient" x1="1" x2="0.25" y1="0.5" y2="1">
            <stop offset="0%" stop-color="#ffdc33" stop-opacity="0"  />
            <stop offset="50%" stop-color="#ffdc33" stop-opacity="0" />
            <stop offset="50%" stop-color="#ffdc33" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffdc33" stop-opacity="1" />
          </linearGradient>
        </defs>
        <path fill="none" stroke="#ffdc33" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/>
        <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 163.39745962155612 200"/>
        <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M 163.39745962155612 200 A 100 100 0 0 0 250 350"/>
        <path fill="none" stroke="url(#Gradient)" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300"/>
      </svg>
    </Group>
  </Link>
);

export default Logo;
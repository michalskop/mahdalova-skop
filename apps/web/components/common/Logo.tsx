import { Group } from '@mantine/core';
import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="hover:opacity-80 transition-opacity">
    <Group gap="xs">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 500 500">
        <path fill="none" stroke="yellow" strokeWidth="48" strokeLinecap="round" d="M 234.7876613810083 348.8361510467761 A 100 100 0 0 0 336.60254037844385 300.00000000000006"/>
        <path fill="none" stroke="orange" strokeWidth="48" strokeLinecap="round" d="M 163.39745962155612 200.0 A 100 100 0 0 0 234.7876613810083 348.8361510467761"/>
        <path fill="none" stroke="#f20000" strokeWidth="48" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 163.39745962155612 200"/>
        <path fill="none" stroke="yellow" strokeWidth="48" strokeLinecap="round" d="M 335.7167300702112 301.50380749100543 A 100 100 0 0 0 336.60254037844385 300.00000000000"/>
      </svg>
    </Group>
  </Link>
);

export default Logo;
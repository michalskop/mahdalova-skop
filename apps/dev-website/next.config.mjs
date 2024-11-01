/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    mdxRs: true,
  },
  images: {
    unoptimized: true, // Disable image optimization for local development
    domains: ['localhost:3000'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost:3000',
      }
    ]
  },
};

export default nextConfig;

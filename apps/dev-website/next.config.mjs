// apps/dev-site/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    mdxRs: true,
  },
  images: {
    unoptimized: true, // Disable image optimization since Cloudflare Pages handles this
  },
  webpack: (config, { webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      minimize: true,
    }
    
    return config
  },
};

export default nextConfig;

// next.config.mjs
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
    unoptimized: true,
  },
  webpack: (config, { webpack }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    }
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json'
  },
  // Add strict mode for dynamic routes
  strictMode: true
};

export default nextConfig;
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  transpilePackages: ['@repo/ui'],
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
  }
};

export default nextConfig;
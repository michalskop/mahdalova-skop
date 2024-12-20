// apps/web/next.config.mjs
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
    
    // Add module resolution settings
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        // Add any needed fallbacks
      }
    }
    
    return config
  },
  typescript: {
    // If you want to see all type errors but still continue build
    ignoreBuildErrors: false,
    
    // This might help with module resolution
    tsconfigPath: './tsconfig.json'
  }
};

export default nextConfig;
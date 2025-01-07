// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Use standalone mode for optimized output
  output: 'standalone', 

  // Optimize experimental features
  experimental: {
    runtime: 'nodejs',
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    mdxRs: true,
  },

  images: {
    unoptimized: true, // Required for compatibility with 'next export'
  },

  webpack: (config, { webpack, isServer }) => {
    // Optimize Webpack configuration
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };

    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
      },
    };

    // Example for Stripe: exclude Stripe SDK from the client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Ensure `fs` module is not bundled for the browser
      };
    }

    return config;
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Dynamic routes strict mode
  strictMode: true,

  // Adjust for serverless deployment
  outputFileTracing: true, // Ensures all necessary files are traced for server-side builds
};

export default nextConfig;

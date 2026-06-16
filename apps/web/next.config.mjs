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
      },
      // vega-canvas optionally requires 'canvas' for server-side rendering;
      // we use the SVG renderer in the browser only, so stub it out.
      alias: {
        ...config.resolve.alias,
        canvas: false,
      },
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
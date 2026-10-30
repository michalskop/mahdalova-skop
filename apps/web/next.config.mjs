// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Use static export for production builds; in development keep undefined so
  // notFound() routes render the 404 page instead of throwing missing param errors.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
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
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BUY_LINK: process.env.BUY_LINK,
    NEXT_PUBLIC_META_TITLE: process.env.META_TITLE,
    NEXT_PUBLIC_META_DESCRIPTION: process.env.META_DESCRIPTION,
  },
  // Rewrites for custom sub prefix support
  async rewrites() {
    const customPrefix = process.env.CUSTOM_SUB_PREFIX;
    if (customPrefix) {
      return [
        {
          source: `/${customPrefix}`,
          destination: '/',
        },
        {
          source: `/${customPrefix}/buy`,
          destination: '/buy',
        },
        {
          source: `/${customPrefix}/:path*`,
          destination: '/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
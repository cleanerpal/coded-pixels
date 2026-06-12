import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@codedpixels/ui',
    '@codedpixels/shared-types',
    '@codedpixels/component-registry',
  ],
};

export default nextConfig;

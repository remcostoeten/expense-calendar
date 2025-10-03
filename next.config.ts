import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  output: 'standalone',
  // Force all pages to be dynamic to work around Stack Auth compatibility issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable static optimization entirely for Stack Auth compatibility
  serverExternalPackages: ['@stackframe/stack', '@stackframe/stack-sc'],
  // Force all pages to be dynamic
  experimental: {
    forceSwcTransforms: true,
  },
  // Handle Stack Auth module resolution issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@stackframe/stack-sc');
    }
    
    // Add alias for the missing Stack Auth module
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@stackframe/stack-sc/dist/next-static-analysis-workaround'] = require.resolve('./scripts/stack-auth-workaround.js');
    
    return config;
  },
};

export default nextConfig;

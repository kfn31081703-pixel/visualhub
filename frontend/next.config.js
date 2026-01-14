/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to improve dev performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['toonverse.store', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'toonverse.store',
        pathname: '/storage/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/storage/:path*',
        destination: 'http://127.0.0.1:8000/storage/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://toonverse.store/api',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

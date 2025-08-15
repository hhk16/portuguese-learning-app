/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize production builds
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS - disabled due to critters module issue
    optimizeCss: false,
    // Enable server components where possible
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  
  // Configure module aliases
  webpack: (config, { isServer }) => {
    // Add performance optimizations
    if (!isServer) {
      // Replace large modules with lighter alternatives in browser
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent loading server-only modules in browser
        './content-integrated': './content-loader',
      };
      
      // Enable tree shaking more aggressively
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor code
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
            },
            // Separate content modules
            content: {
              test: /[\\/]lib[\\/](content|enhanced-content|conjugation-content|phase-.*-dense|physical-classes)\.ts$/,
              name: 'content',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate UI components
            components: {
              test: /[\\/]components[\\/]/,
              name: 'components',
              priority: 15,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Configure image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Enable compression
  compress: true,
  
  // PowerShell UTF-8 fix for Windows
  env: {
    LANG: 'en_US.UTF-8',
  },
};

module.exports = nextConfig;

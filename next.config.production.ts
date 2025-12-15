/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400' // 24 hours
          }
        ]
      }
    ];
  },

  // Security redirects
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://www.yourdomain.com/admin/:path*',
        permanent: true
      },
      {
        source: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://www.yourdomain.com/api/:path*',
        permanent: true
      }
    ];
  },

  // Content Security Policy
  async rewrites() {
    return [];
  },

  // Image optimization with security
  images: {
    domains: [
      'res.cloudinary.com',
      'your-cdn-domain.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ]
  },

  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental security features
  experimental: {
    // Enable stricter security measures
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken'],
    // Optimize for production
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration for security
  webpack: (config, { isServer }) => {
    // Security: Prevents exposing sensitive information
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    // Add security plugins in production
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            async: true,
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          entities: {
            test: /[\\/]node_modules[\\/](@babel[\\/]runtime|lodash[\\/]/,
            name: 'entities',
            priority: 15,
          },
          crypto: {
            test: /[\\/]node_modules[\\/](crypto|sha256|bcrypt|argon2|scrypt)[\\/]/,
            name: 'crypto',
            priority: 25,
          }
        }
      };
    }

    return config;
  },

  // Build optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,

  // Output configuration for production
  output: 'standalone',

  // Security for API routes
  serverExternalPackages: [],

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://your-cdn-domain.com'
    : undefined,

  // Internationalization with security
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'yourdomain.com',
        defaultLocale: 'en',
      }
    ]
  },

  // Build analysis
  webpack: (config) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
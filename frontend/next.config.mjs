// Importing the Sentry Next.js plugin
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure pages that require authentication to use server-side rendering
  // instead of static generation during build time
  experimental: {
    // This ensures pages aren't statically optimized, which prevents
    // errors when they depend on runtime data like authentication
    workerThreads: false,
    cpus: 1,
  },
  // Disable static optimization for authenticated routes
  staticPageGenerationTimeout: 1000,
}

// Wrap with Sentry configuration
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG || "scraping-wizard",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
}, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  // Hides source maps from the client
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
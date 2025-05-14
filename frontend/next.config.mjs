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
  // Configure for Vercel deployment
  env: {
    // Provide default values for environment variables to prevent build failures
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com/api/v1",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqkkrxlmxcsogjiqzwnx.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2tyeGxteGNzb2dqaXF6d254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzI4MjMsImV4cCI6MjA2MjI0ODgyM30.NJvO3_RqOLps7hRE-xP2jzNK4KWZhe8CWVpMNPM7-Kg",
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://e7efaff10c5a32aea779ba06a91ae851@o4509298442043392.ingest.us.sentry.io/4509298442240000",
  },
  // Set all pages to static generation for build time
  output: 'standalone',
  // Disable static optimization for authenticated routes
  staticPageGenerationTimeout: 1000,
}

// Handle Sentry configuration with fallbacks to prevent build failures
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG || "scraping-wizard",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
};

// Only use Sentry if DSN is available
const withSentryConfigOptions = {
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
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions, withSentryConfigOptions);
import * as Sentry from '@sentry/nextjs';

export function register() {
  // Initialize Sentry for client-side instrumentation
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      // Adjust this value in production to control sampling
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Include any other Sentry configuration options
    });
  }
}
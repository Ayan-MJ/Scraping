'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from './button';

export function SentryTest() {
  const [error, setError] = useState<string | null>(null);
  
  const triggerError = () => {
    try {
      // Intentionally throw an error
      throw new Error('This is a test error for Sentry');
    } catch (e) {
      if (e instanceof Error) {
        // Capture the error with Sentry
        Sentry.captureException(e);
        setError('Test error sent to Sentry!');
      }
    }
  };
  
  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-medium mb-2">Sentry Test</h3>
      <Button onClick={triggerError} variant="outline">
        Trigger Test Error
      </Button>
      {error && (
        <p className="mt-2 text-sm text-green-600">{error}</p>
      )}
    </div>
  );
} 
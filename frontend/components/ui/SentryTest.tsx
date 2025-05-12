'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SentryTest() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const triggerFrontendError = () => {
    try {
      // Intentionally throw an error for testing
      throw new Error('Test frontend error from SentryTest component');
    } catch (error) {
      if (error instanceof Error) {
        Sentry.captureException(error);
        setStatus('success');
        setMessage('Frontend error captured by Sentry');
      }
    }
  };
  
  const triggerBackendError = async () => {
    try {
      const response = await fetch('/api/sentry-example-api');
      if (!response.ok) {
        setStatus('success');
        setMessage('Backend error triggered and captured by Sentry');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to reach the API endpoint');
    }
  };
  
  const triggerPerformanceIssue = () => {
    // Simulate a slow operation
    const start = Date.now();
    let _result = 0;
    for (let i = 0; i < 10000000; i++) {
      _result += Math.random();
    }
    
    // Capture a custom measurement
    Sentry.captureMessage('Performance test', {
      level: 'info',
      tags: {
        operation: 'performance_test',
        duration_ms: Date.now() - start
      }
    });
    
    setStatus('success');
    setMessage(`Performance information sent to Sentry (operation took ${Date.now() - start}ms)`);
  };
  
  const _handleBackendCrash = async () => {
    try {
      // Call your backend API endpoint to trigger an error
      const response = await fetch('/api/sentry-example-api/backend-error');
      // Use underscore prefix to indicate unused variable
      const _result = await response.json();
      // This will never execute because the backend will crash
    } catch (error) {
      toast.error('Backend Error: Server error occurred');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button onClick={triggerFrontendError} variant="outline">
          Trigger Frontend Error
        </Button>
        
        <Button onClick={triggerBackendError} variant="outline">
          Trigger Backend Error
        </Button>
        
        <Button onClick={triggerPerformanceIssue} variant="outline">
          Track Performance
        </Button>
      </div>
      
      {status !== 'idle' && (
        <Alert variant={status === 'success' ? 'default' : 'destructive'}>
          {status === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {status === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import LogRocket from 'logrocket';
import { Button } from './button';

export function LogRocketTest() {
  const [message, setMessage] = useState<string | null>(null);
  
  const triggerEvent = () => {
    // Log a custom event
    LogRocket.track('test_event', { timestamp: new Date().toISOString() });
    setMessage('Event logged to LogRocket!');
  };
  
  const identifyUser = () => {
    // Identify a test user
    LogRocket.identify('test-user-id', {
      name: 'Test User',
      email: 'test@example.com',
    });
    setMessage('Test user identified in LogRocket!');
  };
  
  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-medium mb-2">LogRocket Test</h3>
      <div className="space-x-2">
        <Button onClick={triggerEvent} variant="outline" size="sm">
          Log Test Event
        </Button>
        <Button onClick={identifyUser} variant="outline" size="sm">
          Identify Test User
        </Button>
      </div>
      {message && (
        <p className="mt-2 text-sm text-green-600">{message}</p>
      )}
    </div>
  );
} 
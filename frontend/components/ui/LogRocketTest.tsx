'use client';

import { useState } from 'react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { CheckCircle2 } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';

export function LogRocketTest() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('test-user-123');
  const [userName, setUserName] = useState('Test User');
  const [userEmail, setUserEmail] = useState('test@example.com');
  
  const identifyUser = () => {
    if (typeof window !== 'undefined') {
      import('logrocket').then(LogRocket => {
        LogRocket.default.identify(userId, {
          name: userName,
          email: userEmail,
          // Add other custom user attributes
          subscriptionTier: 'premium',
          role: 'tester'
        });
        
        setStatus('success');
        setMessage(`User identified in LogRocket: ${userName} (${userEmail})`);
      });
    }
  };
  
  const logCustomEvent = () => {
    if (typeof window !== 'undefined') {
      import('logrocket').then(LogRocket => {
        LogRocket.default.track('test_event', {
          category: 'Testing',
          action: 'Clicked test button',
          timestamp: new Date().toISOString()
        });
        
        setStatus('success');
        setMessage('Custom event logged in LogRocket');
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input 
            id="userId" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userName">Name</Label>
          <Input 
            id="userName" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter user name" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userEmail">Email</Label>
          <Input 
            id="userEmail" 
            value={userEmail} 
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter user email" 
            type="email"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <Button onClick={identifyUser} variant="outline">
          Identify User
        </Button>
        
        <Button onClick={logCustomEvent} variant="outline">
          Log Custom Event
        </Button>
      </div>
      
      {status === 'success' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
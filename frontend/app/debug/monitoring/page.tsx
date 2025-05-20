'use client';

import { SentryTest } from '@/components/ui/SentryTest';
import { LogRocketTest } from '@/components/ui/LogRocketTest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Monitoring &amp; Analytics</h1>
      <p className="text-lg text-muted-foreground">
        Test and verify your monitoring and analytics integrations.
      </p>

      <Tabs defaultValue="sentry">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sentry">Sentry</TabsTrigger>
          <TabsTrigger value="logrocket">LogRocket</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sentry" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentry Error Monitoring</CardTitle>
              <CardDescription>
                Test Sentry error capturing capabilities by generating test errors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SentryTest />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                View errors in your <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline">Sentry dashboard</a>.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logrocket" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>LogRocket Session Recording</CardTitle>
              <CardDescription>
                Test LogRocket session recording and user identification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogRocketTest />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                View sessions in your <a href="https://app.logrocket.com" target="_blank" rel="noopener noreferrer" className="underline">LogRocket dashboard</a>.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
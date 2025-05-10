import { SentryTest } from '@/components/ui/SentryTest';
import { LogRocketTest } from '@/components/ui/LogRocketTest';

export default function MonitoringTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Monitoring Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-3">Sentry Error Monitoring</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to trigger a test error that will be captured and sent to Sentry.
          </p>
          <SentryTest />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">LogRocket Session Recording</h2>
          <p className="text-gray-600 mb-4">
            Test LogRocket integration by logging events or identifying a test user.
          </p>
          <LogRocketTest />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-md border">
        <h2 className="text-xl font-semibold mb-3">Monitoring Setup Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Sentry:</strong> Error monitoring and performance tracking for both frontend and backend</li>
          <li><strong>LogRocket:</strong> Session recording and user analytics for frontend interactions</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Note: This page is for development and testing purposes only. It should not be accessible in production.
        </p>
      </div>
    </div>
  );
} 
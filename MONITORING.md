# Monitoring and Analytics Setup

This guide explains how to set up Sentry for error monitoring and LogRocket for frontend session analytics.

## Sentry Integration

### 1. Frontend Setup (Next.js)

The frontend is configured to use Sentry for error monitoring and performance tracking. 

**Files modified or created:**
- `sentry.client.config.js` - Client-side Sentry configuration
- `sentry.server.config.js` - Server-side Sentry configuration
- `next.config.mjs` - Updated with Sentry configuration

**Environment Variables (`.env.local`):**
```
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

**Optional Sentry-specific variables:**
```
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project-name
```

### 2. Backend Setup (FastAPI)

The backend uses Sentry to capture errors and track performance in both the API and Celery workers.

**Files modified:**
- `app/main.py` - Added Sentry integration for FastAPI
- `app/worker.py` - Added Sentry integration for Celery

**Environment Variables (`.env`):**
```
SENTRY_DSN=your-sentry-dsn-here
ENVIRONMENT=development|staging|production
```

### 3. Setting Up a Sentry Project

1. Create an account or log in at [Sentry.io](https://sentry.io)
2. Create two projects:
   - JavaScript (Next.js) project for the frontend
   - Python project for the backend
3. Copy the DSN values from each project
4. Add these values to your environment variables

### 4. Verifying the Integration

**Frontend:**
1. Manually trigger an error in development by adding a test component:
```tsx
// pages/test-sentry.tsx
export default function TestSentry() {
  return (
    <button onClick={() => {
      throw new Error('Test error for Sentry');
    }}>
      Trigger Error
    </button>
  );
}
```

**Backend:**
1. Visit the `/debug-sentry` endpoint (only available in development)
2. Check your Sentry dashboard to confirm the error was captured

## LogRocket Integration

### 1. Frontend Setup

LogRocket is integrated into the frontend for session recording and analytics.

**Files modified:**
- `app/layout.tsx` - Added LogRocket initialization

**Environment Variables (`.env.local`):**
```
NEXT_PUBLIC_LOGROCKET_APP_ID=your-logrocket-app-id-here
```

### 2. Setting Up LogRocket

1. Create an account or log in at [LogRocket](https://logrocket.com)
2. Create a new application
3. Copy the App ID from the project settings
4. Add this value to your frontend environment variables

### 3. User Identification (Optional)

To identify users in LogRocket sessions, edit `InitLogRocket` in `app/layout.tsx`:

```tsx
if (user) {
  LogRocket.identify(user.id, {
    name: user.name,
    email: user.email,
    // Add other user properties as needed
  });
}
```

## Additional Configuration

### 1. Adjusting Sample Rates

You can adjust the trace sample rates in production:

**Frontend:**
```javascript
// sentry.client.config.js and sentry.server.config.js
tracesSampleRate: 0.1, // Capture 10% of transactions
```

**Backend:**
```python
# app/main.py and app/worker.py
traces_sample_rate=0.1,  # Capture 10% of transactions
```

### 2. Adding Breadcrumbs and Custom Context

For richer debugging information, you can add custom context and breadcrumbs.

**Frontend example:**
```javascript
import * as Sentry from '@sentry/nextjs';

// Add custom context
Sentry.setContext("character", {
  name: "Mighty Mouse",
  age: 42
});

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'Authenticated user',
  level: 'info'
});
```

**Backend example:**
```python
import sentry_sdk

# Add custom context
sentry_sdk.set_context("character", {
    "name": "Mighty Mouse",
    "age": 42
})

# Add breadcrumb
sentry_sdk.add_breadcrumb(
    category="auth",
    message="Authenticated user",
    level="info"
)
```

## Security Considerations

- Both Sentry and LogRocket may capture sensitive information by default
- Configure privacy settings appropriately in both services
- Use the `beforeSend` hook in Sentry to filter sensitive data
- Review LogRocket's privacy settings to limit recording of sensitive fields 
# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your project.

## Local Development Setup

1. Start the Supabase local development environment:
   ```bash
   npx supabase start
   ```

2. Copy the output values for `ANON_KEY` and `SERVICE_ROLE_KEY` into your `.env.local` file.

## Environment Variables

Ensure your `frontend/.env.local` file has these variables:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # For local development
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

For production, update these to your production Supabase instance values.

## OAuth Providers Setup

### GitHub

1. Go to GitHub Developer Settings: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000` (development) or your production URL
   - Authorization callback URL: `http://localhost:54321/auth/v1/callback` (development) or `https://your-project.supabase.co/auth/v1/callback` (production)
4. Copy the Client ID and Client Secret
5. Update your Supabase environment with:
   ```bash
   npx supabase secrets set SUPABASE_AUTH_GITHUB_CLIENT_ID=<your-client-id>
   npx supabase secrets set SUPABASE_AUTH_GITHUB_SECRET=<your-client-secret>
   ```

### GitLab

1. Go to GitLab profile settings: https://gitlab.com/-/profile/applications
2. Create a new application:
   - Name: Your app name
   - Redirect URI: `http://localhost:54321/auth/v1/callback` (development) or `https://your-project.supabase.co/auth/v1/callback` (production)
   - Scopes: read_user, profile, email
3. Copy the Application ID and Secret
4. Update your Supabase environment with:
   ```bash
   npx supabase secrets set SUPABASE_AUTH_GITLAB_CLIENT_ID=<your-client-id>
   npx supabase secrets set SUPABASE_AUTH_GITLAB_SECRET=<your-client-secret>
   ```

### Bitbucket

1. Go to Bitbucket Workspace settings → OAuth consumers
2. Create a new consumer:
   - Name: Your app name
   - Callback URL: `http://localhost:54321/auth/v1/callback` (development) or `https://your-project.supabase.co/auth/v1/callback` (production)
   - Permissions: Account (read), Email (read)
3. Copy the Key and Secret
4. Update your Supabase environment with:
   ```bash
   npx supabase secrets set SUPABASE_AUTH_BITBUCKET_CLIENT_ID=<your-key>
   npx supabase secrets set SUPABASE_AUTH_BITBUCKET_SECRET=<your-secret>
   ```

## Email Configuration (SMTP)

For password resets and email verification to work in production, you need to configure SMTP:

1. Uncomment the SMTP section in `supabase/config.toml`:
   ```toml
   [auth.email.smtp]
   enabled = true
   host = "smtp.example.com"
   port = 587
   user = "your-smtp-username"
   pass = "env(SMTP_PASSWORD)"
   admin_email = "admin@yourdomain.com"
   sender_name = "Your App Name"
   ```

2. Set the SMTP password:
   ```bash
   npx supabase secrets set SMTP_PASSWORD=<your-smtp-password>
   ```

## Verify Setup

After completing the setup, restart Supabase to apply the changes:

```bash
npx supabase stop
npx supabase start
```

Test the authentication flow by:
1. Creating a new account
2. Verifying your email
3. Logging in with email/password
4. Trying social login
5. Testing password reset flow 
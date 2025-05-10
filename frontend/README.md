# Scraping Wizard - Frontend

The frontend application for the Scraping Wizard platform, a no-code web scraping solution.

## Features

- User authentication with Supabase Auth
- Project management
- Run configuration and execution
- Results viewing and analysis
- Scheduling of scraping jobs

## Tech Stack

- **Next.js** - React framework with App Router
- **TypeScript** - Type safety
- **Tanstack Query** - Data fetching and cache management
- **Tailwind CSS** - Styling
- **Supabase Auth** - Authentication
- **Axios** - API requests

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Backend API running (see backend README)
- Supabase project (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ayan-MJ/scraping-wizard.git
   cd scraping-wizard/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key
   - Configure API URL (defaults to http://localhost:8000/api/v1)

   ```
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

The application uses Supabase for authentication:

1. Frontend authenticates users via Supabase Auth (`/auth/login` and `/auth/signup` pages)
2. On successful authentication, Supabase returns a session with JWT tokens
3. The Axios instance in `lib/api.ts` automatically attaches this token to all API requests
4. Backend FastAPI routes validate this token using Supabase's JWT verification
5. Protected routes are wrapped with `<ProtectedRoute>` component
6. Each API endpoint uses FastAPI's `Depends(get_current_user)` to authenticate requests

## API Integration

The frontend communicates with the backend through a configured Axios instance in `lib/api.ts`.
This instance:

1. Automatically attaches the authentication token to requests
2. Handles token refresh when necessary
3. Redirects to login if authentication fails

## Adding New Features

### New API Endpoint Integration

1. Define TypeScript interfaces in `types/`
2. Create a React Query hook in `hooks/`
3. Use the hook in your component
4. The hook will handle data fetching, caching, and error handling

## Building for Production

```bash
npm run build
# or
yarn build
```

## Running in Production

```bash
npm start
# or
yarn start
```

## Supabase Setup

### Creating a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Click "New Project" 
4. Fill in the project details and create the project
5. Once created, go to Project Settings > API to get your URL and anon key
6. Update your `.env.local` file with these values

### Setting Up Database Tables

You'll need to create the following tables in your Supabase project:

#### Projects Table

```sql
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own projects
CREATE POLICY "Users can only see their own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own projects
CREATE POLICY "Users can insert their own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own projects
CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);
```

#### Runs Table

```sql
CREATE TABLE runs (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  config JSONB DEFAULT '{}'::jsonb NOT NULL,
  urls TEXT[] DEFAULT '{}' NOT NULL,
  total_urls INTEGER DEFAULT 0 NOT NULL,
  processed_urls INTEGER DEFAULT 0 NOT NULL,
  success_count INTEGER DEFAULT 0 NOT NULL,
  failed_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only runs from their own projects
CREATE POLICY "Users can only see runs from their own projects" 
  ON runs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = runs.project_id 
    AND projects.user_id = auth.uid()
  ));

-- Create policy to allow users to insert runs for their own projects
CREATE POLICY "Users can insert runs for their own projects" 
  ON runs FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = runs.project_id 
    AND projects.user_id = auth.uid()
  ));

-- Create policy to allow users to update runs from their own projects
CREATE POLICY "Users can update runs from their own projects" 
  ON runs FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = runs.project_id 
    AND projects.user_id = auth.uid()
  ));
```
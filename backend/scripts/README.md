# Supabase Setup Scripts

This directory contains scripts to initialize and configure your Supabase database.

## Initial Database Setup

Before the API can work properly, you need to run the initialization script against your Supabase database.

### Option 1: Using the Supabase Web Dashboard

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `init_supabase.sql` into the editor
5. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db execute -f ./scripts/init_supabase.sql
```

## Verifying the Setup

After running the script, you should be able to:

1. See a `projects` table in your database
2. See sample data in the table
3. Use the Projects API endpoints successfully

If you encounter any issues, check the logs for error messages:

```bash
docker-compose logs api
```

## Schema Updates

When making changes to the database schema, create a new migration SQL file with a timestamp prefix:

```
YYYYMMDD_description.sql
```

For example:
```
20250508_add_runs_table.sql
```

This helps track database changes over time. 
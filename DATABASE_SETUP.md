# Database Setup Instructions

## Important: Database Migration Required

The application requires database tables to be created in your Supabase project. If you're seeing errors about missing tables, follow these steps:

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (the one with URL: `wmoozshmzlxlzoxgzvpb.supabase.co`)
3. Click on "SQL Editor" in the left sidebar

### 2. Run the Migration Script

1. Click "New Query" in the SQL Editor
2. Copy the entire contents of the file: `supabase/migrations/20251118191100_create_email_productivity_agent_schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" or press `Ctrl + Enter`

### 3. Verify Tables Were Created

After running the migration, verify the tables exist:

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('emails', 'prompts', 'action_items', 'drafts', 'chat_history');
```

You should see all 5 tables listed.

## Alternative: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref wmoozshmzlxlzoxgzvpb

# Push migrations
supabase db push
```

## Troubleshooting

### Error: "Table does not exist"
- The database migration hasn't been applied yet
- Follow steps 1-3 above to create the tables

### Error: "Failed to fetch" or "Network error"
- Check your internet connection
- Verify your Supabase project is active and not paused
- Check that the Supabase credentials in `.env` are correct

### Error: "JWT expired" or "Invalid API key"
- Your Supabase anon key may be incorrect
- Get the correct key from: Project Settings > API > anon/public key
- Update `VITE_SUPABASE_ANON_KEY` in your `.env` file

### Error: "Anthropic API error"
- Check that `VITE_ANTHROPIC_API_KEY` is set correctly in `.env`
- Verify your API key is valid at: https://console.anthropic.com
- Ensure your account has sufficient credits

## What the Migration Creates

The migration script creates:

1. **emails** - Stores inbox emails
2. **prompts** - Stores AI prompt templates
3. **action_items** - Stores extracted tasks from emails
4. **drafts** - Stores generated email drafts
5. **chat_history** - Stores chat interactions with the agent

All tables include:
- Row Level Security (RLS) enabled
- Public access policies (for demo purposes)
- Appropriate indexes for performance

## Next Steps

After successfully setting up the database:

1. Restart your development server: `npm run dev`
2. Click "Load Mock Inbox & Initialize" on the welcome screen
3. The app will populate the database with sample emails and default prompts
4. You can then start using all features of the Email Productivity Agent

## Need Help?

If you continue to experience issues after following these steps:

1. Check the browser console (F12) for detailed error messages
2. Verify all environment variables are set correctly in `.env`
3. Ensure your Supabase project is on a paid plan if you're seeing rate limit errors
4. Try running the diagnostic tool (coming soon) to identify specific issues

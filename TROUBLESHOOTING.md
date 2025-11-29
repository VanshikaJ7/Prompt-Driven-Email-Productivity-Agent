# Troubleshooting Guide

## Quick Fixes for Common Issues

### 🔴 "API is unresponsive" or "Error generating reply"

This typically means one of these issues:

1. **Database tables not created**
   - See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions
   - Quick fix: Run the SQL migration in your Supabase SQL Editor

2. **Gemini API issues**
   - Check your API key is valid in the Google AI Studio / Gemini console
   - Ensure you have sufficient quota
   - Verify `VITE_GEMINI_API_KEY` is set correctly in `.env`

3. **Network connectivity issues**
   - Check your internet connection
   - Verify firewalls aren't blocking api.anthropic.com or supabase.co

### 🟡 "Failed to connect to database"

**Causes:**
- Supabase credentials are incorrect
- Supabase project is paused or deleted
- Network connectivity issues

**Solutions:**
1. Verify your `.env` file has the correct values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-api-key
   ```

2. Check Supabase project status at https://supabase.com/dashboard

3. Get fresh credentials from: Project Settings > API

4. Restart the dev server after updating `.env`

### 🟡 "Table does not exist" or "PGRST116" error

**Cause:** Database migration hasn't been run

**Solution:**
1. Go to your Supabase project's SQL Editor
2. Copy and paste the contents of `supabase/migrations/20251118191100_create_email_productivity_agent_schema.sql`
3. Run the query
4. Restart your app

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

### 🟢 Timeout Errors

**Improved in latest version:**
- API calls now have 30-second timeouts
- Automatic retry logic (3 attempts)
- Better error messages

**If you still see timeouts:**
- Check your internet speed
- Try again in a few minutes (API might be experiencing high load)
- Consider using a VPN if your ISP is blocking requests

### 🟢 Application Won't Start

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for port conflicts:**
   - Default port is 5173
   - If blocked, Vite will suggest an alternative

4. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### 🔵 Browser Console Errors

**Check the browser console (F12) for detailed error messages.**

Common errors and solutions:

| Error Message | Solution |
|--------------|----------|
| `Failed to fetch` | Network issue - check internet connection |
| `JWT expired` | Invalid Supabase key - update `.env` |
|| `API key not configured` | Missing Gemini key - add to `.env` |
| `Request timed out` | Slow connection - wait and retry |
| `Invalid response format` | API version mismatch - check API is working |

## Recent Improvements (Latest Version)

✅ **Better Error Handling:**
- Clear, actionable error messages
- Proper timeout handling (30 seconds)
- Automatic retry logic for transient failures

✅ **Connection Validation:**
- App tests API connections on startup
- Early warning if database or API is unreachable
- Detailed error messages in console

✅ **Robustness:**
- Fixed category filtering crashes
- Better null/undefined handling
- Improved network error recovery

## Testing Your Setup

### Method 1: Use the Application
1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. The app will automatically test connections
4. Check browser console for any warnings

### Method 2: Manual Connection Test

**Test Gemini API:**
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={{GEMINI_API_KEY}}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"test"}]}]}'
```

**Test Supabase:**
- Visit your Supabase project URL in a browser
- You should see a message about the API being ready

## Still Having Issues?

1. **Check all environment variables are set correctly**
2. **Ensure database migration has been run** (see DATABASE_SETUP.md)
3. **Verify API keys are valid and have credits**
4. **Check browser console** (F12) for detailed errors
5. **Try in incognito mode** to rule out browser extensions

## Getting Help

If you've tried all the above and still have issues:

1. Note the exact error message from the browser console
2. Check which step is failing (connection test, database, API call)
3. Verify your setup matches the requirements in README.md
4. Look for similar issues in the project's issue tracker

## Environment Checklist

Before reporting an issue, verify:

- [ ] Node.js v18+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file exists with all three variables
- [ ] Supabase project is active (not paused)
- [ ] Database migration has been run
- [ ] API keys are valid
- [ ] Internet connection is working
- [ ] Browser console shows specific error messages

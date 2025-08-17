# Quick Setup Guide

## 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings > API
3. Copy your Project URL and anon/public key

## 2. Create Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database.sql` file
3. Run the SQL to create all tables and policies

## 3. Configure Environment

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Start the Application

```bash
npm start
```

The app will open at http://localhost:3000

## 5. Start Tracking!

- Use the "Add Workout" tab to log your workouts
- View all workouts in the "Workouts" tab
- Check your progress in the "Stats" tab

## Troubleshooting

- Make sure your Supabase URL and key are correct
- Ensure the database tables were created successfully
- Check the browser console for any errors
- Verify that Row Level Security policies are enabled

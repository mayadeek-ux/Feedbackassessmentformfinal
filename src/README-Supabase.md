# Supabase Configuration

## Demo Mode
The application currently runs in **Demo Mode** without requiring Supabase configuration. All data is stored locally and mock authentication is used.

## Setting up Supabase (Optional)

To enable full authentication and database functionality:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be set up

### 2. Get Your Credentials
1. Go to Settings → API
2. Copy your Project URL and Anon/Public key

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Database Schema

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('judge', 'admin')) DEFAULT 'judge',
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  group_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  judge_id UUID REFERENCES users(id) NOT NULL,
  candidate_id UUID REFERENCES candidates(id),
  group_id TEXT,
  type TEXT CHECK (type IN ('individual', 'group')) NOT NULL,
  case_study TEXT NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'submitted')) DEFAULT 'not_started',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) NOT NULL,
  scores JSONB NOT NULL,
  notes TEXT,
  total_score INTEGER NOT NULL,
  performance_band TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Row Level Security policies
CREATE POLICY "Users can read own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Judges can only see their assignments
CREATE POLICY "Judges see own assignments" ON assignments 
  FOR SELECT USING (judge_id = auth.uid());

-- Judges can only access their assessments
CREATE POLICY "Judges access own assessments" ON assessments 
  FOR ALL USING (
    assignment_id IN (
      SELECT id FROM assignments WHERE judge_id = auth.uid()
    )
  );

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE assignments, assessments;
```

### 5. Set up Authentication

In the Supabase dashboard:
1. Go to Authentication → Settings
2. Enable email authentication
3. Configure your email templates (optional)
4. Add your domain to the redirect URLs

### 6. Test the Connection

Once configured, restart your development server. The app will automatically detect the Supabase configuration and switch from Demo Mode to full functionality.

## Features Available with Supabase

✅ **With Supabase:**
- Magic link authentication
- Real-time collaboration
- Persistent data storage
- User role management
- Assignment tracking
- Live updates across all users

🔧 **Demo Mode (no Supabase):**
- Mock authentication
- Local data storage
- Full UI functionality
- Perfect for testing and development

## Troubleshooting

- **"Demo Mode" still showing**: Check that your environment variables are correctly set and restart the server
- **Authentication errors**: Verify your Supabase URL and keys are correct
- **Database errors**: Ensure you've run all the SQL setup commands
- **CORS errors**: Add your domain to the Supabase allowed origins
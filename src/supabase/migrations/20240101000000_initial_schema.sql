-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'assessor' CHECK (role IN ('admin', 'assessor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  member_ids UUID[],
  case_study TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  assessor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('individual', 'group')),
  case_study TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT assignment_target CHECK (
    (type = 'individual' AND candidate_id IS NOT NULL AND group_id IS NULL) OR
    (type = 'group' AND group_id IS NOT NULL AND candidate_id IS NULL)
  )
);

-- Assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID UNIQUE NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  total_score INTEGER,
  performance_band TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_candidates_event ON candidates(event_id);
CREATE INDEX IF NOT EXISTS idx_groups_event ON groups(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assessor ON assignments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_event ON assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assignment ON assessments(assignment_id);

-- Create view for assignments with details
CREATE OR REPLACE VIEW assignments_with_details AS
SELECT 
  a.*,
  c.name as candidate_name,
  c.email as candidate_email,
  g.name as group_name,
  ass.total_score,
  ass.performance_band,
  ass.submitted_at
FROM assignments a
LEFT JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN groups g ON a.group_id = g.id
LEFT JOIN assessments ass ON a.id = ass.assignment_id;

-- Create trigger to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'assessor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Can read own profile, admins can read all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Events: All authenticated users can read, admins can modify
CREATE POLICY "Authenticated users can view events" ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Case Studies: All authenticated users can read, admins can modify
CREATE POLICY "Authenticated users can view case studies" ON case_studies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage case studies" ON case_studies FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Candidates: All authenticated users can read, admins can modify
CREATE POLICY "Authenticated users can view candidates" ON candidates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage candidates" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Groups: All authenticated users can read, admins can modify
CREATE POLICY "Authenticated users can view groups" ON groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage groups" ON groups FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Assignments: Users can view own assignments, admins can view all
CREATE POLICY "Assessors can view own assignments" ON assignments FOR SELECT USING (assessor_id = auth.uid());
CREATE POLICY "Admins can view all assignments" ON assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Assessors can update own assignments" ON assignments FOR UPDATE USING (assessor_id = auth.uid());

-- Assessments: Users can manage own assessments
CREATE POLICY "Assessors can view own assessments" ON assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments WHERE id = assignment_id AND assessor_id = auth.uid())
);
CREATE POLICY "Assessors can manage own assessments" ON assessments FOR ALL USING (
  EXISTS (SELECT 1 FROM assignments WHERE id = assignment_id AND assessor_id = auth.uid())
);
CREATE POLICY "Admins can view all assessments" ON assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

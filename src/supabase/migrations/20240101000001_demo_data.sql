-- Insert demo data for initial setup

-- Demo Event
INSERT INTO events (id, name, description, status, start_date, end_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Assessment Event 2024',
  'Leadership assessment program',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo Case Studies (simple numbered placeholders - customize through admin panel)
INSERT INTO case_studies (id, name, description) VALUES
  (
    '10000000-0000-0000-0000-000000000001', 
    'Case Study 1', 
    'Add your case study description here through the admin panel'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 
    'Case Study 2', 
    'Add your case study description here through the admin panel'
  ),
  (
    '10000000-0000-0000-0000-000000000003', 
    'Case Study 3', 
    'Add your case study description here through the admin panel'
  ),
  (
    '10000000-0000-0000-0000-000000000004', 
    'Case Study 4', 
    'Add your case study description here through the admin panel'
  )
ON CONFLICT (id) DO NOTHING;

-- Note: Customize these case studies through Admin Panel → Case Study Management
-- Note: Demo candidates and groups will be created by admins through the UI
-- Note: Admin users need to be created through signup and then promoted via SQL:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

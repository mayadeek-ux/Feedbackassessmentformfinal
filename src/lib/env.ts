// Environment configuration helper
export const isDevelopment = import.meta.env?.MODE === 'development';
export const isProduction = import.meta.env?.MODE === 'production';

// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env?.VITE_SUPABASE_URL || 'https://iumfywuhbaoqtrzhhvvu.supabase.co',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bWZ5d3VoYmFvcXRyemhodnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg1OTAsImV4cCI6MjA3NzgxNDU5MH0.Gm_oAQhNnep7lJDtkchgREnyaHYOn1htPp4F6OZM1mg',
  isConfigured: true
};

// App configuration
export const appConfig = {
  name: 'Future Ready Assessment Platform',
  version: '1.0.0',
  supportEmail: 'support@assessment.platform',
  demoMode: false
};

// Demo user data for development
export const demoUser = {
  id: 'demo-user-1',
  email: 'judge@assessment.demo',
  name: 'Demo Judge',
  role: 'judge' as const
};

export const demoAdmin = {
  id: 'demo-admin-1',
  email: 'admin@assessment.demo',
  name: 'Demo Admin',
  role: 'admin' as const
};
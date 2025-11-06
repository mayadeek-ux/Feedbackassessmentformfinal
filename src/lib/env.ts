// Environment configuration helper
export const isDevelopment = import.meta.env?.MODE === 'development';
export const isProduction = import.meta.env?.MODE === 'production';

// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env?.VITE_SUPABASE_URL,
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY,
  isConfigured: !!(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)
};

// App configuration
export const appConfig = {
  name: 'Future Ready Assessment Platform',
  version: '1.0.0',
  supportEmail: 'support@assessment.platform',
  demoMode: !supabaseConfig.isConfigured
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
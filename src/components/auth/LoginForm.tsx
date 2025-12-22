import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  Target,
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'assessor' | 'admin';
}

interface LoginFormProps {
  // ✅ we now pass useful auth info
  onSignIn?: (payload?: { user?: any; session?: any; accessToken?: string }) => void;
}

export function LoginForm({ onSignIn }: LoginFormProps = {}) {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'assessor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'magic-link'>('signin');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // ✅ helper: always fetch the latest session + token
  const getAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const accessToken = data.session?.access_token;
    return { session: data.session, accessToken };
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // ✅ get the access token that your Edge Function needs
      const { session, accessToken } = await getAccessToken();

      // pass it upward so your API layer can use it
      onSignIn?.({
        user: data.user ?? session?.user,
        session,
        accessToken,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.email || !signupData.password) {
      setError('Please enter email and password');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name || '',
            role: signupData.role || 'assessor',
          },
        },
      });

      if (error) throw new Error(error.message || 'Signup failed');

      if (data.user) {
        setSignupSuccess(true);

        // ⚠️ Depending on your Supabase email-confirm settings,
        // session may be null until email is confirmed.
        // If you DO get a session, pass it upward.
        const { session, accessToken } = await getAccessToken();
        if (accessToken) {
          onSignIn?.({ user: data.user, session, accessToken });
        }
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: credentials.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------- UI unchanged below -----------

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 animate-fade-in">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
        </div>

        <Card className="w-full max-w-md glass border-2 border-emerald-200/20 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-100">Account Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 bg-emerald-50/10 rounded-xl border border-emerald-200/20">
              <p className="text-emerald-100 text-lg">
                Your account has been created for <strong className="text-emerald-300">{signupData.email}</strong>
              </p>
              <p className="text-sm text-emerald-200 mt-3">
                You can now sign in with your credentials.
              </p>
            </div>

            <Button
              onClick={() => {
                setSignupSuccess(false);
                setActiveTab('signin');
                setCredentials({ email: signupData.email, password: '' });
                setSignupData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'assessor'
                });
              }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 animate-fade-in">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
        </div>

        <Card className="w-full max-w-md glass border-2 border-emerald-200/20 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-100">Email Sent Successfully</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 bg-emerald-50/10 rounded-xl border border-emerald-200/20">
              <p className="text-emerald-100 text-lg">
                We've sent a secure link to <strong className="text-emerald-300">{credentials.email}</strong>
              </p>
              <p className="text-sm text-emerald-200 mt-3">
                Click the link in your email to access the assessment platform.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setCredentials({ email: '', password: '' });
              }}
              className="border-emerald-300/30 text-emerald-200 hover:bg-emerald-50/10 w-full rounded-xl"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ keep the rest of your UI exactly as-is
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 animate-fade-in relative overflow-hidden">
      {/* ... YOUR ENTIRE UI BELOW UNCHANGED ... */}
      {/* (same JSX you already pasted) */}
      {/* IMPORTANT: keep all your JSX here exactly the same */}
      {/* I’m not re-pasting it again to avoid duplication */}
      {/**/}
    </div>
  );
}

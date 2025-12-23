import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'assessor' | 'admin';
}

interface LoginFormProps {
  onSignIn?: (payload?: { user?: any; session?: any; accessToken?: string }) => void;
}

export function LoginForm({ onSignIn }: LoginFormProps = {}) {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '', 
    role: 'assessor' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic-link' | 'signup'>('password');

  // Helper: fetch the latest session + token
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

      // Get the access token for API calls
      const { session, accessToken } = await getAccessToken();

      // Pass auth info upward
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.password) {
      setError('Please enter both email and password');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
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
        setIsSuccess(true);

        // If email confirmation is disabled, we get a session immediately
        const { session, accessToken } = await getAccessToken();
        if (accessToken) {
          onSignIn?.({ user: data.user, session, accessToken });
        }
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state UI
  if (isSuccess) {
    const isSignupSuccess = loginMethod === 'signup';
    
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
            <CardTitle className="text-2xl font-bold text-emerald-100">
              {isSignupSuccess ? 'Account Created!' : 'Email Sent Successfully'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 bg-emerald-50/10 rounded-xl border border-emerald-200/20">
              {isSignupSuccess ? (
                <>
                  <p className="text-emerald-100 text-lg">
                    Your account has been created successfully!
                  </p>
                  <p className="text-sm text-emerald-200 mt-3">
                    You can now sign in with your email and password.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-emerald-100 text-lg">
                    We've sent a secure link to <strong className="text-emerald-300">{credentials.email}</strong>
                  </p>
                  <p className="text-sm text-emerald-200 mt-3">
                    Click the link in your email to access the assessment platform.
                  </p>
                </>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSuccess(false);
                setCredentials({ email: '', password: '' });
                setSignupData({ email: '', password: '', confirmPassword: '', name: '', role: 'assessor' });
                setLoginMethod('password');
                setError(null);
              }}
              className="border-emerald-300/30 text-emerald-200 hover:bg-emerald-50/10 w-full rounded-xl"
            >
              {isSignupSuccess ? 'Go to Sign In' : 'Back to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main login form UI
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 animate-fade-in relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
      </div>
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl translate-x-48 translate-y-48"></div>

      <div className="w-full max-w-lg space-y-8 animate-scale-in relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl shadow-2xl border-2 border-white/10">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Assessment Platform
            </h1>
            <p className="text-xl text-slate-300">
              Advanced Performance Evaluation System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="glass border-2 border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          <CardHeader className="bg-gradient-to-r from-white/5 to-white/10 border-b border-white/10 rounded-t-xl">
            <CardTitle className="text-center text-2xl text-white flex items-center justify-center gap-3">
              <Shield className="w-6 h-6" />
              Secure Access
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs value={loginMethod} onValueChange={(v) => {
              setLoginMethod(v as any);
              setError(null);
            }} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20 rounded-xl p-1">
                <TabsTrigger 
                  value="password" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 rounded-lg font-semibold transition-all duration-300 text-sm"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 rounded-lg font-semibold transition-all duration-300 text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="magic-link" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 rounded-lg font-semibold transition-all duration-300 text-sm"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Magic
                </TabsTrigger>
              </TabsList>

              {/* Password Sign In Tab */}
              <TabsContent value="password" className="space-y-6">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 font-semibold">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="pl-10 pr-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-300/30 bg-red-500/10 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-xl text-white font-semibold py-3 h-12 rounded-xl text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-slate-200 font-semibold">Full Name (Optional)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        disabled={isLoading}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-200 font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-200 font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a password (min 6 characters)"
                        disabled={isLoading}
                        required
                        className="pl-10 pr-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-slate-200 font-semibold">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                        required
                        className="pl-10 pr-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="text-slate-200 font-semibold">Role</Label>
                    <select
                      id="signup-role"
                      value={signupData.role}
                      onChange={(e) => setSignupData(prev => ({ ...prev, role: e.target.value as 'assessor' | 'admin' }))}
                      disabled={isLoading}
                      className="w-full h-12 px-3 bg-white/10 border border-white/20 text-white rounded-xl text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                    >
                      <option value="assessor" className="bg-slate-800">Assessor</option>
                      <option value="admin" className="bg-slate-800">Admin (Full Access)</option>
                    </select>
                  </div>

                  {error && (
                    <Alert className="border-red-300/30 bg-red-500/10 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-xl text-white font-semibold py-3 h-12 rounded-xl text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-6">
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-slate-200 font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="magic-email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12 text-lg backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-300/30 bg-red-500/10 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl text-white font-semibold py-3 h-12 rounded-xl text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Magic Link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </form>

                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-300/20 backdrop-blur-sm">
                  <p className="text-sm text-blue-200">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    <strong>Passwordless Access:</strong> We'll send you a secure, time-limited link 
                    that grants instant access to your assessment dashboard.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-400">
            Secure • Encrypted • Professional Assessment Platform
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Enterprise Security
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              End-to-End Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
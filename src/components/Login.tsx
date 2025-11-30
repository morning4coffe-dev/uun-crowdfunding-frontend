import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Lock, Mail, Heart, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
        toast.success('Welcome back!', { description: 'Successfully signed in.' });
      } else {
        await register({ email, password, firstName, lastName });
        toast.success('Account created!', { description: 'Welcome to FundIt.' });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'An error occurred';
      setError(message);
      toast.error('Authentication failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      
      {/* LEFT SIDE: Visuals (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden bg-zinc-900 lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black z-0" />
        
        <div className="relative z-10 flex items-center gap-2 text-xl font-semibold">
          <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg backdrop-blur-sm">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          FundIt
        </div>

        <div className="relative z-10 mt-auto space-y-4 max-w-lg">
          <blockquote className="text-lg font-medium leading-relaxed text-zinc-300">
            "This platform completely transformed how we approached our seed funding. The community support is unmatched."
          </blockquote>
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-orange-400" />
            <div>
              <div className="font-semibold">Alex Chen</div>
              <div className="text-xs text-zinc-500">Founder, Orbit UI</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form (Centered on Mobile) */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-sm">
          
          {/* Mobile Logo */}
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                <Heart className="w-6 h-6 text-primary fill-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Enter your information below to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    disabled={isLoading}
                    className="pl-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                    className="pl-3"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                {/* ICON LEFT */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                {/* INPUT (Added pl-10 to prevent overlap) */}
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                {/* ICON LEFT */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                
                {/* INPUT (Added pl-10 left, pr-10 right) */}
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                
                {/* ICON RIGHT (Eye Toggle) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full font-semibold text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Toggle Login/Register */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleToggleMode} 
            disabled={isLoading}
          >
            {isLogin ? (
              <span className="flex items-center">
                Don't have an account? Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            ) : (
              'Already have an account? Sign In'
            )}
          </Button>

          {/* Footer Text */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed px-6">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
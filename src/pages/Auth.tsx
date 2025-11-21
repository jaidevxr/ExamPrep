import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Parse OAuth errors from URL
  useEffect(() => {
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      let friendlyMessage = 'Authentication failed. Please try again.';

      if (errorCode === 'unexpected_failure' || error === 'server_error') {
        if (errorDescription?.includes('Unable to exchange external code')) {
          friendlyMessage = 'Google authentication failed. Please check your OAuth credentials in the backend settings.';
        } else {
          friendlyMessage = 'Server error during authentication. Please try again or contact support.';
        }
      } else if (error === 'access_denied') {
        friendlyMessage = 'Access denied. You need to grant permissions to continue.';
      } else if (error === 'invalid_request') {
        friendlyMessage = 'Invalid authentication request. Please try again.';
      }

      setOauthError(friendlyMessage);
      
      // Clear error params from URL without navigation
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('error');
      newParams.delete('error_code');
      newParams.delete('error_description');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back! 🎮');
        }
      } else {
        const { error } = await signUp(email, password, username || email.split('@')[0]);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome to Study Hub! 🎉');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Video Background - optimized for mobile */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/lofi-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle overlay for better card visibility */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />
      
      <Card className="w-full max-w-md p-4 sm:p-6 md:p-8 minecraft-block bg-card/90 backdrop-blur-xl relative z-10 shadow-2xl border-2">
        <div className="space-y-4 sm:space-y-6">
          {/* OAuth Error Banner */}
          {oauthError && (
            <Alert variant="destructive" className="minecraft-block border-2 border-destructive">
              <AlertDescription className="text-xs sm:text-sm font-bold">
                {oauthError}
              </AlertDescription>
            </Alert>
          )}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black arcade-text text-primary">
              {isLogin ? 'LOGIN' : 'SIGN UP'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider">
              {isLogin ? 'Continue Your Study Journey' : 'Start Your Study Journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-black uppercase tracking-wider">
                  Username (Optional)
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="minecraft-block font-bold h-11 text-base"
                  autoComplete="username"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="minecraft-block font-bold h-11 text-base"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="minecraft-block font-bold h-11 text-base"
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-black arcade-text border-2 border-border h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'LOGGING IN...' : 'SIGNING UP...'}
                </>
              ) : (
                <>{isLogin ? 'LOGIN' : 'SIGN UP'}</>
              )}
            </Button>

            {isLogin && (
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-bold text-center w-full"
              >
                Forgot password?
              </button>
            )}
          </form>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-black">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 font-black arcade-text border-2 border-border text-sm sm:text-base"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'CONTINUE WITH GOOGLE'
            )}
          </Button>

          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername('');
                setPassword('');
              }}
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-bold active:scale-95"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showResetPassword && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card p-6 rounded-lg minecraft-block border-2 max-w-sm w-full">
              <h2 className="text-xl font-black arcade-text text-primary mb-4">
                RESET PASSWORD
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="minecraft-block font-bold h-11"
                  autoComplete="email"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail('');
                    }}
                    className="flex-1 font-black border-2"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 font-black border-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'SEND LINK'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;

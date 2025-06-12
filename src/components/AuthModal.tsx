import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AuthError } from "@supabase/supabase-js";
import ProfileSetup from "./ProfileSetup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

type AuthMode = 'options' | 'email-sign-in' | 'email-sign-up';

const AuthModal = ({ isOpen, onClose, initialMode = 'email-sign-in' }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [emailVerificationNotice, setEmailVerificationNotice] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const { signIn, setNeedsProfileSetup } = useAuth();

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (authMode === 'email-sign-up' && !fullName) {
      toast.error('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'email-sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) throw error;
        
        if (data?.session) {
          // User is authenticated, show profile setup
          setNeedsProfileSetup(true);
          setShowProfileSetup(true);
          toast.success('Account created successfully! Please complete your profile.');
        } else {
          // No session, email verification required
          setEmailVerificationNotice('Account created! Please check your email to verify your account before continuing.');
          toast.success('Account created! Please check your email to verify your account before continuing.');
          // Do NOT show profile setup modal
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success('Successfully signed in!');
        onClose();
      }
    } catch (error) {
      console.error('Email auth error:', error);
      const authError = error as AuthError;
      toast.error(authError.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSetupClose = () => {
    setShowProfileSetup(false);
    onClose();
  };

  // Resend verification email handler
  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err) {
      toast.error('Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderEmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      {authMode === 'email-sign-up' && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            required
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : authMode === 'email-sign-up' ? 'Sign Up' : 'Sign In'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setAuthMode('options')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to options
      </Button>
      <div className="text-center text-sm">
        {authMode === 'email-sign-in' ? (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={() => setAuthMode('email-sign-up')}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={() => setAuthMode('email-sign-in')}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </form>
  );

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[90%] mx-auto px-5 sm:px-6 rounded-lg bg-gray-900 text-white border-gray-800">
        {emailVerificationNotice && (
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 text-center font-medium flex flex-col items-center gap-2">
            <span>{emailVerificationNotice} After verifying, please refresh or sign in again.</span>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? 'Resending...' : 'Resend Verification Email'}
            </Button>
          </div>
        )}
        {renderEmailForm()}
      </DialogContent>
    </Dialog>
    {showProfileSetup && (
      <ProfileSetup 
        isOpen={showProfileSetup} 
        onClose={handleProfileSetupClose} 
      />
    )}
    </>
  );
};

export default AuthModal;
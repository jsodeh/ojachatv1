import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Add a type for the user profile
interface UserProfile {
  id: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  needsProfileSetup: boolean;
  setNeedsProfileSetup: (value: boolean) => void;
  signIn: (provider: 'google' | 'email') => Promise<void>;
  signOut: () => Promise<void>;
  checkProfileSetup: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isSessionRefreshing, setIsSessionRefreshing] = useState(false);

  // Fetch user profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  // Refresh user profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        // Check if profile setup is needed
        setNeedsProfileSetup(!profileData.phone_number);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [user, fetchProfile]);

  // Check if user has completed profile setup (has phone number)
  const checkProfileSetup = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Use the existing profile data if available
      if (profile) {
        return !profile.phone_number;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error checking profile:', error);
        return false;
      }
      
      // Return true if profile is incomplete (needs setup)
      return !data.phone_number;
    } catch (error) {
      console.error('Error checking profile setup:', error);
      return false;
    }
  }, [user, profile]);

  // Refresh the user session to ensure fresh tokens
  const refreshSession = useCallback(async () => {
    if (isSessionRefreshing || !user) return;
    
    try {
      setIsSessionRefreshing(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (data.session) {
        setUser(data.session.user);
        
        // Also refresh the profile
        const profileData = await fetchProfile(data.session.user.id);
        if (profileData) {
          setProfile(profileData);
          setNeedsProfileSetup(!profileData.phone_number);
        }
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
    } finally {
      setIsSessionRefreshing(false);
    }
  }, [user, isSessionRefreshing, fetchProfile]);

  // Set up a timer to refresh the session periodically
  useEffect(() => {
    if (!user) return;
    
    // Refresh session every 50 minutes to prevent token expiration
    const intervalId = setInterval(refreshSession, 50 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, refreshSession]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile data
        const profileData = await fetchProfile(session.user.id);
        if (profileData) {
          setProfile(profileData);
          setNeedsProfileSetup(!profileData.phone_number);
        } else {
          setNeedsProfileSetup(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setNeedsProfileSetup(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile data
        const profileData = await fetchProfile(session.user.id);
        if (profileData) {
          setProfile(profileData);
          setNeedsProfileSetup(!profileData.phone_number);
        } else {
          setNeedsProfileSetup(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setNeedsProfileSetup(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (provider: 'google' | 'email') => {
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      }
      // Email sign in is handled in the AuthModal component
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        needsProfileSetup,
        setNeedsProfileSetup,
        signIn,
        signOut,
        checkProfileSetup,
        refreshProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
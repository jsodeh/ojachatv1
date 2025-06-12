import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email?: string;
  avatar_url?: string;
  full_name?: string;
  phone_number?: string;
}

export const useUser = () => {
  const { user: authUser, profile: authProfile, signOut: authSignOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a combined user object from auth user and profile
  const user = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id,
      email: authUser.email,
      avatar_url: authProfile?.avatar_url,
      full_name: authProfile?.full_name || authUser.user_metadata?.full_name,
      phone_number: authProfile?.phone_number
    } as User;
  }, [authUser, authProfile]);

  // Set loading to false once we have either a user or confirmation of no user
  useEffect(() => {
    if (authUser !== undefined) {
      setLoading(false);
    }
  }, [authUser]);

  const signOut = async () => {
    try {
      await authSignOut();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    }
  };

  // Method to refresh user data
  const refreshUser = async () => {
    try {
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh user'));
      throw err;
    }
  };

  return { user, loading, error, signOut, refreshUser };
}; 
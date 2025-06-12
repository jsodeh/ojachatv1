import { useState, useRef, useEffect } from 'react';
import { User, LogOut, CreditCard, ChevronDown, Crown, RefreshCw } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProfileSetup from './ProfileSetup';
import SubscriptionModal from './SubscriptionModal';

export function AccountDropdown() {
  const { user, signOut } = useUser();
  const { profile, needsProfileSetup, setNeedsProfileSetup, refreshProfile, refreshSession } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show profile setup modal if needed
  useEffect(() => {
    if (needsProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [needsProfileSetup]);

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    const displayName = profile?.full_name || user?.full_name || '';
    
    if (!displayName) return 'U';
    
    const names = displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    setShowProfileSetup(true);
  };
  
  const handleSubscriptionClick = () => {
    setIsOpen(false);
    setShowSubscriptionModal(true);
  };
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Refresh both session and profile
      await refreshSession();
      await refreshProfile();
      
      toast.success('Account data refreshed');
    } catch (error) {
      console.error('Error refreshing account data:', error);
      toast.error('Failed to refresh account data');
    } finally {
      setIsRefreshing(false);
      setIsOpen(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
    setIsOpen(false);
  };
  
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center space-x-2 rounded-full p-1 hover:bg-white/10"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || user?.avatar_url || ''} alt={profile?.full_name || user?.full_name || 'User'} />
            <AvatarFallback className="bg-green-200 text-green-800">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                Signed in as
              </div>
              <div className="px-4 py-2 border-b dark:border-gray-700">
                <p className="text-sm font-medium">{profile?.full_name || user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={handleEditProfile}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </div>
              </button>
              
              <button
                onClick={handleSubscriptionClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </div>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Account'}
                </div>
              </button>
              
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
      />
      
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
} 
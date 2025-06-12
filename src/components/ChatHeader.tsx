import { Settings, AlertCircle, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import AuthModal from "./AuthModal";
import ProfileSetup from "./ProfileSetup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AccountDropdown } from "./AccountDropdown";

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
}

const ChatHeader = ({ isSidebarOpen = true, onToggle, onNewChat }: ChatHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, needsProfileSetup } = useAuth();
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [authMode, setAuthMode] = useState<'options' | 'email-sign-in' | 'email-sign-up'>('options');
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show profile setup modal if needed
  useEffect(() => {
    if (needsProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [needsProfileSetup]);

  const handleSignUp = () => {
    setAuthMode('email-sign-up');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('email-sign-in');
    setShowAuthModal(true);
  };

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    
    const names = user.full_name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <>
      <div className="fixed top-0 z-30 w-full border-b border-grok-light-border dark:border-grok-dark-border bg-grok-light-background dark:bg-grok-dark-background backdrop-blur-sm left-0 right-0">
        <div className="flex h-[60px] items-center justify-between px-4 sm:px-6 max-w-[820px] mx-auto w-full">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="bg-white rounded-md p-1 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}ojastack.png`}
                  alt="OjaStack"
                  className="h-6 w-6"
                />
              </div>
              <span className="ml-2 text-grok-light-text-primary dark:text-grok-dark-text-primary font-medium text-lg hidden md:inline">OjaChat</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-grok-light-text-primary dark:text-grok-dark-text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-grok-light-text-primary dark:text-grok-dark-text-primary" />
              )}
            </button>
            
            <button 
              onClick={onToggle}
              className="p-2 text-grok-light-text-primary dark:text-grok-dark-text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center">
                <AccountDropdown />
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSignUp}
                  className="px-3 py-1.5 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-grok-light-text-primary dark:text-grok-dark-text-primary text-sm"
                >
                  Sign up
                </button>
                {!isMobile && (
                  <button 
                    onClick={handleSignIn}
                    className="px-3 py-1.5 rounded-full hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-grok-light-text-primary dark:text-grok-dark-text-primary text-sm"
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}  
      />
      
      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
      />
    </>
  );
};

export default ChatHeader;
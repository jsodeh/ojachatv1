import { X, Video, Users, ShoppingCart, Settings, AlertCircle, Sun, Moon, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChatSession } from '@/types/chat';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/hooks/useUser';
import { useAuthWrapper } from '@/components/AuthWrapper';
import SubscriptionModal from "./SubscriptionModal";
import ProfileSetup from "./ProfileSetup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onNewChat?: () => void;
  chatSessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onCartClick: () => void;
}

const Sidebar = ({ isOpen, onToggle, isMobile = false, onNewChat, chatSessions, currentSessionId, onSessionSelect, onCartClick }: SidebarProps) => {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, signOut, needsProfileSetup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const authWrapper = useAuthWrapper();

  // Show profile setup if needed
  useEffect(() => {
    if (needsProfileSetup && isAuthenticated) {
      setShowProfileSetup(true);
    }
  }, [needsProfileSetup, isAuthenticated]);

  const groupedSessions = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const lastWeek = today - 86400000 * 7;
    const lastMonth = today - 86400000 * 30;

    return {
      "Today": chatSessions.filter(s => s.timestamp >= today),
      "Yesterday": chatSessions.filter(s => s.timestamp >= yesterday && s.timestamp < today),
      "Previous 7 Days": chatSessions.filter(s => s.timestamp >= lastWeek && s.timestamp < yesterday),
      "Previous 30 Days": chatSessions.filter(s => s.timestamp >= lastMonth && s.timestamp < lastWeek),
    };
  }, [chatSessions]);

  const handleNewChatClick = () => {
    setShowNewChatDialog(true);
  };

  const confirmNewChat = () => {
    setShowNewChatDialog(false);
    onNewChat?.();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onToggle(); // Close sidebar after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    
    const names = user.full_name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const NewChatDialog = () => (
    <AlertDialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start New Chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This will end your current chat session. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmNewChat}>Start New Chat</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const ChatList = () => (
    <div className="mt-4 flex flex-col gap-4">
      <div className="px-3 py-2 text-xs font-semibold uppercase">Messages</div>
      {Object.entries(groupedSessions).map(([timeframe, sessions]) => sessions.length > 0 && (
        <div key={timeframe}>
          <div className="px-3 py-2 text-xs text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary">{timeframe}</div>
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => {
                // Check if authenticated before allowing session selection
                if (!isAuthenticated) {
                  authWrapper.showAuthModal();
                  return;
                }
                
                onSessionSelect(session.id);
                onToggle(); // Close sidebar after selection on mobile
              }}
              className={cn(
                "group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover cursor-pointer",
                session.id === currentSessionId && "bg-grok-light-button-bg dark:bg-grok-dark-button-bg"
              )}
            >
              <span className="text-sm truncate">{session.title}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const MenuItems = () => (
    <div className="flex flex-col gap-2 px-2 py-2">
      <div className="px-3 py-2 text-xs font-semibold uppercase">Menu</div>
      <div 
        className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover cursor-pointer"
        onClick={() => {
          if (!isAuthenticated) {
            authWrapper.showAuthModal();
            return;
          }
          // Handle Oja Live click
        }}
      >
        <div className="h-6 w-6 flex items-center justify-center">
          <Video className="h-4 w-4" />
        </div>
        <span className="text-sm">Oja Live!</span>
      </div>
      <div 
        className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover cursor-pointer"
        onClick={() => {
          if (!isAuthenticated) {
            authWrapper.showAuthModal();
            return;
          }
          // Handle Oja Groups click
        }}
      >
        <div className="h-6 w-6 flex items-center justify-center">
          <Users className="h-4 w-4" />
        </div>
        <span className="text-sm">Oja Groups</span>
      </div>
      <div 
        onClick={() => {
          if (!isAuthenticated) {
            authWrapper.showAuthModal();
            return;
          }
          onCartClick();
          onToggle(); // Close sidebar after clicking cart
        }}
        className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover cursor-pointer"
      >
        <div className="h-6 w-6 flex items-center justify-center relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-sm">Cart</span>
      </div>
    </div>
  );

  // Mobile Controls - compact icon-only controls for the bottom of the sidebar
  const MobileControls = () => {
    if (!isMobile) return null;
    
    return (
      <div className="flex justify-center gap-4 py-3 border-t border-grok-light-border dark:border-grok-dark-border mt-auto">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
          aria-label="Help and information"
          onClick={() => {
            if (!isAuthenticated) {
              authWrapper.showAuthModal();
              return;
            }
            // Handle help click
          }}
        >
          <AlertCircle className="h-5 w-5" />
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
          aria-label="Settings"
          onClick={() => {
            if (!isAuthenticated) {
              authWrapper.showAuthModal();
              return;
            }
            // Handle settings click
          }}
        >
          <Settings className="h-5 w-5" />
        </button>
        
        {isAuthenticated && (
          <button 
            onClick={handleSignOut} 
            className="p-2 rounded-full hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  // User profile section for mobile
  const UserProfile = () => {
    if (!isAuthenticated || !user) return null;
    
    return (
      <div 
        className="flex items-center gap-3 p-3 border-t border-grok-light-border dark:border-grok-dark-border cursor-pointer"
        onClick={() => setShowProfileSetup(true)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar_url || ''} alt={user?.full_name || 'User'} />
          <AvatarFallback className="bg-green-200 text-green-800">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="font-medium truncate">{user.full_name || 'User'}</div>
          <div className="text-xs text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary truncate">
            {user.email}
          </div>
        </div>
      </div>
    );
  };

  // Render an overlay sidebar that doesn't push content
  return (
    <>
      {/* Backdrop - only show when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-grok-light-background dark:bg-grok-dark-background border-r border-grok-light-border dark:border-grok-dark-border transition-all duration-300 overflow-hidden flex flex-col",
          isOpen ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex h-full w-full flex-col" aria-label="Chat history">
          <div className="flex justify-between h-[60px] items-center px-3">
            <div className="flex items-center">
              <div className="bg-white rounded-md p-1 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}ojastack.png`}
                  alt="OjaStack"
                  className="h-6 w-6"
                />
              </div>
              <span className="ml-2 text-grok-light-text-primary dark:text-grok-dark-text-primary font-medium text-lg">OjaChat</span>
            </div>
            <button 
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isAuthenticated && isMobile && <UserProfile />}

          <div className="flex-col flex-1 transition-opacity duration-500 overflow-y-auto px-3">
            <MenuItems />
            <ChatList />
          </div>

          <MobileControls />

          {/* Always show Upgrade Plan button regardless of auth status */}
          <div className="flex flex-col py-2 border-t border-grok-light-border dark:border-grok-dark-border px-3">
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  authWrapper.showAuthModal();
                  return;
                }
                setShowSubscriptionModal(true);
              }}
              className="group flex gap-2 p-2.5 text-sm items-start hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover rounded-lg px-2 text-left w-full"
            >
              <span className="flex w-full flex-row justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-grok-light-border dark:border-grok-dark-border">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <span>Upgrade plan</span>
                    <span className="text-xs text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary">More features</span>
                  </div>
                </div>
              </span>
            </button>
          </div>
        </nav>
        <NewChatDialog />
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
        <ProfileSetup 
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
        />
      </div>
    </>
  );
};

export default Sidebar;
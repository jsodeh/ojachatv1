import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAnonymousChatCount, ANONYMOUS_CHAT_LIMIT } from '@/utils/anonymousLimits';

interface AnonymousLimitIndicatorProps {
  onSignUpClick?: () => void;
  className?: string;
}

export function AnonymousLimitIndicator({ onSignUpClick, className = '' }: AnonymousLimitIndicatorProps) {
  const { isAuthenticated } = useAuth();
  const [remainingChats, setRemainingChats] = useState(ANONYMOUS_CHAT_LIMIT);

  useEffect(() => {
    // Only show for non-authenticated users
    if (!isAuthenticated) {
      const updateRemainingChats = () => {
        const used = getAnonymousChatCount();
        const remaining = Math.max(0, ANONYMOUS_CHAT_LIMIT - used);
        setRemainingChats(remaining);
      };
      
      // Update on component mount
      updateRemainingChats();
      
      // Set up a listener for storage changes from other tabs
      const handleStorageChange = () => {
        updateRemainingChats();
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  return (
    <div className={`flex justify-between items-center gap-2 ${className}`}>
      <div className="text-xs text-white bg-green-900 dark:bg-green-800 py-2 px-3 rounded-lg">
        {remainingChats}K daily chats remaining.
      </div>
      
      <button 
        onClick={onSignUpClick}
        className="text-xs py-2 px-3 font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg"
      >
        Upgrade to OjaPRIME
      </button>
    </div>
  );
} 
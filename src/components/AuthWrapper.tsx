import { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

// Create a context to expose auth modal control functions to children
export interface AuthWrapperContextType {
  showAuthModal: () => void;
  hideAuthModal: () => void;
  isAuthenticated: boolean;
}

const AuthWrapperContext = createContext<AuthWrapperContextType | undefined>(undefined);

export const useAuthWrapper = () => {
  const context = useContext(AuthWrapperContext);
  if (!context) {
    throw new Error('useAuthWrapper must be used within an AuthWrapper');
  }
  return context;
};

interface AuthWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component that allows user to view content without immediate authentication
 * but provides methods to trigger authentication when needed
 */
export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set loading to false once we have determined auth status
    setIsLoading(false);
  }, [isAuthenticated]);

  // Show loading state while determining auth status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-grok-light-background dark:bg-grok-dark-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Provide context to show auth modal when needed
  const contextValue: AuthWrapperContextType = {
    showAuthModal: () => {
      // We'll handle this through events now instead of directly
      const event = new CustomEvent('ojachat:show-auth-modal');
      window.dispatchEvent(event);
    },
    hideAuthModal: () => {
      const event = new CustomEvent('ojachat:hide-auth-modal');
      window.dispatchEvent(event);
    },
    isAuthenticated
  };

  return (
    <AuthWrapperContext.Provider value={contextValue}>
      {children}
    </AuthWrapperContext.Provider>
  );
} 
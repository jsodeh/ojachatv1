import { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import LimitReachedModal from './LimitReachedModal';

interface FeatureCheckProps {
  featureName: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component to conditionally render content based on whether the user has access to a feature
 */
export function FeatureCheck({ featureName, fallback, children }: FeatureCheckProps) {
  const { hasFeatureAccess } = useSubscription();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await hasFeatureAccess(featureName);
        setHasAccess(access);
      } catch (error) {
        console.error(`Error checking access for ${featureName}:`, error);
        setHasAccess(false);
      }
    };
    
    checkAccess();
  }, [featureName, hasFeatureAccess]);
  
  // Still loading
  if (hasAccess === null) {
    return null;
  }
  
  // User has access to this feature
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // User doesn't have access, show fallback or null
  return fallback ? <>{fallback}</> : null;
}

interface UsageLimitCheckProps {
  limitName: string;
  fallback?: ReactNode;
  children: ReactNode;
  limitType?: 'chats' | 'words' | 'deliveries' | 'voice';
}

/**
 * Component to conditionally render content based on whether the user has reached a usage limit
 * 
 * Example:
 * ```jsx
 * <UsageLimitCheck 
 *   limitName="chats_per_month" 
 *   limitType="chats"
 *   fallback={<p>You've reached your chat limit</p>}
 * >
 *   <ChatComponent />
 * </UsageLimitCheck>
 * ```
 */
export function UsageLimitCheck({ limitName, fallback, children, limitType = 'chats' }: UsageLimitCheckProps) {
  const { hasReachedLimit } = useSubscription();
  const [limitReached, setLimitReached] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const reached = await hasReachedLimit(limitName);
        setLimitReached(reached);
        
        // Show modal if limit is reached
        if (reached) {
          setShowModal(true);
        }
      } catch (error) {
        console.error(`Error checking limit for ${limitName}:`, error);
        setLimitReached(true); // Fail safe
      }
    };
    
    checkLimit();
  }, [limitName, hasReachedLimit]);
  
  const handleUpgradeClick = () => {
    // Navigate to subscription page
    window.location.href = '/subscription';
  };

  // Still loading
  if (limitReached === null) {
    return null;
  }
  
  // User has not reached the limit
  if (!limitReached) {
    return <>{children}</>;
  }
  
  // User has reached the limit, show limit notification modal and fallback
  return (
    <>
      <LimitReachedModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        limitType={limitType}
        onUpgradeClick={handleUpgradeClick}
      />
      {fallback ? <>{fallback}</> : null}
    </>
  );
}

/**
 * A hook for manually tracking feature usage
 */
export function useTrackFeatureUsage() {
  const { trackUsage } = useSubscription();

  const recordUsage = async (featureName: string, amount: number = 1) => {
    try {
      await trackUsage(featureName, amount);
      return true;
    } catch (error) {
      console.error(`Error tracking usage for ${featureName}:`, error);
      return false;
    }
  };

  return { recordUsage };
} 
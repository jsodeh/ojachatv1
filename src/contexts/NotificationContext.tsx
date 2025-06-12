import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

// Add OneSignal to window type
declare global {
  interface Window {
    OneSignal: any;
  }
}

interface NotificationContextType {
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Initialize OneSignal
  useEffect(() => {
    if (typeof window !== 'undefined' && window.OneSignal) {
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(function() {
        window.OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true, // For local development
        });

        // Check if user is already subscribed
        window.OneSignal.isPushNotificationsEnabled().then((isEnabled: boolean) => {
          setIsSubscribed(isEnabled);
        });
      });
    }
  }, []);

  // Update subscription status when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setIsSubscribed(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onesignal_player_id')
        .eq('id', user.id)
        .single();

      if (profile?.onesignal_player_id) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribe = async () => {
    if (!user) return;

    try {
      // Request notification permission
      const permission = await window.OneSignal.Notifications.requestPermission();
      
      if (permission) {
        // Get OneSignal Player ID
        const playerId = await window.OneSignal.User.PushSubscription.getId();
        
        if (playerId) {
          // Update profile with Player ID
          await supabase
            .from('profiles')
            .update({ onesignal_player_id: playerId })
            .eq('id', user.id);

          // Set External User ID in OneSignal
          await window.OneSignal.login(user.id);
          
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  const unsubscribe = async () => {
    if (!user) return;

    try {
      // Remove External User ID from OneSignal
      await window.OneSignal.logout();
      
      // Clear Player ID from profile
      await supabase
        .from('profiles')
        .update({ onesignal_player_id: null })
        .eq('id', user.id);
      
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ isSubscribed, subscribe, unsubscribe }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { 
  Subscription, 
  SubscriptionPlan, 
  DeliveryTransaction,
  SubscriptionHistory
} from '@/types/subscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refreshSubscription: () => Promise<void>;
  upgradeSubscription: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  getSubscriptionHistory: () => Promise<SubscriptionHistory[]>;
  createDeliveryTransaction: (details: {
    address: string;
    type: 'standard' | 'express';
    amount: number;
  }) => Promise<DeliveryTransaction>;
  getDeliveryTransactions: () => Promise<DeliveryTransaction[]>;
  hasFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await subscriptionService.getSubscription(user.id);
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const refreshSubscription = async () => {
    setIsLoading(true);
    await fetchSubscription();
  };

  const upgradeSubscription = async (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    if (!user) throw new Error('User must be authenticated to upgrade subscription');
    
    try {
      if (subscription) {
        await subscriptionService.updateSubscription(subscription.id, {
          plan,
          billing_cycle: billingCycle,
          price: subscriptionService.getPlanPrice(plan, billingCycle),
          features: subscriptionService.getPlanFeatures(plan)
        });
      } else {
        await subscriptionService.createSubscription(user.id, plan, billingCycle);
      }
      await refreshSubscription();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upgrade subscription'));
      throw err;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) throw new Error('No active subscription to cancel');
    
    try {
      await subscriptionService.cancelSubscription(subscription.id);
      await refreshSubscription();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel subscription'));
      throw err;
    }
  };

  const getSubscriptionHistory = async () => {
    if (!subscription) throw new Error('No active subscription');
    return subscriptionService.getSubscriptionHistory(subscription.id);
  };

  const createDeliveryTransaction = async (details: {
    address: string;
    type: 'standard' | 'express';
    amount: number;
  }) => {
    if (!user || !subscription) throw new Error('User must be authenticated and have an active subscription');
    
    try {
      const transaction = await subscriptionService.createDeliveryTransaction(
        user.id,
        subscription.id,
        details
      );
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create delivery transaction'));
      throw err;
    }
  };

  const getDeliveryTransactions = async () => {
    if (!user) throw new Error('User must be authenticated');
    return subscriptionService.getDeliveryTransactions(user.id);
  };

  const hasFeature = (feature: string) => {
    return subscription?.features.includes(feature as any) ?? false;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        refreshSubscription,
        upgradeSubscription,
        cancelSubscription,
        getSubscriptionHistory,
        createDeliveryTransaction,
        getDeliveryTransactions,
        hasFeature
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 
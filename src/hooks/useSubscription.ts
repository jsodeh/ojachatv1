import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser'; // Adjust based on your auth setup
import { SubscriptionService } from '@/lib/services/subscription-service';
import type { SubscriptionPlan, UserSubscription, SubscriptionUsage, PaymentLink } from '@/types/subscriptions';

// Create a single instance of the service
const subscriptionService = new SubscriptionService();

export const useSubscription = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<Record<string, PaymentLink[]>>({});
  const [discountInfo, setDiscountInfo] = useState<{ 
    hasDiscount: boolean, 
    discountPercent: number,
    original: number,
    discounted: number,
    savings: number
  }>({
    hasDiscount: false,
    discountPercent: 0,
    original: 0,
    discounted: 0,
    savings: 0
  });

  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const availablePlans = await subscriptionService.getPlans();
      setPlans(availablePlans);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plans'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user subscription
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user?.id) {
      setCurrentSubscription(null);
      return;
    }

    try {
      setLoading(true);
      const subscription = await subscriptionService.getCurrentSubscription(user.id);
      setCurrentSubscription(subscription);
      
      // If we have a subscription, also fetch discount info
      if (subscription) {
        const discount = await subscriptionService.hasActiveDiscount(user.id);
        const pricing = await subscriptionService.getDiscountedPrice(user.id);
        
        setDiscountInfo({
          hasDiscount: discount.hasDiscount,
          discountPercent: discount.discountPercent,
          original: pricing.original,
          discounted: pricing.discounted,
          savings: pricing.savings
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch payment links
  const fetchPaymentLinks = useCallback(async () => {
    try {
      const links = await subscriptionService.getAllPaymentLinks();
      setPaymentLinks(links);
    } catch (err) {
      console.error('Error fetching payment links:', err);
    }
  }, []);

  // Fetch user usage
  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setUsage([]);
      return;
    }

    try {
      const usageData = await subscriptionService.getUserUsage(user.id);
      setUsage(usageData);
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  }, [user?.id]);

  // Check if user has access to a feature
  const hasFeatureAccess = useCallback(async (featureName: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      return await subscriptionService.hasFeatureAccess(user.id, featureName);
    } catch (err) {
      console.error('Error checking feature access:', err);
      return false;
    }
  }, [user?.id]);

  // Check if user has reached a limit
  const hasReachedLimit = useCallback(async (limitName: string): Promise<boolean> => {
    if (!user?.id) return true;
    try {
      return await subscriptionService.hasReachedLimit(user.id, limitName);
    } catch (err) {
      console.error('Error checking limit:', err);
      return true; // Fail safe
    }
  }, [user?.id]);

  // Get limit for a feature
  const getFeatureLimit = useCallback(async (limitName: string): Promise<number> => {
    if (!user?.id) return 0;
    try {
      return await subscriptionService.getFeatureLimit(user.id, limitName);
    } catch (err) {
      console.error('Error fetching feature limit:', err);
      return 0;
    }
  }, [user?.id]);

  // Subscribe to a plan
  const subscribeToPlan = useCallback(async (planId: string, paymentReference?: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      const subscription = await subscriptionService.subscribeToPlan(user.id, planId, 'active', paymentReference);
      setCurrentSubscription(subscription);
      return subscription;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe to plan'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (cancelImmediately: boolean = false) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(user.id, cancelImmediately);
      
      if (cancelImmediately) {
        setCurrentSubscription(null);
      } else if (currentSubscription) {
        setCurrentSubscription({
          ...currentSubscription,
          cancel_at_period_end: true,
          auto_renew: false
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentSubscription]);

  // Track usage of a feature
  const trackUsage = useCallback(async (featureName: string, amount: number = 1) => {
    if (!user?.id) return;
    try {
      await subscriptionService.incrementUsage(user.id, featureName, amount);
      // Refresh usage after tracking
      fetchUsage();
    } catch (err) {
      console.error('Error tracking usage:', err);
    }
  }, [user?.id, fetchUsage]);

  // Load initial data
  useEffect(() => {
    fetchPlans();
    fetchPaymentLinks();
  }, [fetchPlans, fetchPaymentLinks]);

  useEffect(() => {
    if (user?.id) {
      fetchCurrentSubscription();
      fetchUsage();
    } else {
      setCurrentSubscription(null);
      setUsage([]);
      setDiscountInfo({
        hasDiscount: false,
        discountPercent: 0,
        original: 0,
        discounted: 0,
        savings: 0
      });
    }
  }, [user?.id, fetchCurrentSubscription, fetchUsage]);

  return {
    loading,
    plans,
    currentSubscription,
    usage,
    error,
    paymentLinks,
    discountInfo,
    hasFeatureAccess,
    hasReachedLimit,
    getFeatureLimit,
    subscribeToPlan,
    cancelSubscription,
    trackUsage,
    refreshSubscription: fetchCurrentSubscription,
    refreshUsage: fetchUsage
  };
}; 
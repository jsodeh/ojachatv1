import { supabase } from '../supabase';
import type { Tables } from '../supabase';
import type { UserSubscription } from '@/types/subscriptions';

// Define the expected shape of subscription data from the query
interface SubscriptionWithPlan {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  end_date: string | null;
  subscription_plans: {
    price: number;
  };
}

/**
 * This service handles automatic resetting of usage limits.
 * It can be called from the client, but ideally it would be run as a scheduled function
 * on your server or using Supabase Edge Functions with a CRON trigger.
 */
export class UsageResetService {
  /**
   * Check and reset usage limits for subscriptions that have reached their renewal date
   * This should be called once per day via a scheduled job
   */
  async resetUsageForExpiredPeriods(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Get subscriptions where the end date has passed or free users who haven't had a reset in 31 days
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id, 
          user_id, 
          plan_id,
          status,
          end_date,
          subscription_plans(price)
        `)
        .or(`end_date.lt.${now},and(subscription_plans.price.eq.0,updated_at.lt.${new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()})`)
        .eq('status', 'active');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      // Transform the data to match our expected format
      const subscriptionsToReset = data.map(sub => ({
        ...sub,
        subscription_plans: {
          price: sub.subscription_plans[0]?.price || 0
        }
      })) as SubscriptionWithPlan[];
      
      // Get list of user IDs to reset
      const userIds = subscriptionsToReset.map(sub => sub.user_id);
      
      // Reset usage for these users
      const { error: resetError } = await supabase
        .from('subscription_usage')
        .update({
          used_amount: 0,
          reset_date: now
        })
        .in('user_id', userIds);
      
      if (resetError) throw resetError;
      
      // Update subscription end dates for paid plans (extend by another period)
      for (const sub of subscriptionsToReset) {
        // Skip free plans as they don't have end dates
        if (sub.subscription_plans.price > 0 && sub.end_date) {
          const currentEndDate = new Date(sub.end_date);
          
          // Add 1 month to the current end date
          const newEndDate = new Date(currentEndDate);
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          
          await supabase
            .from('user_subscriptions')
            .update({
              end_date: newEndDate.toISOString(),
              updated_at: now
            })
            .eq('id', sub.id);
        } else {
          // For free plans, just update the updated_at date
          await supabase
            .from('user_subscriptions')
            .update({
              updated_at: now
            })
            .eq('id', sub.id);
        }
      }
      
      return subscriptionsToReset.length;
    } catch (error) {
      console.error('Error resetting usage limits:', error);
      throw error;
    }
  }
  
  /**
   * Manually reset usage for a specific user
   */
  async resetUsageForUser(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Reset all usage counters for this user
      const { error } = await supabase
        .from('subscription_usage')
        .update({
          used_amount: 0,
          reset_date: now
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update the subscription's updated_at timestamp
      await supabase
        .from('user_subscriptions')
        .update({
          updated_at: now
        })
        .eq('user_id', userId);
        
    } catch (error) {
      console.error('Error manually resetting usage:', error);
      throw error;
    }
  }
} 
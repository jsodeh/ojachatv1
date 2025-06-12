import { supabase } from '../supabase';
import type { Tables } from '../supabase';
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsage,
  SubscriptionPlanInsert,
  UserSubscriptionInsert,
  SubscriptionUsageInsert,
  SubscriptionStatus,
  PaymentLink
} from '@/types/subscriptions';

export class SubscriptionService {
  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data as SubscriptionPlan[];
  }

  /**
   * Get a specific subscription plan by ID
   */
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as SubscriptionPlan;
  }

  /**
   * Get the current user's subscription
   */
  async getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as unknown as UserSubscription;
  }

  /**
   * Check if a user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || !subscription.plan) return false;
    
    // Check if feature exists in the plan
    return subscription.plan.features[featureName] === true;
  }

  /**
   * Get the limit for a specific feature for this user
   * Returns -1 for unlimited
   */
  async getFeatureLimit(userId: string, limitName: string): Promise<number> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || !subscription.plan) return 0;
    
    return subscription.plan.limits[limitName] ?? 0;
  }

  /**
   * Check if a user has reached their usage limit for a specific feature
   */
  async hasReachedLimit(userId: string, featureName: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription) return true; // No subscription means limits reached
    
    const limit = await this.getFeatureLimit(userId, featureName);
    if (limit === -1) return false; // Unlimited
    
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('used_amount')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return false; // No usage record yet
      throw error;
    }
    
    return (data?.used_amount ?? 0) >= limit;
  }

  /**
   * Increment usage for a specific feature
   */
  async incrementUsage(userId: string, featureName: string, amount: number = 1): Promise<void> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription) return;
    
    const { data: existingUsage, error: fetchError } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (existingUsage) {
      // Update existing usage
      const { error: updateError } = await supabase
        .from('subscription_usage')
        .update({
          used_amount: (existingUsage.used_amount || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUsage.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new usage record
      const { error: insertError } = await supabase
        .from('subscription_usage')
        .insert({
          user_id: userId,
          subscription_id: subscription.id,
          feature_name: featureName,
          used_amount: amount
        });
      
      if (insertError) throw insertError;
    }
  }

  /**
   * Subscribe a user to a plan
   */
  async subscribeToPlan(
    userId: string, 
    planId: string, 
    status: SubscriptionStatus = 'active',
    paymentReference?: string
  ): Promise<UserSubscription> {
    const plan = await this.getPlanById(planId);
    if (!plan) throw new Error('Subscription plan not found');
    
    // Check if user already has a subscription
    const existing = await this.getCurrentSubscription(userId);
    
    // Define end date based on interval
    let endDate: Date | null = null;
    
    if (plan.interval_type !== 'lifetime') {
      endDate = new Date();
      if (plan.interval_type === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.interval_type === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }
    
    const subscriptionData: UserSubscriptionInsert = {
      user_id: userId,
      plan_id: planId,
      status: status,
      start_date: new Date().toISOString(),
      end_date: endDate ? endDate.toISOString() : null,
      trial_end_date: null,
      auto_renew: true,
      cancel_at_period_end: false,
      payment_provider: 'manual', // Replace with actual payment provider
      payment_reference: paymentReference || null
    };
    
    if (existing) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existing.id)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();
      
      if (error) throw error;
      return data as unknown as UserSubscription;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();
      
      if (error) throw error;
      return data as unknown as UserSubscription;
    }
  }

  /**
   * Cancel a user's subscription
   */
  async cancelSubscription(userId: string, cancelImmediately: boolean = false): Promise<void> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription) throw new Error('No active subscription found');
    
    const updateData = {
      cancel_at_period_end: !cancelImmediately,
      auto_renew: false,
      status: cancelImmediately ? 'canceled' as SubscriptionStatus : undefined
    };
    
    const { error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscription.id);
    
    if (error) throw error;
  }

  /**
   * Get usage statistics for a user
   */
  async getUserUsage(userId: string): Promise<SubscriptionUsage[]> {
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as SubscriptionUsage[];
  }

  /**
   * Reset usage counters (typically called at the beginning of a billing cycle)
   */
  async resetUsage(userId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_usage')
      .update({ used_amount: 0, reset_date: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  /**
   * Get payment links for a specific plan
   */
  async getPaymentLinks(planId: string): Promise<PaymentLink[]> {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('plan_id', planId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data as PaymentLink[];
  }

  /**
   * Get all payment links for all plans
   */
  async getAllPaymentLinks(): Promise<Record<string, PaymentLink[]>> {
    const { data, error } = await supabase
      .from('payment_links')
      .select(`
        *,
        plan:subscription_plans(id, name)
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    
    // Group by plan
    const linksByPlan: Record<string, PaymentLink[]> = {};
    data.forEach((link: any) => {
      const planId = link.plan.id;
      if (!linksByPlan[planId]) {
        linksByPlan[planId] = [];
      }
      linksByPlan[planId].push(link);
    });
    
    return linksByPlan;
  }

  /**
   * Check if a subscription has an active discount
   */
  async hasActiveDiscount(userId: string): Promise<{ hasDiscount: boolean, discountPercent: number }> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || !subscription.plan) {
      return { hasDiscount: false, discountPercent: 0 };
    }
    
    const discountPercent = subscription.plan.features.discount_percent;
    const discountMonths = subscription.plan.features.discount_months;
    
    if (!discountPercent || !discountMonths) {
      return { hasDiscount: false, discountPercent: 0 };
    }
    
    // Check if subscription is within discount period
    const startDate = new Date(subscription.start_date);
    const currentDate = new Date();
    const discountEndDate = new Date(startDate);
    discountEndDate.setMonth(startDate.getMonth() + discountMonths);
    
    const hasActiveDiscount = currentDate <= discountEndDate;
    
    return { 
      hasDiscount: hasActiveDiscount, 
      discountPercent: hasActiveDiscount ? discountPercent : 0 
    };
  }

  /**
   * Calculate the price with any active discounts
   */
  async getDiscountedPrice(userId: string): Promise<{ original: number, discounted: number, savings: number }> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || !subscription.plan) {
      return { original: 0, discounted: 0, savings: 0 };
    }
    
    const originalPrice = subscription.plan.price;
    const { hasDiscount, discountPercent } = await this.hasActiveDiscount(userId);
    
    if (!hasDiscount) {
      return { original: originalPrice, discounted: originalPrice, savings: 0 };
    }
    
    const discountMultiplier = (100 - discountPercent) / 100;
    const discountedPrice = originalPrice * discountMultiplier;
    const savings = originalPrice - discountedPrice;
    
    return {
      original: originalPrice,
      discounted: discountedPrice,
      savings: savings
    };
  }
} 
import { supabase } from '@/lib/supabase';
import { 
  Subscription, 
  SubscriptionHistory, 
  DeliveryTransaction,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionFeature
} from '@/types/subscription';

const PLAN_FEATURES: Record<SubscriptionPlan, SubscriptionFeature[]> = {
  free: ['text_chat', 'image_upload'],
  basic: [
    'text_chat',
    'image_upload',
    'image_search',
    'voice_notes',
    'web_shopper',
    'food_delivery',
    'shop_online'
  ],
  premium: [
    'text_chat',
    'image_upload',
    'image_search',
    'voice_notes',
    'screenshare',
    'sms_mode',
    'whatsapp_assistant',
    'auto_shopper',
    'follow_up_calls',
    'web_shopper',
    'food_delivery',
    'shop_online'
  ]
};

const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number }> = {
  free: {
    monthly: 0,
    yearly: 0
  },
  basic: {
    monthly: 9.99,
    yearly: 99.99
  },
  premium: {
    monthly: 19.99,
    yearly: 199.99
  }
};

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<Subscription> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    const subscription: Partial<Subscription> = {
      user_id: userId,
      status: 'active',
      plan,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      features: PLAN_FEATURES[plan],
      auto_renew: true,
      price: PLAN_PRICES[plan][billingCycle],
      currency: 'USD',
      billing_cycle: billingCycle,
      delivery_credits: 0,
      delivery_credit_cost: 5.99
    };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) throw error;

    // Create subscription history entry
    await this.createSubscriptionHistory({
      subscription_id: data.id,
      user_id: userId,
      action: 'created',
      new_plan: plan,
      new_status: 'active',
      timestamp: new Date().toISOString()
    });

    return data;
  },

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    // Create subscription history entry
    await this.createSubscriptionHistory({
      subscription_id: subscriptionId,
      user_id: currentSubscription.user_id,
      action: 'updated',
      previous_plan: currentSubscription.plan,
      new_plan: updates.plan,
      previous_status: currentSubscription.status,
      new_status: updates.status,
      timestamp: new Date().toISOString()
    });

    return data;
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { data: subscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    // Create subscription history entry
    await this.createSubscriptionHistory({
      subscription_id: subscriptionId,
      user_id: subscription.user_id,
      action: 'cancelled',
      previous_plan: subscription.plan,
      previous_status: subscription.status,
      new_status: 'cancelled',
      timestamp: new Date().toISOString()
    });
  },

  async createSubscriptionHistory(history: Partial<SubscriptionHistory>): Promise<void> {
    const { error } = await supabase
      .from('subscription_usage')
      .insert([history]);

    if (error) throw error;
  },

  async getSubscriptionHistory(subscriptionId: string): Promise<SubscriptionHistory[]> {
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createDeliveryTransaction(
    userId: string,
    subscriptionId: string,
    deliveryDetails: {
      address: string;
      type: 'standard' | 'express';
      amount: number;
    }
  ): Promise<DeliveryTransaction> {
    const transaction: Partial<DeliveryTransaction> = {
      user_id: userId,
      subscription_id: subscriptionId,
      amount: deliveryDetails.amount,
      currency: 'USD',
      status: 'pending',
      delivery_address: deliveryDetails.address,
      delivery_type: deliveryDetails.type,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('delivery_transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDeliveryTransaction(
    transactionId: string,
    updates: Partial<DeliveryTransaction>
  ): Promise<DeliveryTransaction> {
    const { data, error } = await supabase
      .from('delivery_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDeliveryTransactions(userId: string): Promise<DeliveryTransaction[]> {
    const { data, error } = await supabase
      .from('delivery_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getPlanFeatures(plan: SubscriptionPlan): SubscriptionFeature[] {
    return PLAN_FEATURES[plan];
  },

  getPlanPrice(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly'): number {
    return PLAN_PRICES[plan][billingCycle];
  }
}; 
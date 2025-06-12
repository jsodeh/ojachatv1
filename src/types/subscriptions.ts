export type SubscriptionInterval = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';

export interface SubscriptionFeatures {
  standard_support?: boolean;
  priority_support?: boolean;
  premium_support?: boolean;
  image_shopping?: boolean;
  online_shopping?: boolean;
  group_shopping?: boolean;
  auto_shopper?: boolean;
  voice_mode?: boolean;
  free_deliveries?: boolean;
  delivery_type?: 'self_pickup' | 'standard' | 'premium';
  discount_percent?: number;
  discount_months?: number;
  [key: string]: any;
}

export interface SubscriptionLimits {
  chats_per_month?: number;
  words_per_month?: number;
  voice_minutes_per_month?: number;
  image_shopping_count?: number;
  online_shopping_count?: number;
  free_deliveries_count?: number;
  [key: string]: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval_type: SubscriptionInterval;
  features: SubscriptionFeatures;
  limits: SubscriptionLimits;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  payment_provider: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  // Optional joined data
  plan?: SubscriptionPlan;
}

export interface SubscriptionUsage {
  id: string;
  user_id: string;
  subscription_id: string;
  feature_name: string;
  used_amount: number;
  reset_date: string | null;
  created_at: string;
  updated_at: string;
}

// Helper types for Supabase operations
export type SubscriptionPlanInsert = Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionPlanUpdate = Partial<SubscriptionPlanInsert>;

export type UserSubscriptionInsert = Omit<UserSubscription, 'id' | 'created_at' | 'updated_at' | 'plan'>;
export type UserSubscriptionUpdate = Partial<UserSubscriptionInsert>;

export type SubscriptionUsageInsert = Omit<SubscriptionUsage, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionUsageUpdate = Partial<SubscriptionUsageInsert>;

export interface PaymentLink {
  id: string;
  plan_id: string;
  provider: string;
  link_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 
-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN ('monthly', 'yearly', 'lifetime')),
  features JSONB,
  limits JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table to track user subscription status
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trial', 'past_due')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create subscription usage tracking table for metered features
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  used_amount INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, subscription_id, feature_name)
);

-- Insert the specified subscription plans
INSERT INTO subscription_plans (name, description, price, currency, interval_type, features, limits)
VALUES 
  -- Free Plan
  (
    'Basic Plan', 
    'Free tier with limited usage', 
    0.00, 
    'NGN',
    'monthly',
    '{
      "text_chat": true,
      "image_shopping": true,
      "online_shopping": true,
      "group_shopping": false,
      "auto_shopper": false,
      "voice_mode": true,
      "free_deliveries": false,
      "self_pickup": true,
      "pay_per_delivery": true,
      "add_to_cart": true
    }',
    '{
      "chats_per_month": 20,
      "words_per_month": 0, -- Free tier is text-based only, words limit not applicable
      "voice_minutes_per_month": 0, -- No voice mode for free
      "image_search_count": -1, -- Unlimited image search for free
      "online_shopping_count": 0, -- No free online shopping for free
      "free_deliveries_count": 0
    }'
  ),
  
  -- Basic Paid Plan
  (
    'Basic', 
    'Enhanced features for growing needs', 
    25000.00, 
    'NGN',
    'monthly',
    '{
      "priority_support": true,
      "image_shopping": true,
      "online_shopping": false, -- Online shopping is a feature of higher tiers
      "group_shopping": false, -- Group shopping is a feature of higher tiers
      "auto_shopper": false,
      "voice_mode": true,
      "free_deliveries": false,
      "self_pickup": true,
      "pay_per_delivery": true,
      "add_to_cart": true,
      "market_runs": true
    }',
    '{
      "chats_per_month": 100,
      "words_per_month": 2000,
      "voice_minutes_per_month": 15,
      "image_search_count": -1, -- Unlimited image search
      "online_shopping_count": 0,
      "market_runs_count": 2,
      "free_deliveries_count": 0
    }'
  ),
  
  -- Premium Paid Plan
  (
    'Premium', 
    'Advanced features and higher limits', 
    80000.00, 
    'NGN',
    'monthly',
    '{
      "standard_support": true,
      "priority_support": true,
      "premium_support": true,
      "image_shopping": true, 
      "online_shopping": false, -- Online shopping is a feature of higher tiers
      "group_shopping": true,
      "auto_shopper": false,
      "voice_mode": true,
      "free_deliveries": false,
      "self_pickup": true,
      "pay_per_delivery": true,
      "add_to_cart": true,
      "market_runs": true,
      "sms_mode": true -- New feature for Premium
    }',
    '{
      "chats_per_month": -1, -- Unlimited
      "words_per_month": -1, -- Unlimited
      "voice_minutes_per_month": 60, -- Up to 1 hour voice mode
      "image_search_count": -1, -- Unlimited
      "online_shopping_count": 0,
      "market_runs_count": 5,
      "free_deliveries_count": 0
    }'
  ),

  -- PRIME Paid Plan
  (
    'PRIME', 
    'Ultimate access with all features and unlimited usage', 
    150000.00, 
    'NGN',
    'monthly',
    '{
      "standard_support": true, -- Assuming all support levels are included
      "priority_support": true,
      "premium_support": true,
      "image_shopping": true,
      "online_shopping": true, -- Unlimited online shopping
      "group_shopping": true,
      "auto_shopper": true, -- Auto Shopper Mode
      "voice_mode": true, -- Unlimited Voice Mode
      "free_deliveries": true, -- Although not explicitly mentioned as free deliveries, the description implies full access
      "self_pickup": true,
      "pay_per_delivery": true, -- Still applicable for physical deliveries
      "add_to_cart": true,
      "market_runs": true,
      "sms_connect": true, -- WhatsApp and SMS Connect
      "whatsapp_connect": true, -- WhatsApp and SMS Connect
      "phone_call_back": true, -- Phone Call Back
      "live_shopper_mode": true -- Live Shopper Mode
    }',
    '{
      "chats_per_month": -1, -- Unlimited
      "words_per_month": -1, -- Unlimited
      "voice_minutes_per_month": -1, -- Unlimited Voice Mode
      "image_search_count": -1, -- Unlimited
      "online_shopping_count": -1, -- Unlimited online shopping
      "market_runs_count": 10,
      "free_deliveries_count": 0 -- Free deliveries not explicitly mentioned, but all features unlimited implies delivery costs covered or included in price. Assuming not free deliveries but unlimited 'online_shopping' which could imply delivery for online purchases.
    }'
  );

-- Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read subscription plans
CREATE POLICY "Anyone can read subscription plans" 
  ON subscription_plans FOR SELECT 
  USING (true);

-- Only admins can modify subscription plans
CREATE POLICY "Only admins can create/update/delete subscription plans" 
  ON subscription_plans FOR ALL 
  USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Only authorized users can create/update subscriptions
CREATE POLICY "Authorized users can create/update subscriptions" 
  ON user_subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

CREATE POLICY "Authorized users can update subscriptions" 
  ON user_subscriptions FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" 
  ON subscription_usage FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON subscription_usage FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')));

CREATE POLICY "Authorized users can update usage" 
  ON subscription_usage FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com'))); 
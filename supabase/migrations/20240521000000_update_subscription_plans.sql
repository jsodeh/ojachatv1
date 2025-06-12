-- Update subscription plans with new specifications
UPDATE subscription_plans
SET 
  description = 'For personal use with self pickup.',
  limits = '{
    "chats_per_month": 20,
    "words_per_month": 500,
    "voice_minutes_per_month": 5,
    "image_shopping_count": 0,
    "online_shopping_count": 0,
    "free_deliveries_count": 0
  }',
  features = '{
    "standard_support": true,
    "priority_support": false,
    "premium_support": false,
    "image_shopping": false,
    "online_shopping": false,
    "group_shopping": false,
    "auto_shopper": false,
    "voice_mode": true,
    "free_deliveries": false,
    "delivery_type": "self_pickup"
  }'
WHERE name = 'Basic Plan';

UPDATE subscription_plans
SET 
  description = 'Enhanced features with home deliveries.',
  limits = '{
    "chats_per_month": 100,
    "words_per_month": 2000,
    "voice_minutes_per_month": 30,
    "image_shopping_count": 20,
    "online_shopping_count": 20,
    "free_deliveries_count": 2
  }',
  features = '{
    "standard_support": true,
    "priority_support": true,
    "premium_support": false,
    "image_shopping": true,
    "online_shopping": true,
    "group_shopping": false,
    "auto_shopper": false,
    "voice_mode": true,
    "free_deliveries": true,
    "delivery_type": "standard"
  }'
WHERE name = 'Market PRO';

UPDATE subscription_plans
SET 
  description = 'Premium plan with unlimited features.',
  limits = '{
    "chats_per_month": -1,
    "words_per_month": -1,
    "voice_minutes_per_month": -1,
    "image_shopping_count": -1,
    "online_shopping_count": -1,
    "free_deliveries_count": 10
  }',
  features = '{
    "standard_support": true,
    "priority_support": true,
    "premium_support": true,
    "image_shopping": true,
    "online_shopping": true,
    "group_shopping": false,
    "auto_shopper": true,
    "voice_mode": true,
    "free_deliveries": true,
    "delivery_type": "premium"
  }'
WHERE name = 'OjaPRIME'; 
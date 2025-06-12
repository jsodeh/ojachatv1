-- Create a new SQL migration file to insert four subscription plans.

-- Insert the Free plan
INSERT INTO subscription_plans (name, price, interval_type, limits, features)
VALUES (
  'Free',
  0,
  'monthly',
  '{"monthly_messages": 50, "attachment_upload_mb": 0}',
  '{"chat_messages": true, "voice_chat": false, "priority_support": false, "early_access_features": false}'
);

-- Insert the Basic plan
INSERT INTO subscription_plans (name, price, interval_type, limits, features)
VALUES (
  'Basic',
  10.00,
  'monthly',
  '{"monthly_messages": 500, "attachment_upload_mb": 10}',
  '{"chat_messages": true, "voice_chat": true, "priority_support": false, "early_access_features": false}'
);

-- Insert the Premium plan
INSERT INTO subscription_plans (name, price, interval_type, limits, features)
VALUES (
  'Premium',
  25.00,
  'monthly',
  '{"monthly_messages": 2000, "attachment_upload_mb": 25}',
  '{"chat_messages": true, "voice_chat": true, "priority_support": true, "early_access_features": false}'
);

-- Insert the Prime plan
INSERT INTO subscription_plans (name, price, interval_type, limits, features)
VALUES (
  'Prime',
  100.00,
  'yearly',
  '{"monthly_messages": -1, "attachment_upload_mb": 50}', -- -1 typically indicates unlimited
  '{"chat_messages": true, "voice_chat": true, "priority_support": true, "early_access_features": true}'
);
-- Rename subscription plans to follow the new naming scheme

-- Rename "Market PRO" to "OjaPRIME PRO"
UPDATE subscription_plans 
SET name = 'Basic'
WHERE name = 'Market PRO';

-- Rename "OjaPRIME" to "OjaPRIME MAX"
UPDATE subscription_plans 
SET name = 'Premium'
WHERE name = 'OjaPRIME';

-- Insert the new PRIME plan
INSERT INTO subscription_plans (name, price, features) VALUES
('PRIME', 150000.00, '{\"chats\": \"unlimited\", \"words\": \"unlimited\", \"voice_mode\": \"unlimited\", \"image_search\": \"unlimited\", \"online_shopping\": \"unlimited\", \"deliveries\": 10, \"group_shopping\": true, \"priority_support\": true, \"24/7_support\": true, \"auto_shopper\": true, \"live_shopper\": true, \"auto_shopper_mode\": true, \"whatsapp_sms_connect\": true, \"phone_call_back\": true}');

-- Note: Payment link updates will need to be handled separately based on the new payment gateway setup (Flutterwave).
UPDATE payment_links
SET link_url = 'https://paystack.com/pay/ojaprime-max'
WHERE link_url = 'https://paystack.com/pay/ojachat-prime'; 
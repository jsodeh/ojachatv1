-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admins can read all roles
CREATE POLICY "Admins can read all roles" 
  ON user_roles FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Users can read their own roles
CREATE POLICY "Users can read their own roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- Only admins can modify roles
CREATE POLICY "Only admins can modify roles" 
  ON user_roles FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Initial admin setup - replace with your actual admin email
CREATE OR REPLACE FUNCTION add_initial_admin() RETURNS void AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_id FROM auth.users WHERE email = 'jsodeh@gmail.com' LIMIT 1;
  
  -- Insert admin role if the user exists
  IF admin_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (admin_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT add_initial_admin();

-- Update existing policies to use the roles table
DROP POLICY IF EXISTS "Only admins can create/update/delete subscription plans" ON subscription_plans;
CREATE POLICY "Only admins can create/update/delete subscription plans" 
  ON subscription_plans FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Update other admin policies
DROP POLICY IF EXISTS "Authorized users can create/update subscriptions" ON user_subscriptions;
CREATE POLICY "Authorized users can create/update subscriptions" 
  ON user_subscriptions FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Authorized users can update subscriptions" ON user_subscriptions;
CREATE POLICY "Authorized users can update subscriptions" 
  ON user_subscriptions FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own usage" ON subscription_usage;
CREATE POLICY "Users can update their own usage" 
  ON subscription_usage FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Authorized users can update usage" ON subscription_usage;
CREATE POLICY "Authorized users can update usage" 
  ON subscription_usage FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  ); 
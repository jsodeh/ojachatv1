-- Migration: Admin Roles & Privileges Management

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Privileges table
CREATE TABLE IF NOT EXISTS privileges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- 3. Role-Privileges mapping
CREATE TABLE IF NOT EXISTS role_privileges (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  privilege_id INTEGER REFERENCES privileges(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, privilege_id)
);

-- 4. User-Roles mapping
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- 5. Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('manager'), ('user') ON CONFLICT DO NOTHING;

-- 6. Insert default privileges
INSERT INTO privileges (name, description) VALUES
  ('manage_users', 'Can manage users'),
  ('view_analytics', 'Can view analytics'),
  ('edit_settings', 'Can edit settings')
ON CONFLICT DO NOTHING;

-- 7. Assign all privileges to admin role
INSERT INTO role_privileges (role_id, privilege_id)
SELECT r.id, p.id
FROM roles r, privileges p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- 8. Assign basic privileges to manager (example)
INSERT INTO role_privileges (role_id, privilege_id)
SELECT r.id, p.id
FROM roles r, privileges p
WHERE r.name = 'manager' AND p.name IN ('view_analytics')
ON CONFLICT DO NOTHING;

-- 9. Example: Assign admin role to a user by email (replace with actual email)
-- DO NOT RUN THIS LINE AS-IS; update the email first!
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT u.id, r.id FROM auth.users u, roles r WHERE u.email = 'admin@example.com' AND r.name = 'admin'
-- ON CONFLICT DO NOTHING; 
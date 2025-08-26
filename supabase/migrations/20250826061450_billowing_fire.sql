/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `auth_user_id` (uuid, foreign key to auth.users)
      - `full_name` (text, not null)
      - `email` (text, unique, not null)
      - `phone` (text)
      - `position` (text, check constraint)
      - `department` (text)
      - `role` (text, check constraint)
      - `status` (text, check constraint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user access control
*/

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT CHECK (position IN ('代表取締役', '取締役', '部長', '課長', '主任', '一般職')),
  department TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'approver', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view same organization users" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage organization users" ON users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
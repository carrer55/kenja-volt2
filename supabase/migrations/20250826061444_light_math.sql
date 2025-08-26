/*
  # Create organizations table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `plan_type` (text, check constraint)
      - `user_limit` (integer, default 1)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `organizations` table
    - Add policy for users to view their organization
*/

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  user_limit INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid())
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
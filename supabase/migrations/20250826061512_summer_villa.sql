/*
  # Create allowance_settings table

  1. New Tables
    - `allowance_settings`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `position` (text, not null)
      - `domestic_daily` (integer)
      - `domestic_accommodation` (integer)
      - `overseas_daily` (integer)
      - `overseas_accommodation` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `allowance_settings` table
    - Add policies for allowance settings access control
*/

CREATE TABLE IF NOT EXISTS allowance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  domestic_daily INTEGER DEFAULT 0,
  domestic_accommodation INTEGER DEFAULT 0,
  overseas_daily INTEGER DEFAULT 0,
  overseas_accommodation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, position)
);

ALTER TABLE allowance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization allowance settings" ON allowance_settings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage allowance settings" ON allowance_settings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_allowance_settings_updated_at 
  BEFORE UPDATE ON allowance_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
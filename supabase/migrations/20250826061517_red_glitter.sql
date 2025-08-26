/*
  # Create billing_history table

  1. New Tables
    - `billing_history`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `period` (text, not null)
      - `plan_type` (text, not null)
      - `amount` (integer, not null)
      - `status` (text, check constraint)
      - `invoice_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `billing_history` table
    - Add policies for billing history access control
*/

CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed')),
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization billing history" ON billing_history
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage billing history" ON billing_history
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
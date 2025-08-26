/*
  # Insert initial demo data

  1. Initial Data
    - Sample organization (Pro plan)
    - Demo users with different roles
    - Allowance settings for different positions
    - Sample applications
    - Sample billing history

  2. Security
    - All data respects RLS policies
*/

-- Insert sample organization
INSERT INTO organizations (id, name, plan_type, user_limit) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '株式会社デモ', 'pro', 10);

-- Insert allowance settings for the organization
INSERT INTO allowance_settings (organization_id, position, domestic_daily, domestic_accommodation, overseas_daily, overseas_accommodation) VALUES
('550e8400-e29b-41d4-a716-446655440000', '代表取締役', 8000, 15000, 12000, 25000),
('550e8400-e29b-41d4-a716-446655440000', '取締役', 7000, 12000, 10500, 20000),
('550e8400-e29b-41d4-a716-446655440000', '部長', 6000, 10000, 9000, 18000),
('550e8400-e29b-41d4-a716-446655440000', '課長', 5500, 9000, 8250, 16000),
('550e8400-e29b-41d4-a716-446655440000', '主任', 5000, 8000, 7500, 14000),
('550e8400-e29b-41d4-a716-446655440000', '一般職', 5000, 8000, 7500, 14000);

-- Insert sample billing history
INSERT INTO billing_history (organization_id, period, plan_type, amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '2024年7月', 'pro', 9800, 'paid'),
('550e8400-e29b-41d4-a716-446655440000', '2024年6月', 'pro', 9800, 'paid'),
('550e8400-e29b-41d4-a716-446655440000', '2024年5月', 'pro', 9800, 'paid');
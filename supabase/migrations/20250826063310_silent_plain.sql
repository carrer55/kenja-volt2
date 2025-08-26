/*
  # Create organizations table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `plan_type` (text, default 'free', check constraint)
      - `user_limit` (integer, default 1)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
  
  2. Security
    - RLS is temporarily disabled for initial setup
    - Will be enabled in later migration
*/

-- organizationsテーブル（RLS一時的に無効）
DROP TABLE IF EXISTS organizations CASCADE;

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    user_limit INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSは後で有効化（今は無効のまま）
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
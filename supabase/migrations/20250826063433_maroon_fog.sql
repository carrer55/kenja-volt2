/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `auth_user_id` (uuid, unique, for Supabase auth integration)
      - `full_name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text, optional)
      - `position` (text, with check constraint for valid positions)
      - `department` (text, optional)
      - `role` (text, with check constraint: admin/approver/user)
      - `status` (text, with check constraint: active/inactive/invited)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - RLS temporarily disabled for initial setup
    - Will be enabled in later migration

  3. Constraints
    - Foreign key to organizations table with CASCADE delete
    - Check constraints for position and role values
    - Unique constraint on email and auth_user_id
*/

-- usersテーブル（RLS一時的に無効）
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE,  -- auth.usersへの参照は後で追加
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position TEXT DEFAULT '一般職' CHECK (position IN ('代表取締役', '取締役', '部長', '課長', '主任', '一般職')),
    department TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'approver', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSは後で有効化
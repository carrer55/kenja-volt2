/*
  # Create applications table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `applicant_id` (uuid, foreign key)
      - `type` (text, check constraint)
      - `title` (text, not null)
      - `purpose` (text)
      - `status` (text, check constraint)
      - `estimated_amount` (integer)
      - `actual_amount` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `destination` (text)
      - `details` (jsonb)
      - `attachments` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `applications` table
    - Add policies for application access control
*/

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('business_trip', 'expense')),
  title TEXT NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'returned')),
  estimated_amount INTEGER DEFAULT 0,
  actual_amount INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  destination TEXT,
  details JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their applications or pending approvals" ON applications
  FOR SELECT USING (
    applicant_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() AND role IN ('admin', 'approver')
    )
  );

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (
    applicant_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (
    applicant_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Approvers can update application status" ON applications
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() AND role IN ('admin', 'approver')
    )
  );

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
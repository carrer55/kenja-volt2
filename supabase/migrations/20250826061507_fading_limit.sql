/*
  # Create approvals table

  1. New Tables
    - `approvals`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `approver_id` (uuid, foreign key)
      - `step_order` (integer, not null)
      - `status` (text, check constraint)
      - `comment` (text)
      - `approved_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `approvals` table
    - Add policies for approval access control
*/

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id),
  step_order INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  comment TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approvals for their applications" ON approvals
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications 
      WHERE applicant_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
    OR approver_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Approvers can create and update approvals" ON approvals
  FOR ALL USING (
    approver_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
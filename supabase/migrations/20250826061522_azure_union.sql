/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text, not null)
      - `message` (text, not null)
      - `type` (text, check constraint)
      - `read` (boolean, default false)
      - `related_application_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for notification access control
*/

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('approval_request', 'status_update', 'system')),
  read BOOLEAN DEFAULT false,
  related_application_id UUID REFERENCES applications(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));
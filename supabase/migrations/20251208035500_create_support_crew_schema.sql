/*
  # Support Crew Feature

  1. New Tables
    - `support_crew_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users - the person who invited)
      - `member_email` (text, email of crew member)
      - `member_phone` (text, optional phone number)
      - `member_name` (text, name of crew member)
      - `role` (text, one of: 'coach', 'counselor', 'accountability_partner')
      - `status` (text, one of: 'pending', 'active', 'declined')
      - `can_view_resets` (boolean, permission to view resets)
      - `auto_share_resets` (boolean, automatically share new resets)
      - `invitation_token` (text, unique token for accepting invitation)
      - `invited_at` (timestamptz)
      - `accepted_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `journal_entry_shares`
      - `id` (uuid, primary key)
      - `journal_entry_id` (uuid, reference to journal_entries)
      - `shared_by_user_id` (uuid, reference to auth.users)
      - `shared_with_member_id` (uuid, reference to support_crew_members)
      - `can_comment` (boolean)
      - `created_at` (timestamptz)
    
    - `journal_entry_comments`
      - `id` (uuid, primary key)
      - `journal_entry_id` (uuid, reference to journal_entries)
      - `crew_member_id` (uuid, reference to support_crew_members)
      - `comment_text` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own crew members
    - Crew members can view shared entries
    - Crew members can comment on entries where allowed
*/

-- Support Crew Members Table
CREATE TABLE IF NOT EXISTS support_crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  member_email text NOT NULL,
  member_phone text DEFAULT '',
  member_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('coach', 'counselor', 'accountability_partner')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  can_view_resets boolean DEFAULT true,
  auto_share_resets boolean DEFAULT false,
  invitation_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own crew members"
  ON support_crew_members FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Crew members can view their own record"
  ON support_crew_members FOR SELECT
  USING (member_email = auth.email());

-- Journal Entry Shares Table
CREATE TABLE IF NOT EXISTS journal_entry_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL,
  shared_with_member_id uuid NOT NULL REFERENCES support_crew_members(id) ON DELETE CASCADE,
  can_comment boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(journal_entry_id, shared_with_member_id)
);

ALTER TABLE journal_entry_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage shares of their entries"
  ON journal_entry_shares FOR ALL
  USING (shared_by_user_id = auth.uid());

CREATE POLICY "Crew members can view shares with them"
  ON journal_entry_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_crew_members
      WHERE support_crew_members.id = shared_with_member_id
      AND support_crew_members.member_email = auth.email()
      AND support_crew_members.status = 'active'
    )
  );

-- Journal Entry Comments Table
CREATE TABLE IF NOT EXISTS journal_entry_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  crew_member_id uuid NOT NULL REFERENCES support_crew_members(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entry_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entry owners can view all comments on their entries"
  ON journal_entry_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN support_crew_members scm ON scm.user_id = auth.uid()
      WHERE je.id = journal_entry_id
    )
  );

CREATE POLICY "Crew members can view their own comments"
  ON journal_entry_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_crew_members
      WHERE support_crew_members.id = crew_member_id
      AND support_crew_members.member_email = auth.email()
    )
  );

CREATE POLICY "Crew members can insert comments on shared entries"
  ON journal_entry_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entry_shares jes
      JOIN support_crew_members scm ON scm.id = jes.shared_with_member_id
      WHERE jes.journal_entry_id = journal_entry_comments.journal_entry_id
      AND jes.can_comment = true
      AND scm.member_email = auth.email()
      AND scm.status = 'active'
      AND scm.id = crew_member_id
    )
  );

CREATE POLICY "Crew members can update their own comments"
  ON journal_entry_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM support_crew_members
      WHERE support_crew_members.id = crew_member_id
      AND support_crew_members.member_email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_crew_members
      WHERE support_crew_members.id = crew_member_id
      AND support_crew_members.member_email = auth.email()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_support_crew_members_user_id ON support_crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_support_crew_members_email ON support_crew_members(member_email);
CREATE INDEX IF NOT EXISTS idx_support_crew_members_token ON support_crew_members(invitation_token);
CREATE INDEX IF NOT EXISTS idx_journal_entry_shares_entry_id ON journal_entry_shares(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_shares_member_id ON journal_entry_shares(shared_with_member_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_comments_entry_id ON journal_entry_comments(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_comments_member_id ON journal_entry_comments(crew_member_id);

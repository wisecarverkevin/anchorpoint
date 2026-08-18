/*
  # Daily Reset Journal Entries Schema

  ## Overview
  Creates the database structure for the Daily Reset journaling feature,
  which allows users to write journal entries using three different reset types.

  ## New Tables

  ### `journal_entries`
  Stores journal entries with their reset type, content, and tags
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `reset_type` (text) - One of: 'clarity', 'gratitude', 'insight'
  - `content` (text) - The journal entry content
  - `tags` (text[]) - Array of tags for categorization
  - `created_at` (timestamptz) - When the entry was created
  - `updated_at` (timestamptz) - When the entry was last updated

  ## Security
  - RLS enabled; policies granted to `authenticated` and scoped to auth.uid().
  - `user_id` defaults to auth.uid() so client inserts that omit it are still
    attributed to the caller, and WITH CHECK rejects a forged user_id.

  ## Important Notes
  - `reset_type` is a text column with a CHECK constraint rather than a Postgres
    ENUM. Adding a new reset type is then a one-line constraint swap instead of
    an ALTER TYPE migration. `reset_prompts.reset_type` already uses this shape,
    so the two tables now agree.
  - Tags are stored as a PostgreSQL text array for flexible querying
  - Entries are ordered by created_at DESC by default
*/

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_type text NOT NULL CHECK (reset_type IN ('clarity', 'gratitude', 'insight')),
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Lets scheduled_events key off (id, user_id) so ownership cannot diverge.
  UNIQUE (id, user_id)
);

-- Create index for faster filtering by reset_type
CREATE INDEX IF NOT EXISTS idx_journal_entries_reset_type ON journal_entries(reset_type);

-- Create index for faster filtering by created_at
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Every RLS policy filters on user_id.
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file can be re-run.
DROP POLICY IF EXISTS "Allow public read access to journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow public insert to journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow public update to journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow public delete to journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can read own journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal_entries" ON journal_entries;

CREATE POLICY "Users can read own journal_entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal_entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal_entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal_entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

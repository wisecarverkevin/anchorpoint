/*
  # Daily Reset Journal Entries Schema

  ## Overview
  Creates the database structure for the Daily Reset journaling feature,
  which allows users to write journal entries using three different reset types.

  ## New Tables
  
  ### `journal_entries`
  Stores journal entries with their reset type, content, and tags
  - `id` (uuid, primary key)
  - `reset_type` (text) - One of: 'clarity', 'gratitude', 'insight'
  - `content` (text) - The journal entry content
  - `tags` (text[]) - Array of tags for categorization
  - `created_at` (timestamptz) - When the entry was created
  - `updated_at` (timestamptz) - When the entry was last updated

  ## Security
  - Enable RLS on journal_entries table
  - Add policies for public access (can be restricted later with auth)

  ## Important Notes
  - Reset types are stored as lowercase strings for consistency
  - Tags are stored as a PostgreSQL text array for flexible querying
  - Entries are ordered by created_at DESC by default
*/

-- Create reset_type enum for type safety
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reset_type') THEN
    CREATE TYPE reset_type AS ENUM ('clarity', 'gratitude', 'insight');
  END IF;
END $$;

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_type reset_type NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster filtering by reset_type
CREATE INDEX IF NOT EXISTS idx_journal_entries_reset_type ON journal_entries(reset_type);

-- Create index for faster filtering by created_at
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to journal_entries"
  ON journal_entries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to journal_entries"
  ON journal_entries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to journal_entries"
  ON journal_entries FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to journal_entries"
  ON journal_entries FOR DELETE
  TO public
  USING (true);
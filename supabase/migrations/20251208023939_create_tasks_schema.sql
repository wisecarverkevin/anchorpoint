/*
  # Anchor Planner Tasks Schema

  ## Overview
  Creates the database structure for the Anchor Planner task management board,
  which allows users to manage tasks across three stages: Quicklist, Hotlist, and Achieved.

  ## New Tables

  ### `tasks`
  Stores tasks with their status, cornerstone connection, and optional links
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `title` (text) - Task title
  - `description` (text) - Optional detailed description
  - `status` (task_status enum) - One of: 'quicklist', 'hotlist', 'achieved'
  - `cornerstone_id` (uuid, foreign key) - Required connection to cornerstone
  - `weekly_anchor_id` (uuid, foreign key) - Optional link to weekly anchor
  - `power_block` (text) - Optional time block (e.g., "Morning", "9-11am", etc.)
  - `order_index` (integer) - Position within the column
  - `created_at` (timestamptz) - When the task was created
  - `updated_at` (timestamptz) - When the task was last updated
  - `completed_at` (timestamptz) - When the task was marked as achieved

  ## Security
  - RLS enabled; policies granted to `authenticated` and scoped to auth.uid().
  - `user_id` defaults to auth.uid() so client inserts that omit it are still
    attributed to the caller.
  - The cornerstone link uses a composite foreign key
    `(cornerstone_id, user_id) -> cornerstones(id, user_id)`, so a task cannot
    be attached to another user's cornerstone.

  ## Important Notes
  - Task status enum ensures data integrity
  - Tasks must be linked to a cornerstone
  - Weekly anchor and power block are optional
  - `weekly_anchor_id` stays a single-column FK: it is nullable with
    ON DELETE SET NULL, and a composite version would try to null the NOT NULL
    user_id alongside it.
  - Order index allows custom sorting within columns
*/

-- Create task_status enum for type safety
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('quicklist', 'hotlist', 'achieved');
  END IF;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status task_status NOT NULL DEFAULT 'quicklist',
  cornerstone_id uuid NOT NULL,
  weekly_anchor_id uuid REFERENCES weekly_anchors(id) ON DELETE SET NULL,
  power_block text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  -- Lets scheduled_events key off (id, user_id) so ownership cannot diverge.
  UNIQUE (id, user_id),
  FOREIGN KEY (cornerstone_id, user_id)
    REFERENCES cornerstones(id, user_id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_cornerstone_id ON tasks(cornerstone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_weekly_anchor_id ON tasks(weekly_anchor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file can be re-run.
DROP POLICY IF EXISTS "Allow public read access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public delete to tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can read own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

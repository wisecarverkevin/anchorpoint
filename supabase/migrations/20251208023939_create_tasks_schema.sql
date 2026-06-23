/*
  # Anchor Planner Tasks Schema

  ## Overview
  Creates the database structure for the Anchor Planner task management board,
  which allows users to manage tasks across three stages: Quicklist, Hotlist, and Achieved.

  ## New Tables
  
  ### `tasks`
  Stores tasks with their status, cornerstone connection, and optional links
  - `id` (uuid, primary key)
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
  - Enable RLS on tasks table
  - Add policies for public access (can be restricted later with auth)

  ## Important Notes
  - Task status enum ensures data integrity
  - Tasks must be linked to a cornerstone
  - Weekly anchor and power block are optional
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
  title text NOT NULL,
  description text DEFAULT '',
  status task_status NOT NULL DEFAULT 'quicklist',
  cornerstone_id uuid NOT NULL REFERENCES cornerstones(id) ON DELETE CASCADE,
  weekly_anchor_id uuid REFERENCES weekly_anchors(id) ON DELETE SET NULL,
  power_block text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_cornerstone_id ON tasks(cornerstone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_weekly_anchor_id ON tasks(weekly_anchor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to tasks"
  ON tasks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to tasks"
  ON tasks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to tasks"
  ON tasks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to tasks"
  ON tasks FOR DELETE
  TO public
  USING (true);
/*
  # AnchorPoint Database Schema

  ## Overview
  Creates the complete database structure for the AnchorPoint application,
  which helps users organize their goals across four life cornerstones.

  ## New Tables
  
  ### `cornerstones`
  Stores the four core sections of the app: Self, Business, Life, and Higher Power
  - `id` (uuid, primary key)
  - `name` (text) - The cornerstone name
  - `description` (text) - Optional description
  - `icon` (text) - Icon identifier
  - `color` (text) - Theme color for the cornerstone
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz)

  ### `yearly_visions`
  Stores yearly vision statements for each cornerstone
  - `id` (uuid, primary key)
  - `cornerstone_id` (uuid, foreign key)
  - `year` (integer)
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `quarterly_goals`
  Stores quarterly goals for each cornerstone
  - `id` (uuid, primary key)
  - `cornerstone_id` (uuid, foreign key)
  - `year` (integer)
  - `quarter` (integer) - 1, 2, 3, or 4
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `monthly_milestones`
  Stores monthly milestones for each cornerstone
  - `id` (uuid, primary key)
  - `cornerstone_id` (uuid, foreign key)
  - `year` (integer)
  - `month` (integer) - 1-12
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `weekly_anchors`
  Stores weekly anchors for each cornerstone
  - `id` (uuid, primary key)
  - `cornerstone_id` (uuid, foreign key)
  - `year` (integer)
  - `week` (integer) - Week number 1-52
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for public access (can be restricted later with auth)
*/

-- Create cornerstones table
CREATE TABLE IF NOT EXISTS cornerstones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  color text DEFAULT '#3B82F6',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create yearly_visions table
CREATE TABLE IF NOT EXISTS yearly_visions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cornerstone_id uuid NOT NULL REFERENCES cornerstones(id) ON DELETE CASCADE,
  year integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cornerstone_id, year)
);

-- Create quarterly_goals table
CREATE TABLE IF NOT EXISTS quarterly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cornerstone_id uuid NOT NULL REFERENCES cornerstones(id) ON DELETE CASCADE,
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cornerstone_id, year, quarter)
);

-- Create monthly_milestones table
CREATE TABLE IF NOT EXISTS monthly_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cornerstone_id uuid NOT NULL REFERENCES cornerstones(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cornerstone_id, year, month)
);

-- Create weekly_anchors table
CREATE TABLE IF NOT EXISTS weekly_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cornerstone_id uuid NOT NULL REFERENCES cornerstones(id) ON DELETE CASCADE,
  year integer NOT NULL,
  week integer NOT NULL CHECK (week >= 1 AND week <= 53),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cornerstone_id, year, week)
);

-- Enable RLS
ALTER TABLE cornerstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_anchors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to cornerstones"
  ON cornerstones FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to cornerstones"
  ON cornerstones FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to cornerstones"
  ON cornerstones FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to cornerstones"
  ON cornerstones FOR DELETE
  TO public
  USING (true);

-- Yearly visions policies
CREATE POLICY "Allow public read access to yearly_visions"
  ON yearly_visions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to yearly_visions"
  ON yearly_visions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to yearly_visions"
  ON yearly_visions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to yearly_visions"
  ON yearly_visions FOR DELETE
  TO public
  USING (true);

-- Quarterly goals policies
CREATE POLICY "Allow public read access to quarterly_goals"
  ON quarterly_goals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quarterly_goals"
  ON quarterly_goals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to quarterly_goals"
  ON quarterly_goals FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to quarterly_goals"
  ON quarterly_goals FOR DELETE
  TO public
  USING (true);

-- Monthly milestones policies
CREATE POLICY "Allow public read access to monthly_milestones"
  ON monthly_milestones FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to monthly_milestones"
  ON monthly_milestones FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to monthly_milestones"
  ON monthly_milestones FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to monthly_milestones"
  ON monthly_milestones FOR DELETE
  TO public
  USING (true);

-- Weekly anchors policies
CREATE POLICY "Allow public read access to weekly_anchors"
  ON weekly_anchors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to weekly_anchors"
  ON weekly_anchors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to weekly_anchors"
  ON weekly_anchors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to weekly_anchors"
  ON weekly_anchors FOR DELETE
  TO public
  USING (true);

-- Insert the four cornerstones
INSERT INTO cornerstones (name, description, icon, color, order_index) VALUES
  ('Self', 'Personal growth, health, and well-being', 'user', '#10B981', 1),
  ('Business', 'Career, professional development, and financial goals', 'briefcase', '#3B82F6', 2),
  ('Life', 'Relationships, experiences, and life balance', 'heart', '#F59E0B', 3),
  ('Higher Power', 'Spirituality, purpose, and deeper meaning', 'sparkles', '#8B5CF6', 4)
ON CONFLICT DO NOTHING;
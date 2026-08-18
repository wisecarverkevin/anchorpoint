/*
  # AnchorPoint Database Schema

  ## Overview
  Creates the core structure for AnchorPoint, which helps users organize their
  goals across four life cornerstones. All data is private to the owning user.

  ## New Tables

  ### `cornerstones`
  The four core sections of the app: Self, Business, Life, and Higher Power.
  Each user gets their own set, seeded on signup.
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `name` (text) - The cornerstone name
  - `description` (text) - Optional description
  - `icon` (text) - Icon identifier
  - `color` (text) - Theme color for the cornerstone
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz)

  ### `yearly_visions` / `quarterly_goals` / `monthly_milestones` / `weekly_anchors`
  Planning rows hanging off a cornerstone, each carrying `user_id` for direct
  RLS filtering.
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Owner
  - `cornerstone_id` (uuid, FK -> cornerstones)
  - `year` (integer), plus `quarter` / `month` / `week` where applicable
  - `content` (text)
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled on every table.
  - Policies are granted to `authenticated` only and scoped to `auth.uid()`.
    An anonymous client can read and write nothing.
  - `user_id` defaults to `auth.uid()`, so client inserts that omit it are
    still attributed to the caller and cannot be forged (the INSERT policy's
    WITH CHECK rejects any user_id other than the caller's).
  - Child tables use a composite foreign key
    `(cornerstone_id, user_id) -> cornerstones(id, user_id)`, which makes it
    impossible to attach a row to a cornerstone owned by someone else.

  ## Seeding
  The four cornerstones are per-user, so they cannot be seeded as static rows.
  `seed_default_cornerstones()` is invoked by an AFTER INSERT trigger on
  `auth.users`, and is also run once for any users that already exist.
*/

-- Create cornerstones table
CREATE TABLE IF NOT EXISTS cornerstones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  color text DEFAULT '#3B82F6',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Lets child tables key off (id, user_id) so ownership cannot diverge.
  UNIQUE (id, user_id),
  -- Makes the per-user seed idempotent via ON CONFLICT DO NOTHING.
  UNIQUE (user_id, name)
);

-- Create yearly_visions table
CREATE TABLE IF NOT EXISTS yearly_visions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cornerstone_id uuid NOT NULL,
  year integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cornerstone_id, year),
  FOREIGN KEY (cornerstone_id, user_id)
    REFERENCES cornerstones(id, user_id) ON DELETE CASCADE
);

-- Create quarterly_goals table
CREATE TABLE IF NOT EXISTS quarterly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cornerstone_id uuid NOT NULL,
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cornerstone_id, year, quarter),
  FOREIGN KEY (cornerstone_id, user_id)
    REFERENCES cornerstones(id, user_id) ON DELETE CASCADE
);

-- Create monthly_milestones table
CREATE TABLE IF NOT EXISTS monthly_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cornerstone_id uuid NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cornerstone_id, year, month),
  FOREIGN KEY (cornerstone_id, user_id)
    REFERENCES cornerstones(id, user_id) ON DELETE CASCADE
);

-- Create weekly_anchors table
CREATE TABLE IF NOT EXISTS weekly_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cornerstone_id uuid NOT NULL,
  year integer NOT NULL,
  week integer NOT NULL CHECK (week >= 1 AND week <= 53),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cornerstone_id, year, week),
  FOREIGN KEY (cornerstone_id, user_id)
    REFERENCES cornerstones(id, user_id) ON DELETE CASCADE
);

-- Indexes: every RLS policy filters on user_id, and the app joins on cornerstone_id.
CREATE INDEX IF NOT EXISTS cornerstones_user_id_idx ON cornerstones (user_id);
CREATE INDEX IF NOT EXISTS yearly_visions_user_id_idx ON yearly_visions (user_id);
CREATE INDEX IF NOT EXISTS yearly_visions_cornerstone_id_idx ON yearly_visions (cornerstone_id);
CREATE INDEX IF NOT EXISTS quarterly_goals_user_id_idx ON quarterly_goals (user_id);
CREATE INDEX IF NOT EXISTS quarterly_goals_cornerstone_id_idx ON quarterly_goals (cornerstone_id);
CREATE INDEX IF NOT EXISTS monthly_milestones_user_id_idx ON monthly_milestones (user_id);
CREATE INDEX IF NOT EXISTS monthly_milestones_cornerstone_id_idx ON monthly_milestones (cornerstone_id);
CREATE INDEX IF NOT EXISTS weekly_anchors_user_id_idx ON weekly_anchors (user_id);
CREATE INDEX IF NOT EXISTS weekly_anchors_cornerstone_id_idx ON weekly_anchors (cornerstone_id);

-- Enable RLS
ALTER TABLE cornerstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_anchors ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file can be re-run.
DROP POLICY IF EXISTS "Users can read own cornerstones" ON cornerstones;
DROP POLICY IF EXISTS "Users can insert own cornerstones" ON cornerstones;
DROP POLICY IF EXISTS "Users can update own cornerstones" ON cornerstones;
DROP POLICY IF EXISTS "Users can delete own cornerstones" ON cornerstones;

CREATE POLICY "Users can read own cornerstones"
  ON cornerstones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cornerstones"
  ON cornerstones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cornerstones"
  ON cornerstones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cornerstones"
  ON cornerstones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Yearly visions policies
DROP POLICY IF EXISTS "Users can read own yearly_visions" ON yearly_visions;
DROP POLICY IF EXISTS "Users can insert own yearly_visions" ON yearly_visions;
DROP POLICY IF EXISTS "Users can update own yearly_visions" ON yearly_visions;
DROP POLICY IF EXISTS "Users can delete own yearly_visions" ON yearly_visions;

CREATE POLICY "Users can read own yearly_visions"
  ON yearly_visions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own yearly_visions"
  ON yearly_visions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own yearly_visions"
  ON yearly_visions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own yearly_visions"
  ON yearly_visions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Quarterly goals policies
DROP POLICY IF EXISTS "Users can read own quarterly_goals" ON quarterly_goals;
DROP POLICY IF EXISTS "Users can insert own quarterly_goals" ON quarterly_goals;
DROP POLICY IF EXISTS "Users can update own quarterly_goals" ON quarterly_goals;
DROP POLICY IF EXISTS "Users can delete own quarterly_goals" ON quarterly_goals;

CREATE POLICY "Users can read own quarterly_goals"
  ON quarterly_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quarterly_goals"
  ON quarterly_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quarterly_goals"
  ON quarterly_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quarterly_goals"
  ON quarterly_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Monthly milestones policies
DROP POLICY IF EXISTS "Users can read own monthly_milestones" ON monthly_milestones;
DROP POLICY IF EXISTS "Users can insert own monthly_milestones" ON monthly_milestones;
DROP POLICY IF EXISTS "Users can update own monthly_milestones" ON monthly_milestones;
DROP POLICY IF EXISTS "Users can delete own monthly_milestones" ON monthly_milestones;

CREATE POLICY "Users can read own monthly_milestones"
  ON monthly_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly_milestones"
  ON monthly_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly_milestones"
  ON monthly_milestones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly_milestones"
  ON monthly_milestones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Weekly anchors policies
DROP POLICY IF EXISTS "Users can read own weekly_anchors" ON weekly_anchors;
DROP POLICY IF EXISTS "Users can insert own weekly_anchors" ON weekly_anchors;
DROP POLICY IF EXISTS "Users can update own weekly_anchors" ON weekly_anchors;
DROP POLICY IF EXISTS "Users can delete own weekly_anchors" ON weekly_anchors;

CREATE POLICY "Users can read own weekly_anchors"
  ON weekly_anchors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly_anchors"
  ON weekly_anchors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly_anchors"
  ON weekly_anchors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly_anchors"
  ON weekly_anchors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

/*
  Per-user seeding.

  The original schema inserted four global cornerstone rows. Now that rows are
  owned, each user needs their own copy. SECURITY DEFINER is required because
  the trigger runs during signup with no JWT, so auth.uid() is NULL and the RLS
  INSERT policy would reject the write; user_id is therefore passed explicitly
  rather than relying on the column default.
*/
CREATE OR REPLACE FUNCTION seed_default_cornerstones(target_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO cornerstones (user_id, name, description, icon, color, order_index)
  VALUES
    (target_user_id, 'Self', 'Personal growth, health, and well-being', 'user', '#10B981', 1),
    (target_user_id, 'Business', 'Career, professional development, and financial goals', 'briefcase', '#3B82F6', 2),
    (target_user_id, 'Life', 'Relationships, experiences, and life balance', 'heart', '#F59E0B', 3),
    (target_user_id, 'Higher Power', 'Spirituality, purpose, and deeper meaning', 'sparkles', '#8B5CF6', 4)
  ON CONFLICT (user_id, name) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION handle_new_user_cornerstones()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM seed_default_cornerstones(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_seed_cornerstones ON auth.users;
CREATE TRIGGER on_auth_user_created_seed_cornerstones
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_cornerstones();

-- Backfill anyone who signed up before this migration ran.
DO $$
DECLARE
  existing_user record;
BEGIN
  FOR existing_user IN SELECT id FROM auth.users LOOP
    PERFORM seed_default_cornerstones(existing_user.id);
  END LOOP;
END;
$$;

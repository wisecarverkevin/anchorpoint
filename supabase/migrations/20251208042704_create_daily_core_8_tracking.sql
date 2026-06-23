/*
  # Create Daily Core 8 Tracking Schema

  1. New Tables
    - `daily_core_8`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date) - the day this tracking is for
      - `fitness` (boolean, default false)
      - `fuel` (boolean, default false)
      - `meditation` (boolean, default false)
      - `memoirs` (boolean, default false)
      - `person_1` (boolean, default false)
      - `person_2` (boolean, default false)
      - `discovery` (boolean, default false)
      - `declare` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_avatar_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `avatar_style` (text, enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can read and update their own daily core 8 tracking
    - Users can read and update their own avatar preferences

  3. Indexes
    - Add index on user_id and date for daily_core_8
    - Add unique constraint on user_id for user_avatar_preferences
*/

-- Create daily_core_8 table
CREATE TABLE IF NOT EXISTS daily_core_8 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  fitness boolean DEFAULT false NOT NULL,
  fuel boolean DEFAULT false NOT NULL,
  meditation boolean DEFAULT false NOT NULL,
  memoirs boolean DEFAULT false NOT NULL,
  person_1 boolean DEFAULT false NOT NULL,
  person_2 boolean DEFAULT false NOT NULL,
  discovery boolean DEFAULT false NOT NULL,
  declare boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create user_avatar_preferences table
CREATE TABLE IF NOT EXISTS user_avatar_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  avatar_style text NOT NULL DEFAULT 'human_silhouette' CHECK (
    avatar_style IN ('human_silhouette', 'flame_spirit', 'geometry_being', 'animal_totem', 'faith_variant')
  ),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS daily_core_8_user_date_idx ON daily_core_8(user_id, date DESC);

-- Enable RLS
ALTER TABLE daily_core_8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatar_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_core_8
CREATE POLICY "Users can read own daily core 8 tracking"
  ON daily_core_8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily core 8 tracking"
  ON daily_core_8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily core 8 tracking"
  ON daily_core_8
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_avatar_preferences
CREATE POLICY "Users can read own avatar preferences"
  ON user_avatar_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar preferences"
  ON user_avatar_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar preferences"
  ON user_avatar_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_daily_core_8_updated_at ON daily_core_8;
CREATE TRIGGER update_daily_core_8_updated_at
  BEFORE UPDATE ON daily_core_8
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_avatar_preferences_updated_at ON user_avatar_preferences;
CREATE TRIGGER update_user_avatar_preferences_updated_at
  BEFORE UPDATE ON user_avatar_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
/*
  # Morning check-in

  ## New table: `daily_checkins`
  One row per user per day, written by the morning landing screen before the
  dashboard is reachable.

  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `date` (date) - The user's LOCAL calendar date, supplied by the client
  - `sleep_quality` (text) - One of the four fixed options on the screen
  - `carrying` (text) - Free text: what they are bringing into the day
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled; all four policies granted to `authenticated` and scoped to
    auth.uid(), so a user can only ever read or write their own rows.
  - `user_id` defaults to auth.uid() so a client insert that omits it is still
    attributed to the caller, and the INSERT policy's WITH CHECK rejects any
    other value.

  ## Notes
  - `date` is deliberately NOT defaulted to CURRENT_DATE. CURRENT_DATE is the
    database server's date (UTC); the screen gates on the user's *local* morning,
    so the client sends its own local date. A UTC default would put users behind
    UTC into the wrong day for several hours each night.
  - UNIQUE (user_id, date) makes "already checked in today" a database
    guarantee rather than a client-side convention, so a double submit or a
    second open tab cannot create two rows for one morning.
*/

CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_quality text NOT NULL CHECK (
    sleep_quality IN ('Really well', 'Decent', 'Rough', 'Barely at all')
  ),
  carrying text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- The screen's only read is "is there a row for me for this date".
CREATE INDEX IF NOT EXISTS daily_checkins_user_date_idx
  ON daily_checkins (user_id, date DESC);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file re-runs.
DROP POLICY IF EXISTS "Users can read own daily_checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can insert own daily_checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can update own daily_checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can delete own daily_checkins" ON daily_checkins;

CREATE POLICY "Users can read own daily_checkins"
  ON daily_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_checkins"
  ON daily_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_checkins"
  ON daily_checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily_checkins"
  ON daily_checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

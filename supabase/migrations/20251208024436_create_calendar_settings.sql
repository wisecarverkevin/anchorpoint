/*
  # Calendar Integration Schema

  ## Overview
  Creates the database structure for calendar integration settings and preferences,
  allowing users to sync with external calendars and manage scheduling preferences.

  ## New Tables

  ### `calendar_settings`
  Stores user calendar integration preferences and sync status
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `provider` (text) - Calendar provider: 'google', 'apple', 'outlook'
  - `is_connected` (boolean) - Whether the calendar is currently connected
  - `sync_enabled` (boolean) - Whether sync is active
  - `last_synced_at` (timestamptz) - Last successful sync timestamp
  - `access_token_encrypted` (text) - Encrypted OAuth access token (to be implemented)
  - `refresh_token_encrypted` (text) - Encrypted OAuth refresh token (to be implemented)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `calendar_preferences`
  Stores user preferences for calendar features
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users, unique) - Owner, one row per user
  - `auto_suggest_enabled` (boolean) - Enable automatic time slot suggestions
  - `default_power_block_duration` (integer) - Default duration in minutes
  - `notification_enabled` (boolean) - Enable push notifications
  - `notification_minutes_before` (integer) - Minutes before event to notify
  - `work_start_time` (time) - Work day start time for scheduling
  - `work_end_time` (time) - Work day end time for scheduling
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `scheduled_events`
  Stores events scheduled through the app
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `start_time` (timestamptz) - Event start time
  - `end_time` (timestamptz) - Event end time
  - `event_type` (event_type enum) - 'power_block', 'reset', 'task', 'other'
  - `task_id` (uuid) - Optional link to task
  - `journal_entry_id` (uuid) - Optional link to journal entry
  - `external_calendar_id` (text) - ID from external calendar provider
  - `is_synced` (boolean) - Whether synced to external calendar
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all three tables; policies granted to `authenticated` and
    scoped to auth.uid().
  - `user_id` defaults to auth.uid() so client inserts that omit it are still
    attributed to the caller.
  - `scheduled_events` links to tasks and journal entries through composite
    foreign keys, so an event cannot reference another user's row.

  ## Important Notes
  - `calendar_settings` is unique on (user_id, provider), not provider alone.
    A global unique constraint would have allowed only one Google connection
    across the entire user base.
  - `calendar_preferences` is unique on user_id, which is the invariant the
    client's .maybeSingle() read already assumes.
  - The original global default preferences row has been removed: a seeded row
    cannot belong to anyone, and the client already falls back to in-memory
    defaults when no row exists, creating one on first save.
  - OAuth tokens should be encrypted before storage
  - External calendar integration requires API credentials
  - Time slot suggestions will use work hours preferences
*/

-- Create event_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('power_block', 'reset', 'task', 'other');
  END IF;
END $$;

-- Create calendar_settings table
CREATE TABLE IF NOT EXISTS calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  is_connected boolean DEFAULT false,
  sync_enabled boolean DEFAULT false,
  last_synced_at timestamptz,
  access_token_encrypted text DEFAULT '',
  refresh_token_encrypted text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- Create calendar_preferences table
CREATE TABLE IF NOT EXISTS calendar_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_suggest_enabled boolean DEFAULT false,
  default_power_block_duration integer DEFAULT 60,
  notification_enabled boolean DEFAULT false,
  notification_minutes_before integer DEFAULT 15,
  work_start_time time DEFAULT '09:00:00',
  work_end_time time DEFAULT '17:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Create scheduled_events table
CREATE TABLE IF NOT EXISTS scheduled_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  event_type event_type NOT NULL DEFAULT 'other',
  task_id uuid,
  journal_entry_id uuid,
  external_calendar_id text DEFAULT '',
  is_synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time),
  FOREIGN KEY (task_id, user_id)
    REFERENCES tasks(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY (journal_entry_id, user_id)
    REFERENCES journal_entries(id, user_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_settings_provider ON calendar_settings(provider);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_start_time ON scheduled_events(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_task_id ON scheduled_events(task_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_event_type ON scheduled_events(event_type);

-- Every RLS policy filters on user_id.
CREATE INDEX IF NOT EXISTS idx_calendar_settings_user_id ON calendar_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_preferences_user_id ON calendar_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_user_id ON scheduled_events(user_id);

-- Enable RLS
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_events ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file can be re-run.
DROP POLICY IF EXISTS "Allow public read access to calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Allow public insert to calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Allow public update to calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Allow public delete to calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Users can read own calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Users can insert own calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Users can update own calendar_settings" ON calendar_settings;
DROP POLICY IF EXISTS "Users can delete own calendar_settings" ON calendar_settings;

CREATE POLICY "Users can read own calendar_settings"
  ON calendar_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar_settings"
  ON calendar_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar_settings"
  ON calendar_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar_settings"
  ON calendar_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for calendar_preferences
DROP POLICY IF EXISTS "Allow public read access to calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Allow public insert to calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Allow public update to calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Users can read own calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Users can insert own calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Users can update own calendar_preferences" ON calendar_preferences;
DROP POLICY IF EXISTS "Users can delete own calendar_preferences" ON calendar_preferences;

CREATE POLICY "Users can read own calendar_preferences"
  ON calendar_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar_preferences"
  ON calendar_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar_preferences"
  ON calendar_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar_preferences"
  ON calendar_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for scheduled_events
DROP POLICY IF EXISTS "Allow public read access to scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Allow public insert to scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Allow public update to scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Allow public delete to scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Users can read own scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Users can insert own scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Users can update own scheduled_events" ON scheduled_events;
DROP POLICY IF EXISTS "Users can delete own scheduled_events" ON scheduled_events;

CREATE POLICY "Users can read own scheduled_events"
  ON scheduled_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled_events"
  ON scheduled_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled_events"
  ON scheduled_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled_events"
  ON scheduled_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

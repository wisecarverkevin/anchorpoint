/*
  # Calendar Integration Schema

  ## Overview
  Creates the database structure for calendar integration settings and preferences,
  allowing users to sync with external calendars and manage scheduling preferences.

  ## New Tables
  
  ### `calendar_settings`
  Stores user calendar integration preferences and sync status
  - `id` (uuid, primary key)
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
  - Enable RLS on all tables
  - Add policies for public access (should be restricted to authenticated users in production)

  ## Important Notes
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
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  is_connected boolean DEFAULT false,
  sync_enabled boolean DEFAULT false,
  last_synced_at timestamptz,
  access_token_encrypted text DEFAULT '',
  refresh_token_encrypted text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider)
);

-- Create calendar_preferences table
CREATE TABLE IF NOT EXISTS calendar_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_suggest_enabled boolean DEFAULT false,
  default_power_block_duration integer DEFAULT 60,
  notification_enabled boolean DEFAULT false,
  notification_minutes_before integer DEFAULT 15,
  work_start_time time DEFAULT '09:00:00',
  work_end_time time DEFAULT '17:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scheduled_events table
CREATE TABLE IF NOT EXISTS scheduled_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  event_type event_type NOT NULL DEFAULT 'other',
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  journal_entry_id uuid REFERENCES journal_entries(id) ON DELETE CASCADE,
  external_calendar_id text DEFAULT '',
  is_synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_settings_provider ON calendar_settings(provider);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_start_time ON scheduled_events(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_task_id ON scheduled_events(task_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_events_event_type ON scheduled_events(event_type);

-- Enable RLS
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_events ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_settings
CREATE POLICY "Allow public read access to calendar_settings"
  ON calendar_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to calendar_settings"
  ON calendar_settings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to calendar_settings"
  ON calendar_settings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to calendar_settings"
  ON calendar_settings FOR DELETE
  TO public
  USING (true);

-- Create policies for calendar_preferences
CREATE POLICY "Allow public read access to calendar_preferences"
  ON calendar_preferences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to calendar_preferences"
  ON calendar_preferences FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to calendar_preferences"
  ON calendar_preferences FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for scheduled_events
CREATE POLICY "Allow public read access to scheduled_events"
  ON scheduled_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to scheduled_events"
  ON scheduled_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to scheduled_events"
  ON scheduled_events FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to scheduled_events"
  ON scheduled_events FOR DELETE
  TO public
  USING (true);

-- Insert default preferences
INSERT INTO calendar_preferences (
  auto_suggest_enabled,
  default_power_block_duration,
  notification_enabled,
  notification_minutes_before,
  work_start_time,
  work_end_time
) VALUES (
  false,
  60,
  false,
  15,
  '09:00:00',
  '17:00:00'
) ON CONFLICT DO NOTHING;
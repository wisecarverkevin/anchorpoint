/*
  # Create Reset Prompts Schema

  1. New Tables
    - `reset_prompts`
      - `id` (uuid, primary key)
      - `reset_type` (text, enum: clarity, gratitude, insight)
      - `prompt_text` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reset_prompts` table
    - Add policy for public read access (prompts are reference data)

  3. Data
    - Insert the three reset types with their respective prompts
*/

CREATE TABLE IF NOT EXISTS reset_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_type text NOT NULL CHECK (reset_type IN ('clarity', 'gratitude', 'insight')),
  prompt_text text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reset_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reset prompts"
  ON reset_prompts
  FOR SELECT
  TO public
  USING (true);

-- Insert Clarity Reset prompts
INSERT INTO reset_prompts (reset_type, prompt_text, order_index) VALUES
  ('clarity', 'What just happened that triggered this feeling?', 1),
  ('clarity', 'What story are you telling yourself about it?', 2),
  ('clarity', 'What do you really want in this moment?', 3),
  ('clarity', 'What would be a more empowering version of this story?', 4),
  ('clarity', 'What action are you committed to take after this reset?', 5);

-- Insert Gratitude Reset prompts
INSERT INTO reset_prompts (reset_type, prompt_text, order_index) VALUES
  ('gratitude', 'What went right today or this week?', 1),
  ('gratitude', 'Who or what are you thankful for right now?', 2),
  ('gratitude', 'What moment recently made you feel alive or connected?', 3),
  ('gratitude', 'What have you been taking for granted?', 4),
  ('gratitude', 'How can you show appreciation today?', 5);

-- Insert Insight Reset prompts
INSERT INTO reset_prompts (reset_type, prompt_text, order_index) VALUES
  ('insight', 'What truth did you realize today?', 1),
  ('insight', 'What''s a lesson life has been trying to teach you?', 2),
  ('insight', 'What mistake or habit are you ready to change?', 3),
  ('insight', 'What does your wiser self know that you''ve been ignoring?', 4),
  ('insight', 'What''s your next right step?', 5);
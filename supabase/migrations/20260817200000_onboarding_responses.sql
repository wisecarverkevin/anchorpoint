/*
  # Onboarding assessment responses

  ## New table: `onboarding_responses`
  Written once, when a new user finishes the 25-question assessment.

  - `id` (uuid, primary key)
  - `user_id` (uuid, FK -> auth.users) - Owner
  - `responses` (jsonb) - All answers keyed by question number
  - `completed_at` (timestamptz) - When the assessment was finished
  - `created_at` (timestamptz)

  `responses` is keyed by question id rather than by question text:

    {"1": "I hit a wall this week", "2": "36 to 45", "10": ["Stomach knots", "Trouble sleeping"]}

  Ids are stable, wording is not — rephrasing a question later must not orphan
  the answers already collected. Single-select and text answers are strings;
  multi-select answers are arrays.

  ## Security
  - RLS enabled; all four policies granted to `authenticated` and scoped to
    auth.uid(). A user can only ever read or write their own row.
  - `user_id` defaults to auth.uid(), so a client insert that omits it is still
    attributed to the caller and cannot be forged.

  ## Notes
  - UNIQUE (user_id) enforces "runs once" at the database level rather than
    relying on the metadata flag alone. If the flag write fails after a
    successful insert, a retry cannot create a duplicate row.
  - A shape guard keeps `responses` an object, so readers never have to defend
    against an array or scalar arriving from a client bug.
*/

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  CONSTRAINT onboarding_responses_is_object CHECK (jsonb_typeof(responses) = 'object')
);

CREATE INDEX IF NOT EXISTS onboarding_responses_user_id_idx
  ON onboarding_responses (user_id);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Postgres has no CREATE POLICY IF NOT EXISTS; drop first so this file re-runs.
DROP POLICY IF EXISTS "Users can read own onboarding_responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding_responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding_responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can delete own onboarding_responses" ON onboarding_responses;

CREATE POLICY "Users can read own onboarding_responses"
  ON onboarding_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding_responses"
  ON onboarding_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding_responses"
  ON onboarding_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding_responses"
  ON onboarding_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

/*
  # Today's practice — per-item notes, and the Work & purpose cornerstone

  ## Changes

  1. `daily_core_8.notes` (jsonb) — free-text answers to "What did you actually
     do?", stored per item alongside the existing boolean columns. Shape is a
     flat object keyed by the item's column name:

       {"fitness": "ran three miles before work", "memoirs": "wrote about the reorg"}

     Keyed by column name rather than display label so renaming a label later is
     a UI-only change and never orphans stored text.

  2. The `Business` cornerstone becomes `Work & purpose`, in existing rows and in
     the signup seed function so new accounts get the new name.

  ## Notes on scope
  The other renames in this pass (Fuel -> Nourishment, Hot list -> Today's focus,
  and so on) are display labels only. Their underlying column names and
  `task_status` enum values are internal identifiers that no user ever sees, so
  they are deliberately left alone — renaming them would rewrite the table and
  every query for no visible benefit.
*/

-- 1. Per-item notes -----------------------------------------------------------

ALTER TABLE daily_core_8
  ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '{}'::jsonb;

/*
  Guard the shape: a flat JSON object. Without this, a client bug could store an
  array or a scalar and every reader would have to defend against it.
*/
ALTER TABLE daily_core_8
  DROP CONSTRAINT IF EXISTS daily_core_8_notes_is_object;

ALTER TABLE daily_core_8
  ADD CONSTRAINT daily_core_8_notes_is_object
  CHECK (jsonb_typeof(notes) = 'object');

-- 2. Business -> Work & purpose ----------------------------------------------

UPDATE cornerstones
SET name = 'Work & purpose',
    description = 'Career, contribution, and the work that gives your days meaning'
WHERE name = 'Business';

/*
  Replace the signup seed so new accounts get the new name. Body is otherwise
  identical to the original in 20251208023059 — SECURITY DEFINER is still
  required because the trigger runs during signup with no JWT, so auth.uid() is
  NULL and the RLS INSERT policy would reject the write.
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
    (target_user_id, 'Work & purpose', 'Career, contribution, and the work that gives your days meaning', 'briefcase', '#3B82F6', 2),
    (target_user_id, 'Life', 'Relationships, experiences, and life balance', 'heart', '#F59E0B', 3),
    (target_user_id, 'Higher Power', 'Spirituality, purpose, and deeper meaning', 'sparkles', '#8B5CF6', 4)
  ON CONFLICT (user_id, name) DO NOTHING;
$$;

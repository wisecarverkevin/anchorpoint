/*
  # Cornerstone colours -> the five-colour system

  Cornerstone colours are stored data, not code, so the visual overhaul has to
  reach them with a migration.

  - Higher Power becomes lavender (#8B7EC8). Lavender is reserved for exactly
    two things in the system: this cornerstone, and the background tint during
    a sad or fearful Reset session.
  - The other three carried Tailwind defaults from the original seed
    (#10B981, #3B82F6, #F59E0B) which sit outside the palette. They move onto
    the primary teal, distinguished by tint rather than by hue so no cornerstone
    reads as more urgent than another.

  Existing rows and the signup seed are both updated, so current accounts and
  new ones agree.
*/

UPDATE cornerstones SET color = '#8B7EC8' WHERE name = 'Higher Power';
UPDATE cornerstones SET color = '#1D9E75' WHERE name = 'Self';
UPDATE cornerstones SET color = '#3EB48D' WHERE name = 'Life';
UPDATE cornerstones SET color = '#17805F' WHERE name = 'Work & purpose';

CREATE OR REPLACE FUNCTION seed_default_cornerstones(target_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO cornerstones (user_id, name, description, icon, color, order_index)
  VALUES
    (target_user_id, 'Self', 'Personal growth, health, and well-being', 'user', '#1D9E75', 1),
    (target_user_id, 'Work & purpose', 'Career, contribution, and the work that gives your days meaning', 'briefcase', '#17805F', 2),
    (target_user_id, 'Life', 'Relationships, experiences, and life balance', 'heart', '#3EB48D', 3),
    (target_user_id, 'Higher Power', 'Spirituality, purpose, and deeper meaning', 'sparkles', '#8B7EC8', 4)
  ON CONFLICT (user_id, name) DO NOTHING;
$$;

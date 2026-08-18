/*
  # Reset emotion families

  ## Why
  The guided Reset flow records the primary emotion family the user selected
  rather than one of the three original prompt categories. `journal_entries`
  still carries the old CHECK constraint, so every save from the new flow would
  fail with a constraint violation.

  ## Changes
  - `journal_entries.reset_type` now accepts the five emotion families plus
    `unspecified` (used when a user completes a reset without naming a feeling,
    which step 3 permits).
  - The old values ('clarity', 'gratitude', 'insight') are dropped from this
    table's constraint. `reset_prompts` keeps its own separate constraint and is
    unaffected — that table is reference data for the previous flow.

  ## Notes
  - This is a constraint swap only. Because `reset_type` is a text column with a
    CHECK rather than a Postgres ENUM, adding a sixth family later is another
    one-line swap with no ALTER TYPE migration and no table rewrite.
  - `content` remains `text` and now holds a JSON document (all 11 answers).
    Postgres will store it fine, but it is not queryable as JSON — converting the
    column to `jsonb` is a separate decision, deliberately not made here.
*/

ALTER TABLE journal_entries
  DROP CONSTRAINT IF EXISTS journal_entries_reset_type_check;

ALTER TABLE journal_entries
  ADD CONSTRAINT journal_entries_reset_type_check
  CHECK (reset_type IN ('anger', 'fear', 'sadness', 'joy', 'confusion', 'unspecified'));

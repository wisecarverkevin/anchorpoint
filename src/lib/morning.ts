/*
  Shared rules for the morning check-in.

  App.tsx decides whether to show the screen and MorningCheckIn writes the row,
  so both must agree on what "today" and "morning" mean. Keeping the definitions
  here means they cannot drift apart.
*/

export const MORNING_CUTOFF_HOUR = 10;

export const SLEEP_OPTIONS = [
  'Really well',
  'Decent',
  'Rough',
  'Barely at all',
] as const;

export type SleepQuality = (typeof SLEEP_OPTIONS)[number];

/*
  The user's local calendar date as YYYY-MM-DD.

  Deliberately not `toISOString().slice(0, 10)` — that converts to UTC first, so
  anyone west of Greenwich gets yesterday's date for part of their evening and,
  more importantly here, the wrong date during the early morning this screen
  exists to cover.
*/
export function localDateString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isMorning(now: Date = new Date()): boolean {
  return now.getHours() < MORNING_CUTOFF_HOUR;
}

/* "Monday, August 17." — the trailing period is part of the design. */
export function formatMorningDate(now: Date = new Date()): string {
  return `${now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}.`;
}

/*
  A name to greet by. Prefers a display name the user actually set; otherwise
  falls back to the email's local part, capitalised.
*/
export function greetingName(
  email: string | undefined,
  metadata?: Record<string, unknown>,
): string {
  /*
    First candidate that is actually a non-empty string wins. Testing presence
    rather than non-emptiness would let a whitespace-only `full_name` win the
    check and then resolve to nothing, skipping `name` entirely.
  */
  for (const candidate of [metadata?.full_name, metadata?.name]) {
    if (typeof candidate !== 'string') continue;
    const trimmed = candidate.trim();
    if (trimmed) return trimmed.split(/\s+/)[0];
  }

  const localPart = (email ?? '').split('@')[0].trim();
  if (!localPart) return 'there';

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

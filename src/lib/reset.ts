/*
  Content and shape for the guided Reset flow.

  Everything the user reads lives here so the component stays presentational and
  the wording can be edited without touching flow logic.
*/

export type EmotionFamily = 'anger' | 'fear' | 'sadness' | 'joy' | 'confusion';

/*
  Persisted as journal_entries.reset_type. 'unspecified' covers a completed
  reset where no feeling was named — step 3 allows that, and the column is
  NOT NULL. Kept in sync with the CHECK constraint in
  20260815000000_reset_emotion_families.sql.
*/
export type ResetTypeValue = EmotionFamily | 'unspecified';

export const RESET_STEP_COUNT = 11;

export const BODY_LOCATIONS = [
  'Head',
  'Eyes',
  'Chest',
  'Throat',
  'Stomach',
  'Shoulders',
  'Legs',
  'Everywhere',
  'Not sure',
] as const;

export const EMOTION_FAMILIES: {
  family: EmotionFamily;
  label: string;
  feelings: string[];
}[] = [
  {
    family: 'anger',
    label: 'Under anger',
    feelings: ['Angry', 'Frustrated', 'Resentful', 'Bitter', 'Betrayed', 'Furious'],
  },
  {
    family: 'fear',
    label: 'Under fear',
    feelings: ['Anxious', 'Worried', 'Insecure', 'Exposed', 'Panicked', 'Nervous'],
  },
  {
    family: 'sadness',
    label: 'Under sadness',
    feelings: ['Sad', 'Disappointed', 'Lonely', 'Empty', 'Defeated', 'Grieving'],
  },
  {
    family: 'joy',
    label: 'Under joy',
    feelings: ['Grateful', 'Proud', 'Hopeful', 'At peace', 'Energized', 'Content'],
  },
  {
    family: 'confusion',
    label: 'Under confusion',
    feelings: ['Lost', 'Stuck', 'Numb', 'Conflicted', 'Overwhelmed', 'Disconnected'],
  },
];

export const CORNERSTONE_OPTIONS = [
  { value: 'Self', hint: 'body, mind, health' },
  { value: 'Higher power', hint: 'faith, spirit, purpose' },
  { value: 'Life', hint: 'family, relationships' },
  { value: 'Work & purpose', hint: 'career, contribution, growth' },
] as const;

/*
  Pill colours for the emotion families, used wherever a reset is summarised.
  Kept as hex rather than Tailwind classes because the family is only known at
  runtime and Tailwind cannot generate classes from a dynamic value.
*/
export const EMOTION_STYLES: Record<ResetTypeValue, { label: string; text: string; bg: string }> = {
  anger: { label: 'Anger', text: '#B5453A', bg: 'rgba(232, 106, 93, 0.14)' },
  fear: { label: 'Fear', text: '#9A6B15', bg: 'rgba(217, 154, 43, 0.16)' },
  sadness: { label: 'Sadness', text: '#3B6489', bg: 'rgba(74, 127, 181, 0.14)' },
  joy: { label: 'Joy', text: '#157A5A', bg: 'rgba(29, 158, 117, 0.14)' },
  confusion: { label: 'Confusion', text: '#6D42C4', bg: 'rgba(139, 92, 246, 0.14)' },
  /* A completed reset where no feeling was named still needs a pill. */
  unspecified: { label: 'Unnamed', text: '#57534E', bg: 'rgba(120, 113, 108, 0.12)' },
};

export function emotionStyle(resetType: string) {
  return EMOTION_STYLES[resetType as ResetTypeValue] ?? EMOTION_STYLES.unspecified;
}

/*
  Which feeling belongs to which family. Built from EMOTION_FAMILIES so the two
  can never drift apart.
*/
const FEELING_TO_FAMILY = new Map<string, EmotionFamily>(
  EMOTION_FAMILIES.flatMap((group) =>
    group.feelings.map((feeling) => [feeling, group.family] as const),
  ),
);

/*
  The primary family is the one the user picked the most feelings from. Ties
  break toward the order in EMOTION_FAMILIES so the result is deterministic
  rather than dependent on click order.
*/
export function primaryEmotionFamily(selected: string[]): ResetTypeValue {
  const tally = new Map<EmotionFamily, number>();

  for (const feeling of selected) {
    const family = FEELING_TO_FAMILY.get(feeling);
    if (family) {
      tally.set(family, (tally.get(family) ?? 0) + 1);
    }
  }

  let winner: ResetTypeValue = 'unspecified';
  let best = 0;

  for (const group of EMOTION_FAMILIES) {
    const count = tally.get(group.family) ?? 0;
    if (count > best) {
      best = count;
      winner = group.family;
    }
  }

  return winner;
}

/* Keys match the field names the coach prompt expects. */
export interface ResetAnswers {
  entry: string;
  bodyLocations: string[];
  feelings: string[];
  underneath: string;
  cornerstone: string;
  outsideView: string;
  miracle: string;
  friend: string;
  mirror: string;
  knowNow: string;
  oneStep: string;
  cameInFeeling: string;
  leavingWith: string;
}

export const EMPTY_ANSWERS: ResetAnswers = {
  entry: '',
  bodyLocations: [],
  feelings: [],
  underneath: '',
  cornerstone: '',
  outsideView: '',
  miracle: '',
  friend: '',
  mirror: '',
  knowNow: '',
  oneStep: '',
  cameInFeeling: '',
  leavingWith: '',
};

/* Flattened for the coach payload, which is a flat string map. */
export function answersForCoach(a: ResetAnswers): Record<string, string> {
  return {
    entry: a.entry,
    body: a.bodyLocations.join(', '),
    emotions: a.feelings.join(', '),
    underneath: a.underneath,
    cornerstone: a.cornerstone,
    outsideView: a.outsideView,
    miracle: a.miracle,
    friend: a.friend,
    mirror: a.mirror,
    knowNow: a.knowNow,
    oneStep: a.oneStep,
    cameInFeeling: a.cameInFeeling,
    leavingWith: a.leavingWith,
  };
}

export function closingSentence(a: ResetAnswers): string {
  const came = a.cameInFeeling.trim() || '—';
  const leaving = a.leavingWith.trim() || '—';
  return `I came in feeling ${came} and I am leaving with ${leaving}.`;
}

export const RESET_POINTS = 65;

/*
  Labels for the stored answers, in the order they were asked. Drives the
  expanded view in the history screen so it reads as prose rather than JSON.
*/
export const ANSWER_LABELS: { key: keyof ResetAnswers; label: string }[] = [
  { key: 'entry', label: 'What brought you here' },
  { key: 'bodyLocations', label: 'Where you felt it' },
  { key: 'feelings', label: 'What you were feeling' },
  { key: 'underneath', label: 'Underneath that' },
  { key: 'cornerstone', label: 'Rooted in' },
  { key: 'outsideView', label: 'What someone watching would see' },
  { key: 'miracle', label: 'If it had already shifted' },
  { key: 'friend', label: 'What you told your friend' },
  { key: 'mirror', label: 'How it landed reading it back' },
  { key: 'knowNow', label: 'What you know now' },
  { key: 'oneStep', label: 'Your one step' },
];

/*
  Stored content is a JSON string. Parsed defensively: a malformed or legacy
  row should render as much as it can rather than breaking the whole list.
*/
export function parseResetContent(content: string): Partial<ResetAnswers> | null {
  try {
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Partial<ResetAnswers>;
  } catch {
    return null;
  }
}

/*
  Fallback interstitials, used when the coach toggle is on but the Edge Function
  is unreachable (not deployed, offline, rate limited). Keeps the flow warm
  instead of surfacing an error mid-session. Indexed by the step just completed.
*/
export const FALLBACK_COACH_LINES: Record<number, string> = {
  1: 'Thank you for starting. You did not have to say it perfectly, and you did not need to.',
  2: 'Your body has been carrying this. Noticing where is the first honest step.',
  3: 'Naming it takes something. That was not a small thing to write down.',
  4: 'Knowing where it is rooted makes it something you can actually work with.',
  5: 'Stepping outside your own head for a second is hard. You just did it.',
  6: 'Hold on to that picture. It tells you what you are actually moving toward.',
  7: 'You just spoke to your friend with real care. Stay with that for a moment.',
  8: 'Reading your own words back is its own kind of honesty.',
  9: 'Even a small shift counts. You are not where you were eleven questions ago.',
  10: 'One inch forward is still forward. That is the whole point.',
};

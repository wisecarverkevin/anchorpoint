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
  Which family a feeling belongs to. Built from EMOTION_FAMILIES so the two can
  never drift apart.
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

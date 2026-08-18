import type { AvatarStageInfo, DailyCore8 } from './types';

export const AVATAR_STAGES: Record<number, AvatarStageInfo> = {
  0: {
    stage: 'still',
    name: 'Still',
    affirmation: 'Stillness holds the key.',
    progress: 0,
  },
  1: {
    stage: 'centered',
    name: 'Centered',
    affirmation: "You've unlocked Centeredness.",
    progress: 1,
  },
  2: {
    stage: 'rising',
    name: 'Rising',
    affirmation: "You're Rising.",
    progress: 2,
  },
  3: {
    stage: 'awakened',
    name: 'Awakened',
    affirmation: 'You are Awakened.',
    progress: 3,
  },
  4: {
    stage: 'energized',
    name: 'Energized',
    affirmation: 'You are Energized.',
    progress: 4,
  },
  5: {
    stage: 'empowered',
    name: 'Empowered',
    affirmation: 'You are Empowered.',
    progress: 5,
  },
  6: {
    stage: 'radiant',
    name: 'Radiant',
    affirmation: 'You are Radiant.',
    progress: 6,
  },
  7: {
    stage: 'ascended',
    name: 'Ascended',
    affirmation: 'You have Ascended.',
    progress: 7,
  },
  8: {
    stage: 'anchorpoint',
    name: 'AnchorPoint',
    affirmation: "You've reached AnchorPoint.",
    progress: 8,
  },
};

export function calculateProgress(core8: DailyCore8 | null): number {
  if (!core8) return 0;

  let count = 0;
  if (core8.fitness) count++;
  if (core8.fuel) count++;
  if (core8.meditation) count++;
  if (core8.memoirs) count++;
  if (core8.person_1) count++;
  if (core8.person_2) count++;
  if (core8.discovery) count++;
  if (core8.declare) count++;

  return count;
}

export function getAvatarStageInfo(progress: number): AvatarStageInfo {
  return AVATAR_STAGES[Math.min(Math.max(progress, 0), 8)];
}

export function getProgressPercentage(progress: number): number {
  return (progress / 8) * 100;
}

/*
  The eight daily items. `key` is the column name in daily_core_8 and the key
  used inside its `notes` JSON — it is an internal identifier, so labels can be
  reworded freely without touching stored data.
*/
export const PRACTICE_ITEMS = [
  {
    key: 'fitness',
    label: 'Move your body',
    description: 'Physical movement — a workout, a walk, anything that gets you going',
  },
  {
    key: 'fuel',
    label: 'Nourishment',
    description: 'Eating and drinking with intention today',
  },
  {
    key: 'meditation',
    label: 'Meditation or prayer',
    description: 'Quiet time for your mind and spirit',
  },
  {
    key: 'memoirs',
    label: 'Reflection',
    description: 'Write something honest about how you are doing',
  },
  {
    key: 'person_1',
    label: 'Connect — someone you love',
    description: 'Reach out to someone who matters to you',
  },
  {
    key: 'person_2',
    label: 'Reach out intentionally',
    description: 'A second meaningful connection today',
  },
  {
    key: 'discovery',
    label: 'Learn something new',
    description: 'A book, podcast, article, or conversation that taught you something',
  },
  {
    key: 'declare',
    label: 'Your word for today',
    description: 'One intention you are bringing into this day',
  },
] as const;

export type PracticeItemKey = (typeof PRACTICE_ITEMS)[number]['key'];

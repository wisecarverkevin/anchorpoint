import type { AvatarStage, AvatarStageInfo, DailyCore8 } from './types';

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

export const CORE_8_ITEMS = [
  { key: 'fitness', label: 'Fitness', description: 'Move your body' },
  { key: 'fuel', label: 'Fuel', description: 'Nourish yourself' },
  { key: 'meditation', label: 'Meditation', description: 'Center your mind' },
  { key: 'memoirs', label: 'Memoirs', description: 'Reflect and journal' },
  { key: 'person_1', label: 'Person 1', description: 'Connect with someone' },
  { key: 'person_2', label: 'Person 2', description: 'Connect with another' },
  { key: 'discovery', label: 'Discovery', description: 'Learn something new' },
  { key: 'declare', label: 'Declare', description: 'Affirm your path' },
] as const;

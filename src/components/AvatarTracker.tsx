import { User, Flame, Box, Rabbit, Cross } from 'lucide-react';
import type { AvatarStyle, AvatarStage } from '../lib/types';
import { getProgressPercentage } from '../lib/avatar';

interface AvatarTrackerProps {
  stage: AvatarStage;
  stageName: string;
  progress: number;
  avatarStyle: AvatarStyle;
}

const AVATAR_ICONS: Record<AvatarStyle, typeof User> = {
  human_silhouette: User,
  flame_spirit: Flame,
  geometry_being: Box,
  animal_totem: Rabbit,
  faith_variant: Cross,
};

const STAGE_COLORS: Record<AvatarStage, string> = {
  still: 'from-stone-400 to-stone-500',
  centered: 'from-stone-500 to-stone-600',
  rising: 'from-amber-400 to-amber-500',
  awakened: 'from-amber-500 to-orange-500',
  energized: 'from-orange-500 to-red-500',
  empowered: 'from-red-500 to-pink-500',
  radiant: 'from-pink-500 to-purple-500',
  ascended: 'from-purple-500 to-indigo-500',
  anchorpoint: 'from-indigo-500 via-purple-500 to-pink-500',
};

const STAGE_GLOW: Record<AvatarStage, string> = {
  still: 'shadow-stone-500/20',
  centered: 'shadow-stone-600/30',
  rising: 'shadow-amber-500/40',
  awakened: 'shadow-orange-500/50',
  energized: 'shadow-red-500/60',
  empowered: 'shadow-pink-500/70',
  radiant: 'shadow-purple-500/80',
  ascended: 'shadow-indigo-500/90',
  anchorpoint: 'shadow-purple-500/100',
};

export function AvatarTracker({ stage, stageName, progress, avatarStyle }: AvatarTrackerProps) {
  const Icon = AVATAR_ICONS[avatarStyle];
  const gradient = STAGE_COLORS[stage];
  const glow = STAGE_GLOW[stage];
  const percentage = getProgressPercentage(progress);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${gradient} ${glow} shadow-2xl flex items-center justify-center transform transition-all duration-700 ${
            progress > 0 ? 'scale-100' : 'scale-95 opacity-80'
          }`}
        >
          <Icon
            size={96}
            className="text-white drop-shadow-lg"
            strokeWidth={1.5}
          />
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-56">
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-2 text-center text-sm text-stone-600 font-medium">
            {progress} / 8 Complete
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className={`text-3xl font-light bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {stageName}
        </h3>
        {progress === 8 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
            <span className="text-sm font-medium text-indigo-900">
              Daily Core 8 Complete!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

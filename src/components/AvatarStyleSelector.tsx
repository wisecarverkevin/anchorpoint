import { User, Flame, Box, Rabbit, Cross } from 'lucide-react';
import type { AvatarStyle } from '../lib/types';

interface AvatarStyleSelectorProps {
  selectedStyle: AvatarStyle;
  onSelect: (style: AvatarStyle) => void;
}

const AVATAR_STYLES = [
  {
    style: 'human_silhouette' as AvatarStyle,
    name: 'Human Silhouette',
    description: 'Classic human form',
    icon: User,
  },
  {
    style: 'flame_spirit' as AvatarStyle,
    name: 'Flame Spirit',
    description: 'Burning inner fire',
    icon: Flame,
  },
  {
    style: 'geometry_being' as AvatarStyle,
    name: 'Geometry Being',
    description: 'Sacred geometry',
    icon: Box,
  },
  {
    style: 'animal_totem' as AvatarStyle,
    name: 'Animal Totem',
    description: 'Spirit animal guide',
    icon: Rabbit,
  },
  {
    style: 'faith_variant' as AvatarStyle,
    name: 'Faith Variant',
    description: 'Spiritual symbol',
    icon: Cross,
  },
];

export function AvatarStyleSelector({ selectedStyle, onSelect }: AvatarStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-stone-900 mb-2">Choose Your Avatar Style</h3>
        <p className="text-sm text-stone-600">
          Select an avatar style that resonates with your journey
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {AVATAR_STYLES.map((avatarStyle) => {
          const Icon = avatarStyle.icon;
          const isSelected = selectedStyle === avatarStyle.style;

          return (
            <button
              key={avatarStyle.style}
              onClick={() => onSelect(avatarStyle.style)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-stone-700 bg-stone-50 shadow-md'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-900">
                    {avatarStyle.name}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    {avatarStyle.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

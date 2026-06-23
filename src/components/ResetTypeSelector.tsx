import { Lightbulb, Sparkles, Heart } from 'lucide-react';
import type { ResetType } from '../lib/types';

interface ResetTypeSelectorProps {
  selectedType: ResetType | null;
  onSelect: (type: ResetType) => void;
}

const resetTypes = [
  {
    type: 'clarity' as ResetType,
    name: 'Clarity Reset',
    description: 'Clear your mind and focus on what matters',
    icon: Lightbulb,
  },
  {
    type: 'gratitude' as ResetType,
    name: 'Gratitude Reset',
    description: 'Reflect on what you appreciate in life',
    icon: Heart,
  },
  {
    type: 'insight' as ResetType,
    name: 'Insight Reset',
    description: 'Discover deeper understanding and wisdom',
    icon: Sparkles,
  },
];

export function ResetTypeSelector({ selectedType, onSelect }: ResetTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {resetTypes.map((reset) => {
        const Icon = reset.icon;
        const isSelected = selectedType === reset.type;

        return (
          <button
            key={reset.type}
            onClick={() => onSelect(reset.type)}
            className={`p-6 rounded-lg text-left transition-all ${
              isSelected
                ? 'bg-stone-100 border-2 border-stone-300'
                : 'bg-stone-50 border-2 border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-lg mb-4 bg-white">
                <Icon size={32} className="text-stone-700" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-2">
                {reset.name}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {reset.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function getResetTypeName(type: ResetType): string {
  const reset = resetTypes.find((r) => r.type === type);
  return reset?.name || type;
}

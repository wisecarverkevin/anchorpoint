import { User, Briefcase, Heart, Sparkles } from 'lucide-react';
import type { Cornerstone } from '../lib/types';

interface CornerstoneCardProps {
  cornerstone: Cornerstone;
  onClick: () => void;
  isSelected: boolean;
}

const iconMap = {
  user: User,
  briefcase: Briefcase,
  heart: Heart,
  sparkles: Sparkles,
};

export function CornerstoneCard({ cornerstone, onClick, isSelected }: CornerstoneCardProps) {
  const Icon = iconMap[cornerstone.icon as keyof typeof iconMap] || User;

  return (
    <button
      onClick={onClick}
      className={`relative group p-8 rounded-2xl transition-all duration-300 text-left w-full
        ${isSelected
          ? 'bg-white shadow-2xl scale-105 ring-2 ring-offset-4'
          : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl hover:scale-102'
        }`}
      style={{
        ringColor: isSelected ? cornerstone.color : 'transparent',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${cornerstone.color}20` }}
        >
          <Icon
            size={28}
            style={{ color: cornerstone.color }}
            strokeWidth={2}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {cornerstone.name}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {cornerstone.description}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300"
        style={{
          backgroundColor: cornerstone.color,
          opacity: isSelected ? 1 : 0,
        }}
      />
    </button>
  );
}

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface AffirmationMessageProps {
  affirmation: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function AffirmationMessage({
  affirmation,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: AffirmationMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-1">
        <div className="bg-white rounded-xl px-8 py-6 flex items-center gap-4 min-w-[400px]">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-stone-900">{affirmation}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

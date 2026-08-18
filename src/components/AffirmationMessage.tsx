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
    /*
      Anchored bottom-right, clear of the centred content column. At the top it
      sat directly over the first practice item.

      The pointer-events split is what actually prevents accidental toggles.
      The wrapper is a full-height fixed layer, so it must never intercept
      clicks; the card must always intercept them for as long as it is on
      screen. Putting `pointer-events-none` on the wrapper only while hidden was
      the bug: it also applied during the mount frame and the 300ms fade-out,
      and a click on the visible card passed straight through to the checklist
      row underneath and toggled it.
    */
    <div
      className="fixed bottom-6 right-6 z-50 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-1">
          <div className="bg-white rounded-xl px-6 py-5 flex items-center gap-4 w-[22rem] max-w-[calc(100vw-3rem)]">
            <div className="flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse">
                <Sparkles size={22} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-stone-900">{affirmation}</p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Dismiss"
              className="flex-shrink-0 p-1 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} className="text-stone-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

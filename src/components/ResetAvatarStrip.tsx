import { motion } from 'framer-motion';
import { RESET_STEP_COUNT } from '../lib/reset';
import { breathing } from '../lib/motion';

interface ResetAvatarStripProps {
  /* 0 at the first question, 1 once the reset is complete. */
  progress: number;
}

/*
  A figure that resolves as the session goes on: faint and thin at the start,
  fully drawn and lit by the end. Rendered inline rather than as an image so the
  brightening is a smooth style interpolation instead of a sprite swap.
*/
export function ResetAvatarStrip({ progress }: ResetAvatarStripProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  const opacity = 0.28 + clamped * 0.72;
  const strokeWidth = 1.1 + clamped * 1.0;
  const glow = clamped * 16;
  const haloOpacity = clamped * 0.5;

  return (
    <div className="flex items-center justify-center py-5" aria-hidden="true">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full transition-all duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, #1D9E75 0%, transparent 70%)',
            opacity: haloOpacity,
            filter: `blur(${8 + glow}px)`,
          }}
        />
        {/* Continuous breath: 1.0 -> 1.025 -> 1.0 over 3.5s, forever. */}
        <motion.svg
          animate={breathing}
          width="52"
          height="72"
          viewBox="0 0 52 72"
          fill="none"
          className="relative transition-all duration-700 ease-out"
          style={{ opacity }}
        >
          <circle
            cx="26"
            cy="15"
            r="9"
            stroke="#1D9E75"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <path
            d="M26 25 L26 47"
            stroke="#1D9E75"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M26 31 L13 40 M26 31 L39 40"
            stroke="#1D9E75"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M26 47 L16 66 M26 47 L36 66"
            stroke="#1D9E75"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    </div>
  );
}

interface ResetProgressBarProps {
  step: number;
}

export function ResetProgressBar({ step }: ResetProgressBarProps) {
  const pct = (step / RESET_STEP_COUNT) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-stone-500">
          Step {step} of {RESET_STEP_COUNT}
        </span>
      </div>
      <div
        className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={RESET_STEP_COUNT}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: '#1D9E75' }}
        />
      </div>
    </div>
  );
}

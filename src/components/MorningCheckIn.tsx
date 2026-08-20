import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import {
  SLEEP_OPTIONS,
  formatMorningDate,
  greetingName,
  localDateString,
  type SleepQuality,
} from '../lib/morning';
import { greetingContainer, greetingWord, pressable } from '../lib/motion';

const TEAL = '#1D9E75';

interface MorningCheckInProps {
  /* Called once the row is saved, so the app can fall through to the dashboard. */
  onComplete: () => void;
}

export function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const { user } = useAuth();

  const [sleep, setSleep] = useState<SleepQuality | null>(null);
  const [carrying, setCarrying] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = greetingName(user?.email, user?.user_metadata);
  const canSubmit = sleep !== null && carrying.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);

    /*
      user_id is omitted: the column defaults to auth.uid() and the RLS policy
      rejects any other value, so the client never needs to assert who it is.
    */
    const { error: saveError } = await supabase.from('daily_checkins').insert({
      date: localDateString(),
      sleep_quality: sleep,
      carrying: carrying.trim(),
    });

    if (saveError) {
      /*
        A duplicate means a check-in already exists for today — another tab, or a
        double submit. That is the desired end state, so treat it as success
        rather than blocking the user out of their own app.
      */
      if (saveError.code === '23505') {
        onComplete();
        return;
      }
      setSaving(false);
      setError(saveError.message);
      return;
    }

    onComplete();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-12">
          {/* Each word drifts up and fades in, 0.08s apart. */}
          <motion.h1
            className="font-serif text-3xl text-stone-900 leading-heading"
            variants={greetingContainer}
            initial="hidden"
            animate="visible"
          >
            {`Good morning, ${name}.`.split(' ').map((word, i) => (
              <motion.span key={`${word}-${i}`} variants={greetingWord} className="inline-block mr-[0.28em]">
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <p className="text-stone-500 mt-2">{formatMorningDate()}</p>
          <p className="text-stone-600 mt-6">Take a moment before the day begins.</p>
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-xl text-stone-900 mb-4">How did you sleep?</h2>
          <div className="flex flex-wrap gap-2.5">
            {SLEEP_OPTIONS.map((option) => {
              const selected = sleep === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSleep(option)}
                  aria-pressed={selected}
                  className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                    selected
                      ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-10">
          <label htmlFor="carrying" className="block font-serif text-xl text-stone-900 mb-4">
            What's one thing you're carrying into today?
          </label>
          <textarea
            id="carrying"
            value={carrying}
            onChange={(e) => setCarrying(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors resize-none leading-relaxed"
            placeholder="It can be anything. No one is grading this."
          />
        </div>

        {error && (
          <p className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Could not save your check-in: {error}
          </p>
        )}

        <motion.button
          {...pressable}
          type="submit"
          disabled={!canSubmit || saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: TEAL }}
        >
          {saving && <Loader2 size={17} className="animate-spin" />}
          Begin my day
        </motion.button>
      </form>

      <p className="text-sm text-stone-400 mt-16">AnchorPoint — your daily practice.</p>
    </div>
  );
}

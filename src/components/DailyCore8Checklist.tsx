import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DailyCore8, AvatarStyle, UserAvatarPreferences } from '../lib/types';
import { AvatarTracker } from './AvatarTracker';
import { AvatarStyleSelector } from './AvatarStyleSelector';
import { AffirmationMessage } from './AffirmationMessage';
import {
  calculateProgress,
  getAvatarStageInfo,
  PRACTICE_ITEMS,
  type PracticeItemKey,
} from '../lib/avatar';
import { localDateString } from '../lib/morning';
import { checkDraw } from '../lib/motion';

/* Notes save on a trailing debounce so typing doesn't fire a write per keystroke. */
const NOTE_SAVE_DELAY_MS = 800;

/*
  `notes` is jsonb, so the generated type is the open `Json` union. Narrow it at
  the boundary: anything that isn't a flat object of strings is discarded rather
  than trusted, so a malformed row can't propagate into the UI.
*/
function parseNotes(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

export function DailyCore8Checklist() {
  const [core8Data, setCore8Data] = useState<DailyCore8 | null>(null);
  const [avatarPreferences, setAvatarPreferences] = useState<UserAvatarPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [previousProgress, setPreviousProgress] = useState<number>(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    loadData();
    // Flush nothing on unmount, but do stop pending timers so they can't fire
    // against a torn-down component.
    const timers = saveTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      /*
        The user's local date, shared with the morning check-in so both screens
        agree on what "today" is. toISOString() would convert to UTC first,
        rolling the practice checklist over to tomorrow during the evening for
        anyone west of Greenwich.
      */
      const today = localDateString();

      const [core8Response, prefsResponse] = await Promise.all([
        supabase
          .from('daily_core_8')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('user_avatar_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (core8Response.data) {
        setCore8Data(core8Response.data);
        setNotes(parseNotes(core8Response.data.notes));
        setPreviousProgress(calculateProgress(core8Response.data));
      } else {
        const { data: newCore8 } = await supabase
          .from('daily_core_8')
          .insert({ user_id: user.id, date: today })
          .select()
          .single();
        if (newCore8) {
          setCore8Data(newCore8);
          setNotes(parseNotes(newCore8.notes));
          setPreviousProgress(0);
        }
      }

      if (prefsResponse.data) {
        setAvatarPreferences(prefsResponse.data);
      } else {
        const { data: newPrefs } = await supabase
          .from('user_avatar_preferences')
          .insert({ user_id: user.id, avatar_style: 'human_silhouette' })
          .select()
          .single();
        if (newPrefs) {
          setAvatarPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: PracticeItemKey) => {
    if (!core8Data || typeof core8Data[key] !== 'boolean') return;

    const newValue = !core8Data[key];
    const updatedData = { ...core8Data, [key]: newValue };

    setCore8Data(updatedData);

    const newProgress = calculateProgress(updatedData);

    if (newProgress > previousProgress) {
      const stageInfo = getAvatarStageInfo(newProgress);
      setAffirmation(stageInfo.affirmation);
    }

    setPreviousProgress(newProgress);

    await supabase
      .from('daily_core_8')
      .update({ [key]: newValue })
      .eq('id', core8Data.id);
  };

  const handleNoteChange = (key: PracticeItemKey, value: string) => {
    const next = { ...notes, [key]: value };
    setNotes(next);

    clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => {
      void persistNotes(next);
    }, NOTE_SAVE_DELAY_MS);
  };

  /*
    Writes the whole notes object rather than one key. daily_core_8 has one row
    per user per day, so there is no concurrent-writer case to merge around, and
    a whole-object write keeps stored state identical to what is on screen.
  */
  const persistNotes = async (next: Record<string, string>) => {
    if (!core8Data) return;

    // Drop keys the user has cleared so the column doesn't accumulate empties.
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, text]) => text.trim().length > 0),
    );

    const { error } = await supabase
      .from('daily_core_8')
      .update({ notes: cleaned })
      .eq('id', core8Data.id);

    if (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleStyleChange = async (style: AvatarStyle) => {
    if (!avatarPreferences) return;

    setAvatarPreferences({ ...avatarPreferences, avatar_style: style });

    await supabase
      .from('user_avatar_preferences')
      .update({ avatar_style: style })
      .eq('id', avatarPreferences.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(core8Data);
  const stageInfo = getAvatarStageInfo(progress);
  const avatarStyle = (avatarPreferences?.avatar_style ?? 'human_silhouette') as AvatarStyle;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {affirmation && (
        <AffirmationMessage
          affirmation={affirmation}
          onClose={() => setAffirmation(null)}
        />
      )}

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light text-stone-900">Today's practice</h2>
        <p className="text-lg text-stone-600">
          Complete your daily essentials to advance your avatar
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <AvatarTracker
          stage={stageInfo.stage}
          stageName={stageInfo.name}
          progress={progress}
          avatarStyle={avatarStyle}
        />
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-stone-900">Today's practice</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Settings2 size={20} className="text-stone-600" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-8 p-6 bg-stone-50 rounded-lg">
            <AvatarStyleSelector
              selectedStyle={avatarStyle}
              onSelect={handleStyleChange}
            />
          </div>
        )}

        <div className="space-y-3">
          {PRACTICE_ITEMS.map((item) => {
            const isChecked = core8Data?.[item.key] as boolean;

            return (
              /*
                The row is a div, not a button: the note field lives inside it
                once checked, and a textarea nested in a button is invalid markup
                that would toggle the item on every click into the field.
              */
              <div
                key={item.key}
                className={`w-full rounded-lg border-2 transition-all ${
                  isChecked
                    ? 'border-stone-700 bg-stone-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  aria-pressed={isChecked}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'border-stone-700 bg-stone-700'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && (
                        /* Drawn along its path over 220ms rather than appearing. */
                        <motion.svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.path
                            d="M5 13l4 4L19 7"
                            stroke="#F7F3EE"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            variants={checkDraw}
                          />
                        </motion.svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-stone-900">
                        {item.label}
                      </h4>
                      <p className="text-sm text-stone-600">{item.description}</p>
                    </div>
                  </div>
                </button>

                {isChecked && (
                  <div className="px-4 pb-4 pl-16">
                    <label
                      htmlFor={`note-${item.key}`}
                      className="block text-sm text-stone-600 mb-1.5"
                    >
                      What did you actually do?{' '}
                      <span className="text-stone-400">Optional, but encouraged.</span>
                    </label>
                    <textarea
                      id={`note-${item.key}`}
                      value={notes[item.key] ?? ''}
                      onChange={(e) => handleNoteChange(item.key, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-colors resize-none"
                      placeholder="A sentence is plenty."
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

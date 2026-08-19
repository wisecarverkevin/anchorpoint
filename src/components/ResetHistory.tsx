import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { JournalEntry } from '../lib/types';
import {
  ANSWER_LABELS,
  closingSentence,
  emotionStyle,
  parseResetContent,
  type ResetAnswers,
} from '../lib/reset';

const TEAL = '#1D9E75';

interface ResetHistoryProps {
  /* Empty-state button sends the user into the Reset flow. */
  onStartReset: () => void;
}

/*
  "Monday, August 17" — same register as the morning check-in. created_at is
  nullable in the schema, so an entry missing one still renders rather than
  throwing on an Invalid Date.
*/
function formatEntryDate(iso: string | null): string {
  if (!iso) return 'Date unknown';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date unknown';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function PatternCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-5 py-4">
      <p className="text-sm text-stone-500 mb-1.5">{label}</p>
      <p className="text-lg font-medium text-stone-900 leading-snug">{value}</p>
    </div>
  );
}

/* Renders one stored answer, skipping anything the user left blank. */
function AnswerBlock({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined;
}) {
  const text = Array.isArray(value) ? value.join(', ') : (value ?? '').trim();
  if (!text) return null;

  return (
    <div>
      <p className="text-sm font-medium tracking-wide uppercase text-stone-400 mb-1.5">
        {label}
      </p>
      <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export function ResetHistory({ onStartReset }: ResetHistoryProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    /* RLS already limits this to the caller's rows, so no user_id filter. */
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading resets:', error);
    } else if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  /* Parsed once per load rather than on every expand/collapse. */
  const parsed = useMemo(
    () =>
      entries.map((entry) => ({
        entry,
        answers: (parseResetContent(entry.content) ?? {}) as Partial<ResetAnswers>,
      })),
    [entries],
  );

  const patterns = useMemo(() => {
    if (parsed.length === 0) return null;

    const tally = (values: string[]) => {
      const counts = new Map<string, number>();
      for (const v of values) {
        if (!v) continue;
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      let best: string | null = null;
      let bestCount = 0;
      for (const [value, count] of counts) {
        if (count > bestCount) {
          best = value;
          bestCount = count;
        }
      }
      return best ? { value: best, count: bestCount } : null;
    };

    const emotion = tally(
      parsed.map(({ entry }) => emotionStyle(entry.reset_type).label),
    );
    const cornerstone = tally(
      parsed.map(({ answers }) => (answers.cornerstone ?? '').trim()),
    );

    return { emotion, cornerstone, total: parsed.length };
  }, [parsed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-500"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-2xl font-light text-stone-900 mb-8 leading-snug">
          Your journey starts with your first reset.
        </h2>
        <button
          type="button"
          onClick={onStartReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: TEAL }}
        >
          <RefreshCw size={17} />
          Start a reset
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-light text-stone-900 mb-2">Your journey</h2>
        <p className="text-stone-600">Everything you have worked through, in your own words.</p>
      </div>

      {patterns && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <PatternCard
            label="Most common feeling"
            value={
              patterns.emotion
                ? `${patterns.emotion.value} · ${patterns.emotion.count}`
                : 'Not named yet'
            }
          />
          <PatternCard
            label="Most used cornerstone"
            value={
              patterns.cornerstone
                ? `${patterns.cornerstone.value} · ${patterns.cornerstone.count}`
                : 'Not chosen yet'
            }
          />
          <PatternCard
            label="Resets completed"
            value={String(patterns.total)}
          />
        </div>
      )}

      <div className="space-y-3">
        {parsed.map(({ entry, answers }) => {
          const style = emotionStyle(entry.reset_type);
          const expanded = expandedId === entry.id;
          const cornerstone = (answers.cornerstone ?? '').trim();

          return (
            <div
              key={entry.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : entry.id)}
                aria-expanded={expanded}
                className="w-full px-6 py-5 text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-3">
                      <span className="text-sm text-stone-500">
                        {formatEntryDate(entry.created_at)}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: style.text, backgroundColor: style.bg }}
                      >
                        {style.label}
                      </span>
                      {cornerstone && (
                        <span className="text-sm text-stone-500">{cornerstone}</span>
                      )}
                    </div>
                    <p className="text-stone-800 leading-relaxed">
                      {closingSentence(answers as ResetAnswers)}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-stone-400 shrink-0 mt-1 transition-transform ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {expanded && (
                <div className="px-6 pb-6 pt-2 border-t border-stone-100 space-y-5 animate-[fadeSlide_240ms_ease-out]">
                  {ANSWER_LABELS.map(({ key, label }) => (
                    <AnswerBlock key={key} label={label} value={answers[key]} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

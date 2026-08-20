import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  TOTAL_QUESTIONS,
  UNDER_18_MESSAGE,
  canAdvance,
  isAnswered,
  visibleQuestions,
  type OnboardingAnswer,
  type OnboardingAnswers,
  type Question,
} from '../lib/onboarding';

const TEAL = '#1D9E75';

interface OnboardingAssessmentProps {
  /* Called once responses are saved and the metadata flag is set. */
  onComplete: () => void;
}

type Stage = 'intro' | 'questions' | 'complete';

export function OnboardingAssessment({ onComplete }: OnboardingAssessmentProps) {
  const [stage, setStage] = useState<Stage>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [index, stage]);

  /*
    Recomputed from the current answers so Q22 appears or disappears the moment
    Q21 changes — including when the user goes back and revises it.
  */
  const shown = visibleQuestions(answers);
  const question: Question | undefined = shown[index];

  const setAnswer = (id: number, value: OnboardingAnswer) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggleMulti = (id: number, option: string) =>
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });

  const goNext = () => {
    if (!question) return;
    if (index + 1 < shown.length) {
      setIndex(index + 1);
    } else {
      void finish();
    }
  };

  const goBack = () => {
    if (stage === 'questions' && index === 0) return;
    setIndex((i) => Math.max(0, i - 1));
  };

  const finish = async () => {
    setSaving(true);
    setError(null);

    /*
      Only answers to questions that were actually shown are persisted, so a
      revised Q21 cannot leave a stale Q22 answer behind.
    */
    const visibleIds = new Set(shown.map((q) => q.id));
    const responses = Object.fromEntries(
      Object.entries(answers).filter(([id, value]) => {
        if (!visibleIds.has(Number(id))) return false;
        return Array.isArray(value) ? value.length > 0 : value.trim().length > 0;
      }),
    );

    /* user_id is omitted: the column defaults to auth.uid() and RLS enforces it. */
    const { error: insertError } = await supabase
      .from('onboarding_responses')
      .insert({ responses, completed_at: new Date().toISOString() });

    /*
      23505 means a row already exists for this user — a double submit or a
      second tab. The assessment is already recorded, so carry on rather than
      trapping them in it.
    */
    if (insertError && insertError.code !== '23505') {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (metaError) {
      setSaving(false);
      setError(metaError.message);
      return;
    }

    setSaving(false);
    setStage('complete');
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-[fadeSlide_320ms_ease-out]">
          <h1 className="font-serif text-3xl text-stone-900 leading-heading mb-6">
            Before we get started
          </h1>
          <p className="text-stone-600 leading-relaxed mb-10">
            AnchorPoint is not therapy or medical advice. It is a personal growth and reflection
            tool. Your answers help us personalize your experience. Everything you share stays
            private and is never sold.
          </p>
          <button
            type="button"
            onClick={() => setStage('questions')}
            className="w-full px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            Let's begin.
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center animate-[fadeSlide_320ms_ease-out]">
          <h1 className="font-serif text-3xl text-stone-900 mb-5">You are set up.</h1>
          <p className="text-stone-600 leading-relaxed mb-10">
            Your answers will shape everything from here. AnchorPoint is ready when you are.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="w-full px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            Take me in.
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const answer = answers[question.id];
  const selectedMulti = Array.isArray(answer) ? answer : [];
  const isLast = index + 1 === shown.length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center px-6 py-16">
      <div ref={scrollAnchor} />

      <div className="w-full max-w-md">
        {/* Numbered by the question's own id so the count stays truthful when Q22 is skipped. */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">
              Question {question.id} of {TOTAL_QUESTIONS}
            </span>
            {!question.required && (
              <span className="text-sm text-stone-400">Optional — you can skip this</span>
            )}
          </div>
          <div
            className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={question.id}
            aria-valuemin={1}
            aria-valuemax={TOTAL_QUESTIONS}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(question.id / TOTAL_QUESTIONS) * 100}%`,
                backgroundColor: TEAL,
              }}
            />
          </div>
        </div>

        {/* Keyed so React remounts on each question, replaying the fade. */}
        <div key={question.id} className="animate-[fadeSlide_320ms_ease-out]">
          {question.heading && (
            <p className="text-sm font-medium tracking-wide uppercase text-stone-400 mb-3">
              {question.heading}
            </p>
          )}

          <h1 className="font-serif text-2xl text-stone-900 leading-heading mb-3">
            {question.question}
          </h1>

          {question.hint && (
            <p className="text-stone-600 leading-relaxed mb-7">{question.hint}</p>
          )}

          <div className={question.hint ? '' : 'mt-7'}>
            {question.type === 'text' && (
              <textarea
                value={typeof answer === 'string' ? answer : ''}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                rows={5}
                autoFocus
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors resize-none leading-relaxed"
                placeholder={question.placeholder}
              />
            )}

            {(question.type === 'single' || question.type === 'multi') && (
              <div className="space-y-2.5">
                {question.options?.map((option) => {
                  const selected =
                    question.type === 'multi'
                      ? selectedMulti.includes(option)
                      : answer === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        question.type === 'multi'
                          ? toggleMulti(question.id, option)
                          : setAnswer(question.id, option)
                      }
                      aria-pressed={selected}
                      className={`w-full px-5 py-4 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-stone-900'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {selected && (
                          <Check size={16} style={{ color: TEAL }} className="shrink-0" />
                        )}
                        <span className="font-medium">{option}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Q2 only: a warm note for minors. Informational — never blocks. */}
          {question.id === 2 && answer === 'Under 18' && (
            <p className="mt-5 text-sm text-stone-700 bg-[#1D9E75]/10 border border-[#1D9E75]/25 rounded-xl px-4 py-3 leading-relaxed">
              {UNDER_18_MESSAGE}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Could not save your answers: {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={goBack}
            disabled={index === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance(question, answer) || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: TEAL }}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isLast ? 'Finish' : !question.required && !isAnswered(answer) ? 'Skip' : 'Continue'}
            {!isLast && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}

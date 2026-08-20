import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight, Loader2, MessageCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import {
  BODY_LOCATIONS,
  CORNERSTONE_OPTIONS,
  EMOTION_FAMILIES,
  EMPTY_ANSWERS,
  FALLBACK_COACH_LINES,
  RESET_POINTS,
  RESET_STEP_COUNT,
  answersForCoach,
  closingSentence,
  primaryEmotionFamily,
  type ResetAnswers,
} from '../lib/reset';
import { ResetAvatarStrip, ResetProgressBar } from './ResetAvatarStrip';
import { pressable, stepTransition, stepVariants } from '../lib/motion';

const TEAL = '#1D9E75';
/* Gold is reserved for earned moments — this badge is one of the few. */
const GOLD = '#C9A84C';

/* Shared field styling so every step's inputs match without repetition. */
const textareaClass =
  'w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 ' +
  'focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors resize-none leading-relaxed';

const inputClass =
  'px-4 py-2 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 ' +
  'focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors';

function StepShell({
  question,
  hint,
  children,
  example,
}: {
  question: string;
  hint?: string;
  children: ReactNode;
  example?: string;
}) {
  return (
    <div className="animate-[fadeSlide_320ms_ease-out]">
      <h2 className="font-serif text-2xl text-stone-900 leading-heading mb-3">{question}</h2>
      {hint && <p className="text-stone-600 leading-relaxed mb-6">{hint}</p>}
      <div className={hint ? '' : 'mt-6'}>{children}</div>
      {example && (
        <p className="mt-4 text-sm text-stone-500 leading-relaxed italic">{example}</p>
      )}
    </div>
  );
}

function ChoiceChip({
  label,
  selected,
  onClick,
  hint,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2.5 rounded-xl border text-left transition-all ${
        selected
          ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-stone-900'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
      }`}
    >
      <span className="flex items-center gap-2">
        {selected && <Check size={15} style={{ color: TEAL }} className="shrink-0" />}
        <span className="font-medium">{label}</span>
      </span>
      {hint && <span className="block text-sm text-stone-500 mt-0.5">{hint}</span>}
    </button>
  );
}

export function Reset() {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  /* +1 advancing, -1 going back — drives which way the step slides. */
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<ResetAnswers>(EMPTY_ANSWERS);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [coachEnabled, setCoachEnabled] = useState(true);
  const [coachLine, setCoachLine] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  const scrollAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, complete]);

  const set = <K extends keyof ResetAnswers>(key: K, value: ResetAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const toggleIn = (key: 'bodyLocations' | 'feelings', value: string) =>
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  /*
    The text the coach reacts to between steps — whatever the user just entered.
    Chip steps get a readable sentence rather than a bare array.
  */
  const lastAnswerText = (completedStep: number): string => {
    switch (completedStep) {
      case 1:
        return answers.entry;
      case 2:
        return `I am feeling it in: ${answers.bodyLocations.join(', ')}`;
      case 3:
        return [
          answers.feelings.length > 0 ? `I am feeling: ${answers.feelings.join(', ')}` : '',
          answers.underneath.trim(),
        ]
          .filter(Boolean)
          .join('. ');
      case 4:
        return `This is rooted in: ${answers.cornerstone}`;
      case 5:
        return answers.outsideView;
      case 6:
        return answers.miracle;
      case 7:
        return answers.friend;
      case 8:
        return answers.mirror;
      case 9:
        return answers.knowNow;
      case 10:
        return answers.oneStep;
      default:
        return '';
    }
  };

  const fetchCoachLine = async (completedStep: number) => {
    const said = lastAnswerText(completedStep).trim();
    if (!said) {
      setCoachLine(FALLBACK_COACH_LINES[completedStep] ?? null);
      return;
    }

    setCoachLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-coach', {
        body: { mode: 'interstitial', justAnswered: said },
      });
      if (error) throw error;
      setCoachLine(data?.text?.trim() || FALLBACK_COACH_LINES[completedStep] || null);
    } catch {
      // The flow must never stall on the coach. Fall back to a warm local line.
      setCoachLine(FALLBACK_COACH_LINES[completedStep] ?? null);
    } finally {
      setCoachLoading(false);
    }
  };

  const goNext = () => {
    const completedStep = step;
    if (completedStep === RESET_STEP_COUNT) {
      void finish();
      return;
    }
    setDirection(1);
    setStep(completedStep + 1);
    setCoachLine(null);
    if (coachEnabled) void fetchCoachLine(completedStep);
  };

  const goBack = () => {
    if (step === 1) return;
    setDirection(-1);
    setStep(step - 1);
    setCoachLine(null);
  };

  const finish = async () => {
    setSaving(true);
    setSaveError(null);

    const resetType = primaryEmotionFamily(answers.feelings);

    /*
      content holds every answer as JSON; tags holds the individual feeling
      words. user_id is omitted deliberately — the column defaults to auth.uid()
      and the RLS policy rejects any other value.
    */
    const { error } = await supabase.from('journal_entries').insert({
      reset_type: resetType,
      content: JSON.stringify({ version: 1, ...answers }),
      tags: answers.feelings,
    });

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }
    setComplete(true);
  };

  const fetchReflection = async () => {
    setReflectionLoading(true);
    setReflectionError(null);
    try {
      const { data, error } = await supabase.functions.invoke('reset-coach', {
        body: { mode: 'reflection', answers: answersForCoach(answers) },
      });
      if (error) throw error;
      if (!data?.text) throw new Error('Empty response');
      setReflection(data.text);
    } catch {
      setReflectionError(
        'The coach is unavailable right now. Your reset is saved — you can try again in a moment.',
      );
    } finally {
      setReflectionLoading(false);
    }
  };

  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setStep(1);
    setComplete(false);
    setCoachLine(null);
    setReflection(null);
    setReflectionError(null);
    setSaveError(null);
  };

  /* Step 11 is the only step that requires input, since it forms the closing sentence. */
  const canAdvance = (): boolean => {
    if (step === RESET_STEP_COUNT) {
      return answers.cameInFeeling.trim().length > 0 && answers.leavingWith.trim().length > 0;
    }
    return true;
  };

  if (complete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div ref={scrollAnchor} />
        <ResetAvatarStrip progress={1} />

        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles size={18} style={{ color: TEAL }} />
            <span className="text-sm font-medium tracking-wide uppercase text-stone-500">
              Reset complete
            </span>
          </div>

          <p className="font-serif text-2xl text-stone-900 leading-body mb-8">
            {closingSentence(answers)}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: GOLD, color: '#3A3015' }}
            >
              +{RESET_POINTS} points
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-stone-700">
              Your avatar is rising
            </span>
          </div>

          {!reflection && (
            <motion.button
              {...pressable}
              onClick={() => void fetchReflection()}
              disabled={reflectionLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: TEAL }}
            >
              {reflectionLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <MessageCircle size={17} />
              )}
              Go deeper with your coach
            </motion.button>
          )}

          {reflectionError && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {reflectionError}
            </p>
          )}
        </div>

        {reflection && (
          <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-8 shadow-sm animate-[fadeSlide_320ms_ease-out]">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle size={17} style={{ color: TEAL }} />
              <span className="text-sm font-medium tracking-wide uppercase text-stone-500">
                Your coach
              </span>
            </div>
            <div className="space-y-4">
              {reflection.split('\n').filter((p) => p.trim()).map((para, i) => (
                <p key={i} className="font-serif text-stone-700 leading-body text-[1.05rem]">
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={restart} className="text-stone-600 hover:text-stone-900 font-medium">
            Start another reset
          </button>
        </div>
      </div>
    );
  }

  /*
    Sad and fearful sessions get a lavender wash. Lavender is the one colour in
    the system chosen for emotional safety rather than brand identity, so it
    appears only here and on the Higher Power cornerstone.
  */
  const family = primaryEmotionFamily(answers.feelings);
  const calmingTint = family === 'sadness' || family === 'fear';

  return (
    <div
      className="max-w-2xl mx-auto -mx-4 px-4 rounded-3xl transition-colors duration-700"
      style={calmingTint ? { backgroundColor: 'rgba(139, 126, 200, 0.07)' } : undefined}
    >
      <div ref={scrollAnchor} />

      <ResetAvatarStrip progress={(step - 1) / RESET_STEP_COUNT} />

      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <ResetProgressBar step={step} />
        </div>
        <button
          type="button"
          onClick={() => setCoachEnabled((v) => !v)}
          aria-pressed={coachEnabled}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 shrink-0 pt-0.5"
        >
          <span
            className={`w-9 h-5 rounded-full relative transition-colors ${
              coachEnabled ? '' : 'bg-stone-300'
            }`}
            style={coachEnabled ? { backgroundColor: TEAL } : undefined}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                coachEnabled ? 'left-[1.15rem]' : 'left-0.5'
              }`}
            />
          </span>
          Coach
        </button>
      </div>

      {coachEnabled && (coachLine || coachLoading) && (
        <div className="mb-6 rounded-xl border border-[#1D9E75]/25 bg-[#1D9E75]/5 px-5 py-4 animate-[fadeSlide_320ms_ease-out]">
          {coachLoading ? (
            <span className="flex items-center gap-2 text-stone-500 text-sm">
              <Loader2 size={14} className="animate-spin" />
              Your coach is listening…
            </span>
          ) : (
            <p className="text-stone-700 leading-relaxed">{coachLine}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        {/* Steps travel horizontally: forward from the right, back from the left. */}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
        {step === 1 && (
          <StepShell
            question="Take a breath. What brought you here today?"
            hint="You don't have to explain it perfectly. Just start talking — the way you'd text a trusted friend who asked how you're really doing."
            example="For example: I've been carrying this thing all week and I can't shake it. I don't even know how to describe it exactly but something is off and I'm tired of pretending it's not."
          >
            <textarea
              value={answers.entry}
              onChange={(e) => set('entry', e.target.value)}
              rows={6}
              autoFocus
              className={textareaClass}
              placeholder="Start anywhere. It doesn't have to make sense yet."
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            question="Where are you feeling this in your body right now?"
            hint="You don't have to know what you're feeling yet. Your body usually knows before your mind does. Pick everything that fits."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BODY_LOCATIONS.map((location) => (
                <ChoiceChip
                  key={location}
                  label={location}
                  selected={answers.bodyLocations.includes(location)}
                  onClick={() => toggleIn('bodyLocations', location)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            question="What do you call what you're feeling?"
            hint="Pick everything that fits. There is no wrong answer here."
          >
            <div className="space-y-6">
              {EMOTION_FAMILIES.map((group) => (
                <div key={group.family}>
                  <p className="text-sm font-medium text-stone-500 mb-2.5">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.feelings.map((feeling) => {
                      const selected = answers.feelings.includes(feeling);
                      return (
                        <button
                          key={feeling}
                          type="button"
                          onClick={() => toggleIn('feelings', feeling)}
                          aria-pressed={selected}
                          className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
                            selected
                              ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-stone-900'
                              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {feeling}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <label
                  htmlFor="underneath"
                  className="block text-stone-700 leading-relaxed mb-2"
                >
                  Underneath that feeling — what is really there? This is optional but powerful.
                </label>
                <textarea
                  id="underneath"
                  value={answers.underneath}
                  onChange={(e) => set('underneath', e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
                <p className="mt-3 text-sm text-stone-500 leading-relaxed italic">
                  For example: Underneath the anger I think there is actually fear. Fear that I am
                  not enough.
                </p>
              </div>
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell question="Which cornerstone of your life is this rooted in?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CORNERSTONE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.value}
                  hint={option.hint}
                  selected={answers.cornerstone === option.value}
                  onClick={() => set('cornerstone', option.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            question="If someone who loves you was watching this situation from the outside — what would they actually see?"
            hint="Not how it feels to you. Just what is actually happening. What are the facts on the ground that anyone watching could confirm?"
            example="For example: They would see someone who has been working 12 hour days for six months straight, has not taken a day off, and is starting to snap at people they love. They would probably say I am running on empty and using anger to push through it."
          >
            <textarea
              value={answers.outsideView}
              onChange={(e) => set('outsideView', e.target.value)}
              rows={6}
              autoFocus
              className={textareaClass}
            />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            question="If you woke up tomorrow and this had already shifted — what would feel different when you opened your eyes?"
            hint="Be specific. What would you notice? How would your body feel? What would you do differently? Paint the picture of the morning where this is not weighing on you anymore."
            example="For example: I would wake up without that knot in my stomach. I would actually look forward to going in instead of dreading it. I would feel like I have a plan instead of just reacting to everything."
          >
            <textarea
              value={answers.miracle}
              onChange={(e) => set('miracle', e.target.value)}
              rows={6}
              autoFocus
              className={textareaClass}
            />
          </StepShell>
        )}

        {step === 7 && (
          <StepShell
            question="What would you tell a close friend who came to you with exactly this situation?"
            hint="Imagine they are sitting across from you right now. They have told you everything you just told this reset. What do you say to them? What do they need to hear?"
            example="For example: I know this is hard but just know she is growing and spreading her wings. It is a good thing. You did your job — now let it test itself out."
          >
            <textarea
              value={answers.friend}
              onChange={(e) => set('friend', e.target.value)}
              rows={6}
              autoFocus
              className={textareaClass}
            />
          </StepShell>
        )}

        {step === 8 && (
          <StepShell question="You just gave your friend some wisdom. Now read it back as if it was written for you.">
            <div className="space-y-6">
              <div className="rounded-xl border-l-4 bg-stone-50 px-5 py-4" style={{ borderColor: TEAL }}>
                <p className="text-sm font-medium tracking-wide uppercase text-stone-500 mb-2">
                  What you told your friend
                </p>
                <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {answers.friend.trim() || 'You did not write anything here.'}
                </p>
              </div>

              <div>
                <label htmlFor="mirror" className="block text-stone-700 leading-relaxed mb-2">
                  How does that land when you realize that advice was always meant for you? Write
                  what comes up.
                </label>
                <textarea
                  id="mirror"
                  value={answers.mirror}
                  onChange={(e) => set('mirror', e.target.value)}
                  rows={5}
                  className={textareaClass}
                />
                <p className="mt-3 text-sm text-stone-500 leading-relaxed italic">
                  For example: Well it is the truth. And I did the same thing at that age. I guess I
                  already knew this — I just needed to hear it.
                </p>
              </div>
            </div>
          </StepShell>
        )}

        {step === 9 && (
          <StepShell
            question="What do you know now that you did not when you started this reset?"
            hint="It does not have to be a breakthrough. Even a small shift counts. What is clearer now than when you first sat down?"
            example="For example: I know now that I have been angry at the situation when I am actually scared. Those are two very different problems."
          >
            <textarea
              value={answers.knowNow}
              onChange={(e) => set('knowNow', e.target.value)}
              rows={5}
              autoFocus
              className={textareaClass}
            />
          </StepShell>
        )}

        {step === 10 && (
          <StepShell
            question="What is one small thing you are doing in the next hour?"
            hint="Not a plan. Not a commitment to change everything. Just the very next breath. One small thing that moves you one inch forward."
            example="For example: I am going to text the person I have been avoiding and just say I would like to talk."
          >
            <textarea
              value={answers.oneStep}
              onChange={(e) => set('oneStep', e.target.value)}
              rows={4}
              autoFocus
              className={textareaClass}
            />
          </StepShell>
        )}

        {step === 11 && (
          <StepShell question="Complete this sentence.">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-lg text-stone-800">
                <span>I came in feeling</span>
                <input
                  type="text"
                  value={answers.cameInFeeling}
                  onChange={(e) => set('cameInFeeling', e.target.value)}
                  autoFocus
                  className={`${inputClass} flex-1 min-w-[12rem]`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-lg text-stone-800">
                <span>and I am leaving with</span>
                <input
                  type="text"
                  value={answers.leavingWith}
                  onChange={(e) => set('leavingWith', e.target.value)}
                  className={`${inputClass} flex-1 min-w-[12rem]`}
                />
                <span>.</span>
              </div>
            </div>
          </StepShell>
        )}
          </motion.div>
        </AnimatePresence>

        {saveError && (
          <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Could not save your reset: {saveError}
          </p>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <motion.button
            {...pressable}
            type="button"
            onClick={goNext}
            disabled={!canAdvance() || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: TEAL }}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {step === RESET_STEP_COUNT ? 'Complete reset' : 'Continue'}
            {step < RESET_STEP_COUNT && <ArrowRight size={17} />}
          </motion.button>
        </div>
      </div>

      {!user && (
        <p className="mt-4 text-center text-sm text-stone-500">
          You are not signed in — this reset will not be saved.
        </p>
      )}
    </div>
  );
}

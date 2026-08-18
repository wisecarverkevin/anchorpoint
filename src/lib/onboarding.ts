/*
  The onboarding assessment: 25 questions asked one at a time.

  Content lives here so the component stays presentational. Answers are keyed by
  question id, which is also what gets persisted in
  onboarding_responses.responses — ids are stable, wording is not.
*/

export type QuestionType = 'text' | 'single' | 'multi';

export interface Question {
  id: number;
  type: QuestionType;
  /* Shown above the question itself. Only Q1 uses one. */
  heading?: string;
  question: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  /* When present, the question is skipped unless this returns true. */
  showIf?: (answers: OnboardingAnswers) => boolean;
}

export type OnboardingAnswer = string | string[];
export type OnboardingAnswers = Record<number, OnboardingAnswer>;

export const TOTAL_QUESTIONS = 25;

/* Q2 shows this when a minor selects their age. Informational — never blocks. */
export const UNDER_18_MESSAGE =
  'Welcome. AnchorPoint is for users 13 and older. Everything here is built for you too.';

const NO_PRIOR_ATTEMPT = 'No this is new for me';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'text',
    required: true,
    heading: 'Before we get started',
    question: 'What made you decide today was the day?',
    hint: 'There is no wrong answer. Just say what is true.',
    placeholder: 'Something brought you here today. What was it?',
  },
  {
    id: 2,
    type: 'single',
    required: true,
    question: 'How old are you?',
    options: ['Under 18', '18 to 25', '26 to 35', '36 to 45', '46 to 55', '56 and older'],
  },
  {
    id: 3,
    type: 'single',
    required: true,
    question: 'Which of these best describes where you are in life right now?',
    options: [
      'Single and independent',
      'In a relationship',
      'Married or partnered',
      'Going through a separation',
      'It is complicated',
    ],
  },
  {
    id: 4,
    type: 'single',
    required: true,
    question: 'Are you a parent?',
    options: [
      'Yes my kids live with me',
      'Yes part time',
      'No',
      'Not yet but hoping to be',
    ],
  },
  {
    id: 5,
    type: 'single',
    required: true,
    question: 'What best describes your work situation?',
    options: [
      'I own or run a business',
      'I work for someone else',
      'I am a student',
      'I am between jobs',
      'I stay home and take care of my family',
      'Something else',
    ],
  },
  {
    id: 6,
    type: 'single',
    required: true,
    question: 'Honestly — how is life feeling right now?',
    hint: 'No judgment. This helps us meet you where you are.',
    options: [
      'Really good I just want to grow',
      'Okay but something feels off',
      'Struggling in one or two areas',
      'Pretty overwhelmed',
      'I am in a hard season and I need real support',
    ],
  },
  {
    id: 7,
    type: 'single',
    required: false,
    question: 'When something upsets you what do you usually do?',
    options: [
      'I shut down and go quiet',
      'I get angry and it comes out',
      'I push through and pretend it is fine',
      'I reach out to someone',
      'I overthink everything alone',
      'Prefer not to answer',
    ],
  },
  {
    id: 8,
    type: 'single',
    required: false,
    question: 'Do you usually know when you are stressed or does it sneak up on you?',
    options: [
      'I always know',
      'I usually know',
      'It sneaks up on me',
      'I often do not realize until I am already overwhelmed',
      'Prefer not to answer',
    ],
  },
  {
    id: 9,
    type: 'single',
    required: false,
    question: 'How comfortable are you talking about your feelings?',
    options: [
      'Very — I process out loud',
      'Somewhat — depends on who',
      'Not very — I keep things to myself',
      'I struggle to even identify what I am feeling',
      'Prefer not to answer',
    ],
  },
  {
    id: 10,
    type: 'multi',
    required: false,
    question: 'When you are going through something hard what does your body do?',
    hint: 'Pick everything that fits.',
    options: [
      'Tight chest or throat',
      'Stomach knots',
      'Trouble sleeping',
      'Headaches or tension',
      'I go numb or disconnect',
      'I do not notice physical signs',
      'Prefer not to answer',
    ],
  },
  {
    id: 11,
    type: 'single',
    required: false,
    question: 'What is your biggest pattern when things get hard?',
    options: [
      'I avoid it and hope it passes',
      'I fix it immediately',
      'I talk to someone',
      'I throw myself into work',
      'I spiral and overthink',
      'I do not know — that is why I am here',
      'Prefer not to answer',
    ],
  },
  {
    id: 12,
    type: 'single',
    required: false,
    question: 'How long have you been carrying whatever brought you here today?',
    options: [
      'Just started noticing',
      'A few weeks',
      'Several months',
      'Over a year',
      'I honestly do not know',
      'Prefer not to answer',
    ],
  },
  {
    id: 13,
    type: 'single',
    required: false,
    question:
      'When life gets really hard what do you turn to for something bigger than yourself?',
    options: [
      'Prayer or my faith',
      'Meditation or stillness',
      'Nature or being outside',
      'Other people and community',
      'I do not really go there',
      'I am still figuring that out',
      'Prefer not to answer',
    ],
  },
  {
    id: 14,
    type: 'single',
    required: false,
    question: 'How central is spirituality or faith to how you make sense of your life?',
    options: [
      'It is the foundation of everything',
      'It is important but not everything',
      'I believe in something but I am not sure what',
      'I am exploring',
      'It is not really part of my life',
      'Prefer not to answer',
    ],
  },
  {
    id: 15,
    type: 'text',
    required: false,
    question:
      'Is there anything about your beliefs you would want reflected in how this app speaks to you?',
    hint: 'We will never assume. This is just so we can meet you where you are. Skip this if you prefer.',
    placeholder: 'Anything you want us to know.',
  },
  {
    id: 16,
    type: 'single',
    required: true,
    question: 'How is your relationship with your physical health right now?',
    options: [
      'I prioritize it and it shows',
      'I know what to do but struggle to do it',
      'I have let it go and I know it',
      'It is complicated — I am dealing with health challenges',
    ],
  },
  {
    id: 17,
    type: 'single',
    required: true,
    question: 'How are you sleeping?',
    options: ['Really well', 'Okay most nights', 'Inconsistently', 'Poorly — this is a real issue'],
  },
  {
    id: 18,
    type: 'single',
    required: false,
    question: 'When do you feel most like yourself?',
    options: [
      'Early morning',
      'During the day',
      'Evening',
      'Late night',
      'Rarely — I am usually just getting through it',
      'Prefer not to answer',
    ],
  },
  {
    id: 19,
    type: 'single',
    required: true,
    question: 'Which area of your life feels most out of alignment right now?',
    options: [
      'My physical health and body',
      'My mind spirit or sense of purpose',
      'My relationships and family',
      'My work or sense of contribution',
      'All of them honestly',
    ],
  },
  {
    id: 20,
    type: 'text',
    required: true,
    question: 'What would winning look like for you by this time next year?',
    hint: 'Do not be modest. Say what you actually want.',
    placeholder: 'Describe the version of your life that would make you proud.',
  },
  {
    id: 21,
    type: 'single',
    required: true,
    question:
      'Have you tried anything like this before — a coaching program therapy or a self-help system?',
    options: [
      'Yes and it helped',
      'Yes but it did not stick',
      'Yes and I am skeptical this will be different',
      NO_PRIOR_ATTEMPT,
    ],
  },
  {
    id: 22,
    type: 'text',
    required: false,
    /* Only meaningful for someone who has actually tried something before. */
    showIf: (answers) => answers[21] !== NO_PRIOR_ATTEMPT,
    question: 'What made those attempts not stick?',
    hint: 'No judgment. This helps us understand what you actually need.',
    placeholder: 'Be honest. What got in the way?',
  },
  {
    id: 23,
    type: 'single',
    required: false,
    question: 'When you are struggling what kind of support do you actually want?',
    options: [
      'Someone to push me harder',
      'Someone to sit with me and listen',
      'Honest feedback even if it stings',
      'Gentle encouragement',
      'I do not know — I have never had what I actually needed',
      'Prefer not to answer',
    ],
  },
  {
    id: 24,
    type: 'single',
    required: false,
    question: 'How do you feel about being challenged on the stories you tell yourself?',
    options: [
      'Bring it — I know I need it',
      'I am open to it just be kind',
      'I struggle with this',
      'I do not really know what that means yet',
      'Prefer not to answer',
    ],
  },
  {
    id: 25,
    type: 'text',
    required: false,
    question:
      'One last thing — what do you want AnchorPoint to know about you before we start?',
    hint: 'This is yours. Say whatever you want. Or skip it.',
    placeholder: 'Anything at all.',
  },
];

/* Questions actually shown, given what has been answered so far. */
export function visibleQuestions(answers: OnboardingAnswers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(answer: OnboardingAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  return answer.trim().length > 0;
}

/* Required questions block; optional ones can always be skipped. */
export function canAdvance(question: Question, answer: OnboardingAnswer | undefined): boolean {
  return !question.required || isAnswered(answer);
}

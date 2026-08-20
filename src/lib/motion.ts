/*
  Animation specs, kept together so timings stay consistent and are tuned in
  one place rather than scattered as magic numbers across components.

  Every value here is deliberately slow by UI standards. This app is used by
  people who are upset; motion should feel like breathing, not like feedback.
*/

/* Morning greeting: each word drifts up 4px, staggered 0.08s, ~1.4s total. */
export const WORD_STAGGER_SECONDS = 0.08;

export const greetingContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: WORD_STAGGER_SECONDS },
  },
};

export const greetingWord = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

/*
  Reset steps travel horizontally: forward slides in from the right, back slides
  in from the left, so direction carries meaning.
*/
export const stepVariants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: 1 | -1) => ({ opacity: 0, x: direction * -40 }),
};

export const stepTransition = { duration: 0.3, ease: 'easeOut' as const };

/* Primary buttons compress on press and spring back. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 22 },
};

/* Checkmark draws itself along its path. */
export const checkDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
};

/* The avatar breathes: 3.5s in and out, forever. */
export const breathing = {
  scale: [1, 1.025, 1],
  transition: {
    duration: 3.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  },
};

/* Dashboard cards rise 8px, staggered 0.1s. */
export const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const cardRise = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

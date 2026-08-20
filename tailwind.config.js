/*
  The five-colour system, expressed as Tailwind ramps.

  The codebase inherited ~380 uses of slate / gray / emerald / blue / indigo /
  purple / amber from the original import. Rather than hand-editing every call
  site — high churn, high risk of missing one — the palette itself is
  redefined so those class names resolve to system colours. A stray
  `text-slate-600` now renders warm grey, not cool blue-grey.

    stone / slate / gray / zinc / neutral -> warm neutrals spanning
                                             #F7F3EE (cream) to #1A1814 (near-black)
    teal / emerald / green / blue         -> #1D9E75  primary
    lavender / purple / violet / indigo / pink -> #8B7EC8  calm
    gold / amber / yellow                 -> #C9A84C  earned reward

  `red` is deliberately kept as a functional signal. An error message rendered
  in the primary colour reads as success, which is worse than being one hue
  outside the palette. It is muted to sit against cream.
*/

/* Warm neutrals: cream at 50, near-black at 900. */
const warm = {
  50: '#F7F3EE',
  100: '#EFEAE3',
  200: '#E2DBD1',
  300: '#CFC6B9',
  400: '#A89E90',
  500: '#857C70',
  600: '#6B6357',
  700: '#524B42',
  800: '#37322C',
  900: '#1A1814',
  950: '#12100D',
};

const teal = {
  50: '#EAF7F2',
  100: '#D2EFE4',
  200: '#A6DFC9',
  300: '#6FCAA9',
  400: '#3EB48D',
  500: '#1D9E75',
  600: '#17805F',
  700: '#12654A',
  800: '#0E4C38',
  900: '#0A3527',
  DEFAULT: '#1D9E75',
};

const lavender = {
  50: '#F2F0F9',
  100: '#E6E2F3',
  200: '#CEC7E8',
  300: '#B3A8DA',
  400: '#9C8ECF',
  500: '#8B7EC8',
  600: '#6F62A8',
  700: '#574C86',
  800: '#3F3763',
  900: '#2A2543',
  DEFAULT: '#8B7EC8',
};

const gold = {
  50: '#FBF7EC',
  100: '#F6EED6',
  200: '#EDDCAB',
  300: '#E0C67C',
  400: '#D4B55F',
  500: '#C9A84C',
  600: '#A2853A',
  700: '#7C662C',
  800: '#574820',
  900: '#3A3015',
  DEFAULT: '#C9A84C',
};

/* Muted enough to sit on cream without shouting. */
const signalRed = {
  50: '#FBF982',
  100: '#F7E7E4',
  200: '#EFCCC7',
  300: '#E0A69E',
  400: '#CE7B70',
  500: '#B5453A',
  600: '#983A31',
  700: '#7A2E27',
  800: '#5C231D',
  900: '#3E1714',
};
signalRed[50] = '#FBF3F2';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: warm,
        slate: warm,
        gray: warm,
        zinc: warm,
        neutral: warm,

        teal,
        emerald: teal,
        green: teal,
        blue: teal,

        lavender,
        purple: lavender,
        violet: lavender,
        indigo: lavender,
        pink: lavender,

        gold,
        amber: gold,
        yellow: gold,

        red: signalRed,
        rose: signalRed,
      },
      fontFamily: {
        /* UI voice */
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /* Counsellor voice: questions, coach responses, greetings */
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
      lineHeight: {
        body: '1.75',
        heading: '1.6',
      },
      letterSpacing: {
        body: '0.01em',
      },
    },
  },
  plugins: [],
};

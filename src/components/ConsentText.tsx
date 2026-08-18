import type { MouseEvent } from 'react';
import { LEGAL_PATHS } from './LegalPage';

/*
  The consent wording, used by both the sign-up checkbox and the modal shown to
  users who predate it. Single source so the two can never disagree about what
  was agreed to.
*/
export function ConsentText() {
  /*
    On the sign-up screen this text sits inside a <label>, where a click on a
    link would otherwise bubble up and toggle the checkbox. Opening a document
    should never silently flip the agreement.
  */
  const stopLabelToggle = (e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation();

  return (
    <>
      I understand that AnchorPoint stores my personal reflections to personalize my
      experience. AnchorPoint is not a therapy or mental health service. I have read and agree
      to the{' '}
      <a
        href={LEGAL_PATHS.terms}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopLabelToggle}
        className="underline text-stone-800 hover:text-stone-950"
      >
        Terms of Service
      </a>{' '}
      and{' '}
      <a
        href={LEGAL_PATHS.privacy}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopLabelToggle}
        className="underline text-stone-800 hover:text-stone-950"
      >
        Privacy Policy
      </a>
      .
    </>
  );
}

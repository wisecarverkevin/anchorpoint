import { Anchor, ArrowLeft } from 'lucide-react';

export const LEGAL_PATHS = {
  terms: '/terms',
  privacy: '/privacy',
} as const;

export type LegalDocument = keyof typeof LEGAL_PATHS;

const TITLES: Record<LegalDocument, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
};

interface LegalPageProps {
  document: LegalDocument;
}

export function LegalPage({ document: doc }: LegalPageProps) {
  /*
    These pages are usually opened in a new tab from the consent checkbox, where
    there is no history to go back to. Fall through to the app root in that case
    so the button is never a dead end.
  */
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Anchor size={22} className="text-stone-700" strokeWidth={2} />
          <span className="text-lg font-medium text-stone-900">AnchorPoint</span>
        </div>

        <h1 className="text-3xl font-light text-stone-900 mb-6">{TITLES[doc]}</h1>

        <p className="text-stone-600 leading-relaxed">
          This document is coming soon. Please check back before our public launch.
        </p>

        <button
          type="button"
          onClick={goBack}
          className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>
    </div>
  );
}

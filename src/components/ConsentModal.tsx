import { useState } from 'react';
import { Anchor, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { ConsentText } from './ConsentText';

interface ConsentModalProps {
  /* Called once consent is stored, so the app can continue past the gate. */
  onAgreed: () => void;
}

/*
  Shown to signed-in users whose account predates the sign-up consent checkbox.
  Deliberately has no dismiss control, no backdrop click and no escape handler:
  the app is not usable until consent is recorded.
*/
export function ConsentModal({ onAgreed }: ConsentModalProps) {
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgree = async () => {
    setSaving(true);
    setError(null);

    /*
      Written to the same `consent_agreed_at` key that sign-up uses, so there is
      one field to check regardless of how the user arrived.
    */
    const { error: updateError } = await supabase.auth.updateUser({
      data: { consent_agreed_at: new Date().toISOString() },
    });

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    onAgreed();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center px-4 py-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Anchor size={20} className="text-stone-700" strokeWidth={2} />
          <span className="font-medium text-stone-900">AnchorPoint</span>
        </div>

        <h2 id="consent-modal-title" className="text-xl font-light text-stone-900 mb-4">
          Before you continue
        </h2>

        <p className="text-sm text-stone-600 leading-relaxed">
          <ConsentText />
        </p>

        {error && (
          <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            Could not save your agreement: {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleAgree()}
          disabled={saving}
          className="mt-7 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          I agree
        </button>

        {/*
          A way out for anyone who does not want to agree. Without it the modal
          is a dead end: no dismiss, no backdrop click, and the app behind it is
          unreachable.
        */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={saving}
            className="text-sm text-stone-500 hover:text-stone-800 hover:underline disabled:opacity-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

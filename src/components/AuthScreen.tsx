import { useState, type FormEvent } from 'react';
import { Anchor, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { ConsentText } from './ConsentText';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword('');
    setFirstName('');
    setConsentAgreed(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'signup' && !firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { needsEmailConfirmation } = await signUp(email, password, firstName);
        if (needsEmailConfirmation) {
          setNotice('Check your email for a confirmation link to finish signing up.');
          setPassword('');
        }
      } else {
        await signIn(email, password);
      }
      // On success the auth listener swaps this screen out; no navigation needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Anchor size={32} className="text-stone-700 mb-3" strokeWidth={2} />
          <h1 className="text-2xl font-light text-stone-900">AnchorPoint</h1>
          <p className="text-stone-600 mt-1">
            {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-colors"
                  placeholder="What should we call you?"
                  autoComplete="given-name"
                  required
                  autoFocus
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
                required
                autoFocus={mode === 'signin'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-colors"
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="pt-1">
                <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-stone-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-stone-600 leading-relaxed">
                    <ConsentText />
                  </span>
                </label>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {notice && (
              <p className="text-sm text-stone-700 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2">
                {notice}
              </p>
            )}

            <button
              type="submit"
              /* Consent gates account creation only — it must never block sign-in. */
              disabled={submitting || (mode === 'signup' && !consentAgreed)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-600 mt-6">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-medium text-stone-900 hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

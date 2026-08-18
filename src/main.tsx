import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { LegalPage, LEGAL_PATHS, type LegalDocument } from './components/LegalPage';
import './index.css';

/*
  Minimal path handling. The app has no router — every other screen is chosen by
  state inside App — and two static documents do not justify adding one.

  These are resolved above the auth gate on purpose: the consent checkbox that
  links to them is on the sign-up screen, so they must be readable by someone
  who does not have an account yet.
*/
function legalDocumentForPath(pathname: string): LegalDocument | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.keys(LEGAL_PATHS) as LegalDocument[]).find(
    (doc) => LEGAL_PATHS[doc] === normalized,
  );
  return match ?? null;
}

function Root() {
  const { session, loading } = useAuth();

  const legalDoc = legalDocumentForPath(window.location.pathname);
  if (legalDoc) {
    return <LegalPage document={legalDoc} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
      </div>
    );
  }

  return session ? <App /> : <AuthScreen />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);

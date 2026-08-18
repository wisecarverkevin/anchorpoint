import { useState, useEffect } from 'react';
import { Anchor, RefreshCw, Target, ListChecks, Home, Users, Settings, Sparkles, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/AuthContext';
import type { Cornerstone } from './lib/types';
import { CornerstoneCard } from './components/CornerstoneCard';
import { CornerstoneDetail } from './components/CornerstoneDetail';
import { Reset } from './components/Reset';
import { AnchorPlanner } from './components/AnchorPlanner';
import CalendarView from './components/CalendarView';
import CalendarSettings from './components/CalendarSettings';
import EventForm from './components/EventForm';
import SupportCrewManager from './components/SupportCrewManager';
import { DailyCore8Checklist } from './components/DailyCore8Checklist';
import { MorningCheckIn } from './components/MorningCheckIn';
import { ConsentModal } from './components/ConsentModal';
import { OnboardingAssessment } from './components/OnboardingAssessment';
import { isMorning, localDateString } from './lib/morning';

type View = 'home' | 'daily-core-8' | 'daily-reset' | 'planner' | 'cornerstones' | 'support-crew' | 'settings';

function App() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [cornerstones, setCornerstones] = useState<Cornerstone[]>([]);
  const [selectedCornerstone, setSelectedCornerstone] = useState<Cornerstone | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<Date | undefined>();
  const [eventFormStartTime, setEventFormStartTime] = useState<Date | undefined>();
  const [calendarKey, setCalendarKey] = useState(0);
  const [showMorningCheckIn, setShowMorningCheckIn] = useState(false);
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [onboardingRecorded, setOnboardingRecorded] = useState(false);

  useEffect(() => {
    void loadInitialState();
  }, []);

  /*
    The morning check-in decision has to resolve before anything renders, or the
    dashboard flashes for a frame before being replaced. Both the cornerstones
    fetch and the check-in lookup run inside the single `loading` gate.
  */
  const loadInitialState = async () => {
    const needsCheckIn = isMorning() ? await hasNoCheckInToday() : false;
    setShowMorningCheckIn(needsCheckIn);

    await fetchCornerstones();
    setLoading(false);
  };

  const hasNoCheckInToday = async (): Promise<boolean> => {
    /*
      RLS already limits this to the caller's own rows, so no user_id filter is
      needed. On a query error, fail open to the dashboard: a transient network
      blip should never lock someone behind a check-in screen.
    */
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('date', localDateString())
      .maybeSingle();

    if (error) {
      console.error('Error checking morning check-in:', error);
      return false;
    }
    return data === null;
  };

  const fetchCornerstones = async () => {
    const { data } = await supabase
      .from('cornerstones')
      .select('*')
      .order('order_index', { ascending: true });

    if (data) {
      setCornerstones(data);
      if (data.length > 0 && !selectedCornerstone) {
        setSelectedCornerstone(data[0]);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  /*
    Consent gates everything, including the morning check-in — an account that
    has not agreed should not be writing reflections. `consentRecorded` covers
    the moment between the update succeeding and the refreshed user propagating
    through the auth listener.
  */
  const hasConsented = Boolean(user?.user_metadata?.consent_agreed_at) || consentRecorded;
  if (!hasConsented) {
    return <ConsentModal onAgreed={() => setConsentRecorded(true)} />;
  }

  /*
    Onboarding runs once, after consent and before anything else. Like the
    consent gate, the local flag covers the window between the metadata write
    succeeding and the refreshed user arriving through the auth listener.
  */
  const hasOnboarded = Boolean(user?.user_metadata?.onboarding_completed) || onboardingRecorded;
  if (!hasOnboarded) {
    return <OnboardingAssessment onComplete={() => setOnboardingRecorded(true)} />;
  }

  /* Full focus: rendered instead of the whole shell, so there is no nav. */
  if (showMorningCheckIn) {
    return <MorningCheckIn onComplete={() => setShowMorningCheckIn(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Anchor size={24} className="text-stone-700" strokeWidth={2} />
              <span className="text-lg font-medium text-stone-900">AnchorPoint</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Home size={18} />
                Home
              </button>
              <button
                onClick={() => setCurrentView('daily-core-8')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'daily-core-8'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Sparkles size={18} />
                Today's practice
              </button>
              <button
                onClick={() => setCurrentView('daily-reset')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'daily-reset'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <RefreshCw size={18} />
                Reset
              </button>
              <button
                onClick={() => setCurrentView('planner')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'planner'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ListChecks size={18} />
                Planner
              </button>
              <button
                onClick={() => setCurrentView('cornerstones')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'cornerstones'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Target size={18} />
                Cornerstones
              </button>
              <button
                onClick={() => setCurrentView('support-crew')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'support-crew'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Users size={18} />
                Support Crew
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'settings'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Settings size={18} />
                Settings
              </button>
            </div>

            <div className="flex items-center gap-3 min-w-0 pl-4 ml-2 border-l border-stone-200">
              <span className="text-sm text-stone-600 truncate max-w-[16rem]" title={user?.email ?? ''}>
                {user?.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shrink-0"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentView === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-stone-900 mb-3">
                Welcome to AnchorPoint
              </h1>
              <p className="text-lg text-stone-600">
                Build your foundation across the four cornerstones of a meaningful life
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setCurrentView('daily-core-8')}
                className="bg-white border border-stone-200 rounded-xl p-6 text-left hover:shadow-md transition-shadow"
              >
                <Sparkles className="w-8 h-8 text-stone-700 mb-3" />
                <h3 className="text-xl font-medium text-stone-900 mb-2">Today's practice</h3>
                <p className="text-stone-600">
                  Track your eight daily essentials and watch your avatar evolve
                </p>
              </button>

              <button
                onClick={() => setCurrentView('daily-reset')}
                className="bg-white border border-stone-200 rounded-xl p-6 text-left hover:shadow-md transition-shadow"
              >
                <RefreshCw className="w-8 h-8 text-stone-700 mb-3" />
                <h3 className="text-xl font-medium text-stone-900 mb-2">Daily Reset</h3>
                <p className="text-stone-600">
                  Take a breath. Work through what you are carrying. Come out clearer than you
                  went in.
                </p>
              </button>

              <button
                onClick={() => setCurrentView('planner')}
                className="bg-white border border-stone-200 rounded-xl p-6 text-left hover:shadow-md transition-shadow"
              >
                <ListChecks className="w-8 h-8 text-stone-700 mb-3" />
                <h3 className="text-xl font-medium text-stone-900 mb-2">Planner</h3>
                <p className="text-stone-600">
                  Organize your goals from yearly visions to daily tasks
                </p>
              </button>

              <button
                onClick={() => setCurrentView('cornerstones')}
                className="bg-white border border-stone-200 rounded-xl p-6 text-left hover:shadow-md transition-shadow"
              >
                <Target className="w-8 h-8 text-stone-700 mb-3" />
                <h3 className="text-xl font-medium text-stone-900 mb-2">Cornerstones</h3>
                <p className="text-stone-600">
                  Define what matters most across health, wealth, relationships, and purpose
                </p>
              </button>

              <button
                onClick={() => setCurrentView('support-crew')}
                className="bg-white border border-stone-200 rounded-xl p-6 text-left hover:shadow-md transition-shadow"
              >
                <Users className="w-8 h-8 text-stone-700 mb-3" />
                <h3 className="text-xl font-medium text-stone-900 mb-2">Support Crew</h3>
                <p className="text-stone-600">
                  Invite trusted people to support and encourage your journey
                </p>
              </button>
            </div>
          </div>
        )}

        {currentView === 'cornerstones' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {cornerstones.map((cornerstone) => (
                <CornerstoneCard
                  key={cornerstone.id}
                  cornerstone={cornerstone}
                  onClick={() => setSelectedCornerstone(cornerstone)}
                  isSelected={selectedCornerstone?.id === cornerstone.id}
                />
              ))}
            </div>

            {selectedCornerstone && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
                <CornerstoneDetail cornerstone={selectedCornerstone} />
              </div>
            )}
          </>
        )}

        {currentView === 'daily-core-8' && <DailyCore8Checklist />}

        {currentView === 'planner' && <AnchorPlanner />}

        {currentView === 'support-crew' && <SupportCrewManager />}

        {currentView === 'daily-reset' && <Reset />}

        {currentView === 'settings' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-light text-stone-900 mb-8">Settings</h2>
            <CalendarSettings />
          </div>
        )}

        {showEventForm && (
          <EventForm
            initialDate={eventFormDate}
            initialStartTime={eventFormStartTime}
            onClose={() => {
              setShowEventForm(false);
              setEventFormDate(undefined);
              setEventFormStartTime(undefined);
            }}
            onSuccess={() => {
              setCalendarKey((prev) => prev + 1);
            }}
          />
        )}
      </main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-stone-500 text-sm">
          <p>Stay anchored to what matters most</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

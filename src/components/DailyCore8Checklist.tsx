import { useState, useEffect } from 'react';
import { Check, Settings2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DailyCore8, AvatarStyle, UserAvatarPreferences } from '../lib/types';
import { AvatarTracker } from './AvatarTracker';
import { AvatarStyleSelector } from './AvatarStyleSelector';
import { AffirmationMessage } from './AffirmationMessage';
import { calculateProgress, getAvatarStageInfo, CORE_8_ITEMS } from '../lib/avatar';

export function DailyCore8Checklist() {
  const [core8Data, setCore8Data] = useState<DailyCore8 | null>(null);
  const [avatarPreferences, setAvatarPreferences] = useState<UserAvatarPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [previousProgress, setPreviousProgress] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const [core8Response, prefsResponse] = await Promise.all([
        supabase
          .from('daily_core_8')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('user_avatar_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (core8Response.data) {
        setCore8Data(core8Response.data);
        setPreviousProgress(calculateProgress(core8Response.data));
      } else {
        const { data: newCore8 } = await supabase
          .from('daily_core_8')
          .insert({ user_id: user.id, date: today })
          .select()
          .single();
        if (newCore8) {
          setCore8Data(newCore8);
          setPreviousProgress(0);
        }
      }

      if (prefsResponse.data) {
        setAvatarPreferences(prefsResponse.data);
      } else {
        const { data: newPrefs } = await supabase
          .from('user_avatar_preferences')
          .insert({ user_id: user.id, avatar_style: 'human_silhouette' })
          .select()
          .single();
        if (newPrefs) {
          setAvatarPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof DailyCore8) => {
    if (!core8Data || typeof core8Data[key] !== 'boolean') return;

    const newValue = !core8Data[key];
    const updatedData = { ...core8Data, [key]: newValue };

    setCore8Data(updatedData);

    const newProgress = calculateProgress(updatedData);

    if (newProgress > previousProgress) {
      const stageInfo = getAvatarStageInfo(newProgress);
      setAffirmation(stageInfo.affirmation);
    }

    setPreviousProgress(newProgress);

    await supabase
      .from('daily_core_8')
      .update({ [key]: newValue })
      .eq('id', core8Data.id);
  };

  const handleStyleChange = async (style: AvatarStyle) => {
    if (!avatarPreferences) return;

    setAvatarPreferences({ ...avatarPreferences, avatar_style: style });

    await supabase
      .from('user_avatar_preferences')
      .update({ avatar_style: style })
      .eq('id', avatarPreferences.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(core8Data);
  const stageInfo = getAvatarStageInfo(progress);
  const avatarStyle = avatarPreferences?.avatar_style || 'human_silhouette';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {affirmation && (
        <AffirmationMessage
          affirmation={affirmation}
          onClose={() => setAffirmation(null)}
        />
      )}

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light text-stone-900">Daily Core 8</h2>
        <p className="text-lg text-stone-600">
          Complete your daily essentials to advance your avatar
        </p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
        <AvatarTracker
          stage={stageInfo.stage}
          stageName={stageInfo.name}
          progress={progress}
          avatarStyle={avatarStyle}
        />
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-stone-900">Today's Checklist</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Settings2 size={20} className="text-stone-600" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-8 p-6 bg-stone-50 rounded-lg">
            <AvatarStyleSelector
              selectedStyle={avatarStyle}
              onSelect={handleStyleChange}
            />
          </div>
        )}

        <div className="space-y-3">
          {CORE_8_ITEMS.map((item) => {
            const isChecked = core8Data?.[item.key as keyof DailyCore8] as boolean;

            return (
              <button
                key={item.key}
                onClick={() => handleToggle(item.key as keyof DailyCore8)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isChecked
                    ? 'border-stone-700 bg-stone-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'border-stone-700 bg-stone-700'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={18} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-stone-900">
                      {item.label}
                    </h4>
                    <p className="text-sm text-stone-600">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

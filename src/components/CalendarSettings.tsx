import { useState, useEffect } from 'react';
import { Settings, Bell, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalendarPreferences } from '../lib/types';
import { requestNotificationPermission } from '../lib/notifications';

export default function CalendarSettings() {
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadPreferences();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  async function loadPreferences() {
    try {
      const { data, error } = await supabase
        .from('calendar_preferences')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else {
        const defaultPrefs: Partial<CalendarPreferences> = {
          auto_suggest_enabled: false,
          default_power_block_duration: 60,
          notification_enabled: false,
          notification_minutes_before: 15,
          work_start_time: '09:00:00',
          work_end_time: '17:00:00',
        };
        setPreferences(defaultPrefs as CalendarPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePreferences() {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('calendar_preferences')
        .upsert({
          id: preferences.id,
          auto_suggest_enabled: preferences.auto_suggest_enabled,
          default_power_block_duration: preferences.default_power_block_duration,
          notification_enabled: preferences.notification_enabled,
          notification_minutes_before: preferences.notification_minutes_before,
          work_start_time: preferences.work_start_time,
          work_end_time: preferences.work_end_time,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNotificationToggle(enabled: boolean) {
    if (enabled) {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }
    }

    setPreferences(prev => prev ? { ...prev, notification_enabled: enabled } : null);
  }

  function updatePreference<K extends keyof CalendarPreferences>(
    key: K,
    value: CalendarPreferences[K]
  ) {
    setPreferences(prev => prev ? { ...prev, [key]: value } : null);
  }

  if (isLoading || !preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Calendar Settings</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 mb-3">Work Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.work_start_time.slice(0, 5)}
                    onChange={(e) => updatePreference('work_start_time', e.target.value + ':00')}
                    onBlur={savePreferences}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.work_end_time.slice(0, 5)}
                    onChange={(e) => updatePreference('work_end_time', e.target.value + ':00')}
                    onBlur={savePreferences}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <CalendarIcon className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">Auto-Suggest Time Slots</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.auto_suggest_enabled}
                    onChange={(e) => {
                      updatePreference('auto_suggest_enabled', e.target.checked);
                      savePreferences();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                </label>
              </div>
              <p className="text-sm text-slate-600">
                Automatically suggest optimal time slots for unscheduled tasks
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Bell className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">Notifications</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notification_enabled}
                    onChange={(e) => {
                      handleNotificationToggle(e.target.checked);
                      savePreferences();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                </label>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Receive browser notifications before events start
              </p>
              {preferences.notification_enabled && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notify me (minutes before)
                  </label>
                  <select
                    value={preferences.notification_minutes_before}
                    onChange={(e) => {
                      updatePreference('notification_minutes_before', parseInt(e.target.value));
                      savePreferences();
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              )}
              {notificationPermission === 'denied' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  Notifications are blocked. Please enable them in your browser settings.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 mb-3">Default Power Block Duration</h3>
              <select
                value={preferences.default_power_block_duration}
                onChange={(e) => {
                  updatePreference('default_power_block_duration', parseInt(e.target.value));
                  savePreferences();
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
          </div>
        </div>

        {isSaving && (
          <div className="text-center text-sm text-slate-600">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}

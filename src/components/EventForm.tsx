import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EventType, Task, CalendarPreferences, ScheduledEvent, SuggestedSlot } from '../lib/types';
import { suggestBestTimeSlots, formatTimeSlot } from '../lib/scheduling';
import { notificationManager } from '../lib/notifications';

interface EventFormProps {
  initialDate?: Date;
  initialStartTime?: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventForm({ initialDate, initialStartTime, onClose, onSuccess }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('power_block');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedSlot[]>([]);
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);

  useEffect(() => {
    loadData();
    initializeForm();
  }, []);

  function initializeForm() {
    const dateToUse = initialDate || new Date();
    const year = dateToUse.getFullYear();
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
    const day = String(dateToUse.getDate()).padStart(2, '0');
    setStartDate(`${year}-${month}-${day}`);

    if (initialStartTime) {
      const hours = String(initialStartTime.getHours()).padStart(2, '0');
      const minutes = String(initialStartTime.getMinutes()).padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    } else {
      setStartTime('09:00');
    }
  }

  async function loadData() {
    try {
      const [tasksResult, prefsResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .in('status', ['quicklist', 'hotlist'])
          .order('order_index'),
        supabase
          .from('calendar_preferences')
          .select('*')
          .maybeSingle()
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (prefsResult.error) throw prefsResult.error;

      setTasks(tasksResult.data || []);
      setPreferences(prefsResult.data);

      if (prefsResult.data) {
        setDuration(prefsResult.data.default_power_block_duration);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function loadSuggestions() {
    if (!preferences) return;

    try {
      const { data: events } = await supabase
        .from('scheduled_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (events) {
        const slots = suggestBestTimeSlots(events, preferences, duration, 7, 5);
        setSuggestions(slots);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }

  function applySuggestion(slot: SuggestedSlot) {
    const year = slot.start.getFullYear();
    const month = String(slot.start.getMonth() + 1).padStart(2, '0');
    const day = String(slot.start.getDate()).padStart(2, '0');
    setStartDate(`${year}-${month}-${day}`);

    const hours = String(slot.start.getHours()).padStart(2, '0');
    const minutes = String(slot.start.getMinutes()).padStart(2, '0');
    setStartTime(`${hours}:${minutes}`);

    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !startDate || !startTime) return;

    setIsLoading(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const newEvent: Partial<ScheduledEvent> = {
        title: title.trim(),
        description: description.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: eventType,
        task_id: linkedTaskId || null,
        is_synced: false,
      };

      const { data, error } = await supabase
        .from('scheduled_events')
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;

      if (preferences?.notification_enabled && data) {
        notificationManager.scheduleForEvent(data, preferences.notification_minutes_before);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const eventTypeOptions: { value: EventType; label: string; color: string }[] = [
    { value: 'power_block', label: 'Power Block', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'reset', label: 'Reset', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'task', label: 'Task', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Schedule Event</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEventType(option.value)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    eventType === option.value
                      ? option.color + ' border-current'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about this event"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {eventType === 'task' && tasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Link to Task (Optional)
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No task linked</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          {preferences?.auto_suggest_enabled && (
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={loadSuggestions}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                <Lightbulb className="w-5 h-5" />
                Suggest Best Time Slots
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-slate-900 mb-2">Suggested Time Slots</h3>
                  {suggestions.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySuggestion(slot)}
                      className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">
                          {formatTimeSlot(slot)}
                        </span>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                          Score: {slot.score}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{slot.reason}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

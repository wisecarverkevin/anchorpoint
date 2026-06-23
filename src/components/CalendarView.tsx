import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ScheduledEvent, CalendarPreferences } from '../lib/types';
import { findAvailableSlots, formatTimeSlot } from '../lib/scheduling';

interface CalendarViewProps {
  onCreateEvent?: (date: Date, startTime?: Date) => void;
}

export default function CalendarView({ onCreateEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  async function loadData() {
    setIsLoading(true);
    try {
      const startOfWeek = getStartOfWeek(currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const [eventsResult, prefsResult] = await Promise.all([
        supabase
          .from('scheduled_events')
          .select('*')
          .gte('start_time', startOfWeek.toISOString())
          .lt('start_time', endOfWeek.toISOString())
          .order('start_time'),
        supabase
          .from('calendar_preferences')
          .select('*')
          .maybeSingle()
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (prefsResult.error) throw prefsResult.error;

      setEvents(eventsResult.data || []);
      setPreferences(prefsResult.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function previousWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getWeekDays(): Date[] {
    const startOfWeek = getStartOfWeek(currentDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function getEventsForDay(date: Date): ScheduledEvent[] {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  function getGapsForDay(date: Date) {
    if (!preferences) return [];

    const dayEvents = getEventsForDay(date);
    return findAvailableSlots(
      dayEvents,
      preferences,
      date,
      preferences.default_power_block_duration
    );
  }

  const weekDays = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventTypeColors: Record<string, { bg: string; border: string; text: string }> = {
    power_block: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900' },
    reset: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900' },
    task: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900' },
    other: { bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-900' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={previousWeek}
              className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium text-slate-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const gaps = getGapsForDay(date);
            const isToday = date.getTime() === today.getTime();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={index}
                className={`min-h-[200px] border rounded-lg p-3 ${
                  isToday
                    ? 'border-blue-500 bg-blue-50'
                    : isWeekend
                    ? 'bg-slate-50 border-slate-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-lg font-semibold ${
                      isToday ? 'text-blue-600' : 'text-slate-900'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {onCreateEvent && !isWeekend && (
                    <button
                      onClick={() => onCreateEvent(date)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="Add event"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {dayEvents.map((event) => {
                    const colors = eventTypeColors[event.event_type] || eventTypeColors.other;
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);

                    return (
                      <div
                        key={event.id}
                        className={`p-2 rounded border-l-4 ${colors.bg} ${colors.border}`}
                      >
                        <div className={`text-xs font-medium ${colors.text} mb-1`}>
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-600">
                          {startTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                          {' - '}
                          {endTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {gaps.length > 0 && !isWeekend && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                      {gaps.slice(0, 2).map((gap, idx) => (
                        <button
                          key={idx}
                          onClick={() => onCreateEvent && onCreateEvent(date, gap.start)}
                          className="w-full text-left p-2 mb-1 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          {gap.start.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                          {' - '}
                          {gap.end.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </button>
                      ))}
                      {gaps.length > 2 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{gaps.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500 rounded"></div>
            <span className="text-slate-600">Power Block</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500 rounded"></div>
            <span className="text-slate-600">Reset</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border-l-4 border-amber-500 rounded"></div>
            <span className="text-slate-600">Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
            <span className="text-slate-600">Available Slot</span>
          </div>
        </div>
      </div>
    </div>
  );
}

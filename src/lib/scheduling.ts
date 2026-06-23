import { ScheduledEvent, CalendarPreferences, TimeSlot, SuggestedSlot } from './types';

export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function findAvailableSlots(
  events: ScheduledEvent[],
  preferences: CalendarPreferences,
  date: Date,
  durationMinutes: number
): TimeSlot[] {
  const workStartMinutes = parseTimeToMinutes(preferences.work_start_time);
  const workEndMinutes = parseTimeToMinutes(preferences.work_end_time);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const workStart = new Date(dayStart);
  workStart.setMinutes(workStart.getMinutes() + workStartMinutes);

  const workEnd = new Date(dayStart);
  workEnd.setMinutes(workEnd.getMinutes() + workEndMinutes);

  const eventsOnDay = events
    .filter(event => {
      const eventStart = new Date(event.start_time);
      return eventStart.toDateString() === date.toDateString();
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const slots: TimeSlot[] = [];
  let currentTime = workStart;

  for (const event of eventsOnDay) {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    if (eventStart > currentTime) {
      const gapDuration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);

      if (gapDuration >= durationMinutes) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(eventStart),
          duration: gapDuration
        });
      }
    }

    if (eventEnd > currentTime) {
      currentTime = eventEnd;
    }
  }

  if (currentTime < workEnd) {
    const gapDuration = (workEnd.getTime() - currentTime.getTime()) / (1000 * 60);

    if (gapDuration >= durationMinutes) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(workEnd),
        duration: gapDuration
      });
    }
  }

  return slots;
}

export function scoreTimeSlot(
  slot: TimeSlot,
  preferences: CalendarPreferences,
  durationMinutes: number
): { score: number; reason: string } {
  let score = 100;
  const reasons: string[] = [];

  const slotStartMinutes = slot.start.getHours() * 60 + slot.start.getMinutes();
  const workStartMinutes = parseTimeToMinutes(preferences.work_start_time);
  const workEndMinutes = parseTimeToMinutes(preferences.work_end_time);
  const midDayMinutes = (workStartMinutes + workEndMinutes) / 2;

  if (slotStartMinutes >= workStartMinutes && slotStartMinutes <= workStartMinutes + 120) {
    score += 20;
    reasons.push('Morning slot - high energy');
  }

  if (slotStartMinutes >= midDayMinutes - 60 && slotStartMinutes <= midDayMinutes + 60) {
    score += 10;
    reasons.push('Mid-day availability');
  }

  if (slot.duration >= durationMinutes * 1.5) {
    score += 15;
    reasons.push('Ample buffer time');
  } else if (slot.duration >= durationMinutes * 1.2) {
    score += 5;
    reasons.push('Adequate time');
  } else {
    score -= 10;
    reasons.push('Tight fit');
  }

  const now = new Date();
  const hoursUntil = (slot.start.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 1) {
    score -= 30;
    reasons.push('Very soon - may be too rushed');
  } else if (hoursUntil < 2) {
    score -= 10;
    reasons.push('Coming up shortly');
  } else if (hoursUntil > 24) {
    score -= 5;
    reasons.push('Further out');
  }

  return {
    score,
    reason: reasons.join(', ')
  };
}

export function suggestBestTimeSlots(
  events: ScheduledEvent[],
  preferences: CalendarPreferences,
  durationMinutes: number,
  daysToSearch: number = 7,
  maxSuggestions: number = 5
): SuggestedSlot[] {
  const suggestions: SuggestedSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysToSearch; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + i);

    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
      continue;
    }

    const slots = findAvailableSlots(events, preferences, checkDate, durationMinutes);

    for (const slot of slots) {
      const { score, reason } = scoreTimeSlot(slot, preferences, durationMinutes);

      suggestions.push({
        ...slot,
        score,
        reason
      });
    }
  }

  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, maxSuggestions);
}

export function formatTimeSlot(slot: TimeSlot): string {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (slotDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return `${formatDate(slot.start)} ${formatTime(slot.start)} - ${formatTime(slot.end)}`;
}

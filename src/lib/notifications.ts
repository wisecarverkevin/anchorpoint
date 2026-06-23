import { ScheduledEvent } from './types';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function scheduleEventNotification(
  event: ScheduledEvent,
  minutesBefore: number
): number | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const eventStart = new Date(event.start_time);
  const notificationTime = new Date(eventStart.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();
  const delay = notificationTime.getTime() - now.getTime();

  if (delay <= 0) {
    return null;
  }

  const timeoutId = window.setTimeout(() => {
    showNotification(event);
  }, delay);

  return timeoutId;
}

function showNotification(event: ScheduledEvent): void {
  const eventStart = new Date(event.start_time);
  const timeString = eventStart.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const eventTypeLabels: Record<string, string> = {
    power_block: 'Power Block',
    reset: 'Reset',
    task: 'Task',
    other: 'Event'
  };

  const typeLabel = eventTypeLabels[event.event_type] || 'Event';

  new Notification(`${typeLabel} Starting Soon`, {
    body: `${event.title} at ${timeString}`,
    icon: '/favicon.ico',
    tag: event.id,
    requireInteraction: false
  });
}

export function cancelNotification(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}

export class NotificationManager {
  private scheduledNotifications: Map<string, number> = new Map();

  scheduleForEvent(event: ScheduledEvent, minutesBefore: number): void {
    this.cancel(event.id);

    const timeoutId = scheduleEventNotification(event, minutesBefore);
    if (timeoutId) {
      this.scheduledNotifications.set(event.id, timeoutId);
    }
  }

  cancel(eventId: string): void {
    const timeoutId = this.scheduledNotifications.get(eventId);
    if (timeoutId) {
      cancelNotification(timeoutId);
      this.scheduledNotifications.delete(eventId);
    }
  }

  cancelAll(): void {
    for (const timeoutId of this.scheduledNotifications.values()) {
      cancelNotification(timeoutId);
    }
    this.scheduledNotifications.clear();
  }

  rescheduleAll(events: ScheduledEvent[], minutesBefore: number): void {
    this.cancelAll();

    const now = new Date();
    const upcomingEvents = events.filter(event => {
      const eventStart = new Date(event.start_time);
      return eventStart > now;
    });

    for (const event of upcomingEvents) {
      this.scheduleForEvent(event, minutesBefore);
    }
  }
}

export const notificationManager = new NotificationManager();

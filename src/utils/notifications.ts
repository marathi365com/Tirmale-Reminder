import { Reminder } from '../types/reminder';
import { audioManager } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export function showSystemNotification(reminder: Reminder, categoryLabel: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title = `🔔 ${reminder.title} - Tirmal Reminder`;
    const bodyText = `${categoryLabel} • वेळ: ${reminder.time} वा.\n${reminder.description || 'आपली महत्त्वाची आठवण!'}`;

    const notification = new Notification(title, {
      body: bodyText,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `tirmal-${reminder.id}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.warn('Could not display system notification:', e);
  }
}

/**
 * Checks if a reminder matches right now for alarm trigger
 */
export function checkReminderTrigger(
  reminder: Reminder,
  alreadyTriggeredSet: Set<string>
): boolean {
  if (!reminder.isActive || reminder.isCompleted) return false;

  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = String(now.getMonth() + 1).padStart(2, '0');
  const currentD = String(now.getDate()).padStart(2, '0');
  const currentDateStr = `${currentY}-${currentM}-${currentD}`;

  const currentH = String(now.getHours()).padStart(2, '0');
  const currentMin = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentH}:${currentMin}`;

  // Check snoozed status
  if (reminder.snoozedUntil) {
    const snoozedTime = new Date(reminder.snoozedUntil).getTime();
    if (now.getTime() >= snoozedTime) {
      const triggerKey = `${reminder.id}-snooze-${currentDateStr}-${currentTimeStr}`;
      if (!alreadyTriggeredSet.has(triggerKey)) {
        alreadyTriggeredSet.add(triggerKey);
        return true;
      }
    }
    return false;
  }

  // Check exact scheduled date and time
  if (reminder.date === currentDateStr && reminder.time === currentTimeStr) {
    const triggerKey = `${reminder.id}-${currentDateStr}-${currentTimeStr}`;
    if (!alreadyTriggeredSet.has(triggerKey)) {
      alreadyTriggeredSet.add(triggerKey);
      return true;
    }
  }

  return false;
}

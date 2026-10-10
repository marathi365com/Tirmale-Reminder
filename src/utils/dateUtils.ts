import { RecurrenceType } from '../types/reminder';

export const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

export const MARATHI_DAYS = [
  'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
];

export const MARATHI_NUMERALS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
};

export function toMarathiDigits(numStr: string | number): string {
  return String(numStr).replace(/[0-9]/g, (digit) => MARATHI_NUMERALS[digit] || digit);
}

/**
 * Format date string (YYYY-MM-DD) into readable Marathi format:
 * e.g., "१० ऑक्टोबर २०२६ (शनिवार)"
 */
export function formatMarathiDate(dateStr: string, includeDay = true): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  if (isNaN(dateObj.getTime())) return dateStr;

  const marathiMonth = MARATHI_MONTHS[month - 1];
  const marathiDay = MARATHI_DAYS[dateObj.getDay()];
  const formattedDay = toMarathiDigits(day);
  const formattedYear = toMarathiDigits(year);

  if (includeDay) {
    return `${formattedDay} ${marathiMonth} ${formattedYear} (${marathiDay})`;
  }
  return `${formattedDay} ${marathiMonth} ${formattedYear}`;
}

/**
 * Format 24h time "HH:mm" to Marathi 12h format:
 * e.g., "सकाळी ९:३०", "दुपारी २:१५", "संध्याकाळी ६:००", "रात्री ९:४५"
 */
export function formatMarathiTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  let period = '';
  if (hours >= 4 && hours < 12) {
    period = 'सकाळी';
  } else if (hours >= 12 && hours < 16) {
    period = 'दुपारी';
  } else if (hours >= 16 && hours < 20) {
    period = 'संध्याकाळी';
  } else {
    period = 'रात्री';
  }

  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutesPadded = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${period} ${toMarathiDigits(hours12)}:${toMarathiDigits(minutesPadded)}`;
}

/**
 * Standard English 12-hour format e.g., "09:30 AM"
 */
export function formatEnglishTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutesPadded = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours12}:${minutesPadded} ${period}`;
}

/**
 * Get human-readable relative time (Marathi)
 */
export function getRelativeTimeMarathi(dateStr: string, timeStr: string): { text: string; isPast: boolean; isToday: boolean } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const targetDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  const diffMs = targetDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isToday =
    now.getFullYear() === targetDate.getFullYear() &&
    now.getMonth() === targetDate.getMonth() &&
    now.getDate() === targetDate.getDate();

  if (diffMinutes < 0) {
    // Past
    const absMin = Math.abs(diffMinutes);
    if (absMin < 60) {
      return { text: `${toMarathiDigits(absMin)} मिनिटांपूर्वी`, isPast: true, isToday };
    }
    const absHours = Math.abs(diffHours);
    if (absHours < 24 && isToday) {
      return { text: `आज ${toMarathiDigits(absHours)} तासांपूर्वी`, isPast: true, isToday: true };
    }
    const absDays = Math.abs(diffDays);
    if (absDays === 1) {
      return { text: 'काल झाले', isPast: true, isToday: false };
    }
    return { text: `${toMarathiDigits(absDays)} दिवसांपूर्वी`, isPast: true, isToday: false };
  }

  // Future
  if (diffMinutes === 0) {
    return { text: 'आत्ताच अलार्म!', isPast: false, isToday: true };
  }
  if (diffMinutes < 60) {
    return { text: `${toMarathiDigits(diffMinutes)} मिनिटांत`, isPast: false, isToday: true };
  }
  if (isToday) {
    return { text: `आज (${toMarathiDigits(diffHours)} तासांत)`, isPast: false, isToday: true };
  }

  // Tomorrow check
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    tomorrow.getFullYear() === targetDate.getFullYear() &&
    tomorrow.getMonth() === targetDate.getMonth() &&
    tomorrow.getDate() === targetDate.getDate();

  if (isTomorrow) {
    return { text: 'उद्या', isPast: false, isToday: false };
  }

  if (diffDays <= 30) {
    return { text: `${toMarathiDigits(diffDays)} दिवसांत`, isPast: false, isToday: false };
  }

  const months = Math.round(diffDays / 30);
  return { text: `${toMarathiDigits(months)} महिन्यांत`, isPast: false, isToday: false };
}

/**
 * Calculate the NEXT trigger date when a recurring reminder completes
 */
export function calculateNextOccurrence(currentDateStr: string, recurrence: RecurrenceType): string | null {
  if (recurrence === 'none') return null;

  const [year, month, day] = currentDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case '15days':
      date.setDate(date.getDate() + 15);
      break;
    case '1month':
      date.setMonth(date.getMonth() + 1);
      break;
    case '2months':
      date.setMonth(date.getMonth() + 2);
      break;
    case '3months':
      date.setMonth(date.getMonth() + 3);
      break;
    case '4months':
      date.setMonth(date.getMonth() + 4);
      break;
    case '5months':
      date.setMonth(date.getMonth() + 5);
      break;
    case '6months':
      date.setMonth(date.getMonth() + 6);
      break;
    case '7months':
      date.setMonth(date.getMonth() + 7);
      break;
    case '8months':
      date.setMonth(date.getMonth() + 8);
      break;
    case '9months':
      date.setMonth(date.getMonth() + 9);
      break;
    case '10months':
      date.setMonth(date.getMonth() + 10);
      break;
    case '12months':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

/**
 * Get recurrence label in Marathi
 */
export function getRecurrenceLabelMarathi(recurrence: RecurrenceType): string {
  switch (recurrence) {
    case 'none':
      return 'एकदाच (फक्त एक वेळ)';
    case 'daily':
      return 'दररोज (Daily)';
    case 'weekly':
      return 'आठवड्यातून एक वेळा (Weekly)';
    case '15days':
      return '१५ दिवसांतून एकदा (Every 15 days)';
    case '1month':
      return 'दर महिन्याला (1 Month)';
    case '2months':
      return '२ महिन्यांत एकदा (2 Months)';
    case '3months':
      return '३ महिन्यांत एकदा (त्रैमासिक / 3 Months)';
    case '4months':
      return '४ महिन्यांत एकदा (4 Months)';
    case '5months':
      return '५ महिन्यांत एकदा (5 Months)';
    case '6months':
      return '६ महिन्यांत एकदा (अर्धवार्षिक / 6 Months)';
    case '7months':
      return '७ महिन्यांत एकदा (7 Months)';
    case '8months':
      return '८ महिन्यांत एकदा (8 Months)';
    case '9months':
      return '९ महिन्यांत एकदा (9 Months)';
    case '10months':
      return '१० महिन्यांत एकदा (10 Months)';
    case '12months':
      return '१२ महिन्यांत एकदा (वार्षिक / 12 Months)';
    default:
      return recurrence;
  }
}

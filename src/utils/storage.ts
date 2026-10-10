import { Reminder } from '../types/reminder';

const STORAGE_KEY = 'tirmal_reminders_v1';
const SOUND_SETTINGS_KEY = 'tirmal_sound_settings_v1';

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'आईचा वाढदिवस (Mother\'s Birthday)',
    description: 'केक, फुले आणि भेटवस्तू आणायची आहे.',
    category: 'birthday',
    date: getTodayDateStr(), // Set to today for instant testing
    time: '19:30',
    recurrence: '12months',
    sound: 'temple',
    speakTitle: true,
    advanceNoticeMinutes: 60,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'घर (Home)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'गृहकर्ज हप्ता (Home Loan EMI)',
    description: 'बँक खात्यात आवश्यक शिल्लक रक्कम ठेवणे.',
    category: 'installment',
    amount: 18500,
    date: getTodayDateStr(),
    time: '10:00',
    recurrence: '1month',
    sound: 'classic',
    speakTitle: true,
    advanceNoticeMinutes: 1440,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'SBI बँक खात्यातून',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'बाईक सर्व्हिसिंग (Bike Servicing)',
    description: 'इंजिन ऑइल चेंज, ब्रेक चेकिंग आणि वॉशिंग.',
    category: 'service',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    time: '11:00',
    recurrence: '3months',
    sound: 'melodic',
    speakTitle: true,
    advanceNoticeMinutes: 30,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'हिरो सर्व्हिस सेंटर',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-4',
    title: 'डॉक्टर अपॉइंटमेंट (Doctor Checkup)',
    description: 'रक्तदाब व नियमित तपासणी रिपोर्ट दाखवणे.',
    category: 'appointment',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    time: '17:00',
    recurrence: '1month',
    sound: 'gentle',
    speakTitle: true,
    advanceNoticeMinutes: 60,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'डॉ. जोशी क्लिनिक',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-5',
    title: 'ऑफिस टीम रिव्ह्यू मीटिंग (Team Review)',
    description: 'महिन्याचा प्रगती अहवाल आणि नवीन प्रोजेक्ट चर्चा.',
    category: 'meeting',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    time: '14:30',
    recurrence: 'weekly',
    sound: 'melodic',
    speakTitle: false,
    advanceNoticeMinutes: 15,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'Google Meet / कॉन्फरन्स हॉल',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-6',
    title: 'लाईट बिल भरणे (Electricity Bill)',
    description: 'महावितरण वीज बिल मुदतीपूर्वी ऑनलाइन भरणे.',
    category: 'bill',
    amount: 1420,
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    time: '12:00',
    recurrence: '1month',
    sound: 'classic',
    speakTitle: true,
    advanceNoticeMinutes: 1440,
    isActive: true,
    isCompleted: false,
    personOrPlace: 'महावितरण अ‍ॅप',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_REMINDERS;
  } catch (e) {
    console.error('Failed to load reminders from storage:', e);
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
}

export interface SoundSettings {
  defaultSound: 'classic' | 'melodic' | 'gentle' | 'temple';
  voiceAnnouncement: boolean;
  vibrateEnabled: boolean;
}

export function loadSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    defaultSound: 'classic',
    voiceAnnouncement: true,
    vibrateEnabled: true,
  };
}

export function saveSoundSettings(settings: SoundSettings): void {
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
}

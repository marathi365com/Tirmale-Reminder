import { ReminderCategory, RecurrenceType, AlarmSoundType } from '../types/reminder';
import {
  Cake,
  Users,
  CalendarCheck2,
  Wrench,
  CreditCard,
  Receipt,
  Pill,
  BellRing
} from 'lucide-react';

export interface CategoryMeta {
  id: ReminderCategory;
  labelMr: string;
  labelEn: string;
  icon: typeof Cake;
  colorClass: string;
  borderClass: string;
  badgeBg: string;
  textClass: string;
  dotColor: string;
}

export const CATEGORIES: Record<ReminderCategory, CategoryMeta> = {
  birthday: {
    id: 'birthday',
    labelMr: 'वाढदिवस',
    labelEn: 'Birthday',
    icon: Cake,
    colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    borderClass: 'border-l-rose-500',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
    textClass: 'text-rose-400',
    dotColor: '#f43f5e',
  },
  meeting: {
    id: 'meeting',
    labelMr: 'मीटिंग',
    labelEn: 'Meeting',
    icon: Users,
    colorClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    borderClass: 'border-l-indigo-500',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
    textClass: 'text-indigo-400',
    dotColor: '#6366f1',
  },
  appointment: {
    id: 'appointment',
    labelMr: 'अपॉइंटमेंट',
    labelEn: 'Appointment',
    icon: CalendarCheck2,
    colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
    textClass: 'text-emerald-400',
    dotColor: '#10b981',
  },
  service: {
    id: 'service',
    labelMr: 'सर्व्हिसिंग',
    labelEn: 'Service',
    icon: Wrench,
    colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderClass: 'border-l-amber-500',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
    textClass: 'text-amber-400',
    dotColor: '#f59e0b',
  },
  installment: {
    id: 'installment',
    labelMr: 'हप्ता (EMI)',
    labelEn: 'Installment (EMI)',
    icon: CreditCard,
    colorClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    borderClass: 'border-l-purple-500',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/30',
    textClass: 'text-purple-400',
    dotColor: '#a855f7',
  },
  bill: {
    id: 'bill',
    labelMr: 'बिल पेमेंट',
    labelEn: 'Bill Payment',
    icon: Receipt,
    colorClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    borderClass: 'border-l-cyan-500',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
    textClass: 'text-cyan-400',
    dotColor: '#06b6d4',
  },
  medicine: {
    id: 'medicine',
    labelMr: 'औषध',
    labelEn: 'Medicine',
    icon: Pill,
    colorClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    borderClass: 'border-l-orange-500',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/30',
    textClass: 'text-orange-400',
    dotColor: '#f97316',
  },
  other: {
    id: 'other',
    labelMr: 'इतर कामे',
    labelEn: 'Other Tasks',
    icon: BellRing,
    colorClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    borderClass: 'border-l-blue-500',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/30',
    textClass: 'text-blue-400',
    dotColor: '#3b82f6',
  },
};

export interface RecurrenceOption {
  value: RecurrenceType;
  labelMr: string;
  labelEn: string;
  hintMr: string;
}

export const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { value: 'none', labelMr: 'एकदाच (फक्त एक वेळ)', labelEn: 'One Time (No Repeat)', hintMr: 'एकदा झाल्यावर थांबेल' },
  { value: 'daily', labelMr: 'दररोज (Daily)', labelEn: 'Daily', hintMr: 'दररोज त्याच वेळी वाजेल' },
  { value: 'weekly', labelMr: 'आठवड्यातून एक वेळा (Weekly)', labelEn: 'Weekly', hintMr: 'दर आठवड्याला त्याच वारी' },
  { value: '15days', labelMr: '१५ दिवसांत (Every 15 Days)', labelEn: 'Every 15 Days', hintMr: 'प्रत्येक १५ दिवसांनी' },
  { value: '1month', labelMr: 'एका महिन्यात (Every 1 Month)', labelEn: 'Every 1 Month', hintMr: 'दर महिन्याला नियमित' },
  { value: '2months', labelMr: 'दोन महिन्यात (Every 2 Months)', labelEn: 'Every 2 Months', hintMr: 'दर २ महिन्यांनी' },
  { value: '3months', labelMr: 'तीन महिन्यात (त्रैमासिक / Every 3 Months)', labelEn: 'Every 3 Months', hintMr: 'प्रत्येक ३ महिन्यांनी' },
  { value: '4months', labelMr: 'चार महिन्यात (Every 4 Months)', labelEn: 'Every 4 Months', hintMr: 'प्रत्येक ४ महिन्यांनी' },
  { value: '5months', labelMr: 'पाच महिन्यात (Every 5 Months)', labelEn: 'Every 5 Months', hintMr: 'प्रत्येक ५ महिन्यांनी' },
  { value: '6months', labelMr: 'सहा महिन्यात (अर्धवार्षिक / Every 6 Months)', labelEn: 'Every 6 Months', hintMr: 'प्रत्येक ६ महिन्यांनी' },
  { value: '7months', labelMr: 'सात महिन्यात (Every 7 Months)', labelEn: 'Every 7 Months', hintMr: 'प्रत्येक ७ महिन्यांनी' },
  { value: '8months', labelMr: 'आठ महिन्यात (Every 8 Months)', labelEn: 'Every 8 Months', hintMr: 'प्रत्येक ८ महिन्यांनी' },
  { value: '9months', labelMr: 'नऊ महिन्यात (Every 9 Months)', labelEn: 'Every 9 Months', hintMr: 'प्रत्येक ९ महिन्यांनी' },
  { value: '10months', labelMr: '१० महिन्यात (Every 10 Months)', labelEn: 'Every 10 Months', hintMr: 'प्रत्येक १० महिन्यांनी' },
  { value: '12months', labelMr: '१२ महिन्यात (वार्षिक / Every 12 Months)', labelEn: 'Every 12 Months (Yearly)', hintMr: 'दर वर्षी याच तारखेला' },
];

export const SOUND_OPTIONS: { id: AlarmSoundType; nameMr: string; nameEn: string }[] = [
  { id: 'classic', nameMr: '🔔 क्लासिक रिंग (Classic Bell)', nameEn: 'Classic Alarm' },
  { id: 'melodic', nameMr: '🎵 मधुर बीप (Melodic Chime)', nameEn: 'Melodic Chime' },
  { id: 'gentle', nameMr: '🌿 मंद शांत टोन (Gentle Soft)', nameEn: 'Gentle Soft' },
  { id: 'temple', nameMr: '🛕 मंदिर घंटा (Temple Bell)', nameEn: 'Temple Bell' },
];

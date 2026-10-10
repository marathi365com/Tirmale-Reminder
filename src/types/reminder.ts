export type ReminderCategory =
  | 'birthday'     // वाढदिवस
  | 'meeting'      // मीटिंग
  | 'appointment'  // अपॉइंटमेंट
  | 'service'      // सर्व्हिसिंग
  | 'installment'  // हप्ता (EMI)
  | 'medicine'     // औषध
  | 'bill'         // बिल पेमेंट
  | 'other';       // इतर

export type RecurrenceType =
  | 'none'       // एक वेळ (One time)
  | 'daily'      // दररोज (Daily)
  | 'weekly'     // आठवड्यातून एक वेळा (Weekly)
  | '15days'     // १५ दिवसांत (Every 15 days)
  | '1month'     // एका महिन्यात (Every 1 month)
  | '2months'    // २ महिन्यात (Every 2 months)
  | '3months'    // ३ महिन्यात (Every 3 months)
  | '4months'    // ४ महिन्यात (Every 4 months)
  | '5months'    // ५ महिन्यात (Every 5 months)
  | '6months'    // ६ महिन्यात (Every 6 months)
  | '7months'    // ७ महिन्यात (Every 7 months)
  | '8months'    // ८ महिन्यात (Every 8 months)
  | '9months'    // ९ महिन्यात (Every 9 months)
  | '10months'   // १० महिन्यात (Every 10 months)
  | '12months';  // १२ महिन्यात / वार्षिक (Every 12 months)

export type AlarmSoundType = 'classic' | 'melodic' | 'gentle' | 'temple';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  category: ReminderCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  recurrence: RecurrenceType;
  sound: AlarmSoundType;
  speakTitle: boolean; // Text-To-Speech announcement
  advanceNoticeMinutes: number; // 0 = at time, 15, 30, 60, 1440 (1 day)
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  snoozedUntil?: string; // ISO timestamp
  amount?: number; // Optional for installment / bills (रुपये)
  personOrPlace?: string; // e.g. कोणासाठी किंवा कुठे
  createdAt: string;
  updatedAt: string;
}

export type ViewTab = 'all' | 'today' | 'upcoming' | 'installments' | 'completed';

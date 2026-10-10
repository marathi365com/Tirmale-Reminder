import React, { useEffect } from 'react';
import { Reminder } from '../types/reminder';
import { CATEGORIES } from '../utils/constants';
import { audioManager } from '../utils/audio';
import { formatMarathiDate, formatMarathiTime } from '../utils/dateUtils';
import { Bell, Clock, CheckCircle2, RotateCcw, Volume2, Sparkles, MapPin, IndianRupee } from 'lucide-react';

interface AlarmModalProps {
  reminder: Reminder | null;
  onDismiss: (reminder: Reminder) => void;
  onSnooze: (reminder: Reminder, minutes: number) => void;
  onComplete: (reminder: Reminder) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  reminder,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  useEffect(() => {
    if (!reminder) return;

    // Start audio ringing and vibration
    audioManager.startAlarmRinging(reminder.sound || 'classic');

    // Announce via speech if enabled
    if (reminder.speakTitle) {
      const cat = CATEGORIES[reminder.category]?.labelMr || 'रिमाइंडर';
      audioManager.speakAnnouncement(reminder.title, cat);
    }

    return () => {
      audioManager.stopAlarmRinging();
    };
  }, [reminder]);

  if (!reminder) return null;

  const categoryMeta = CATEGORIES[reminder.category] || CATEGORIES.other;
  const CategoryIcon = categoryMeta.icon;

  const handleStop = () => {
    audioManager.stopAlarmRinging();
    onDismiss(reminder);
  };

  const handleDone = () => {
    audioManager.stopAlarmRinging();
    onComplete(reminder);
  };

  const handleSnooze = (minutes: number) => {
    audioManager.stopAlarmRinging();
    onSnooze(reminder, minutes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl text-white">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 flex flex-col items-center text-center">
          {/* Animated Alarm Bell */}
          <div className="relative my-4">
            <div className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping opacity-75" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Bell className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>

          {/* App title badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tirmal Reminder अलार्म</span>
          </div>

          {/* Category Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm font-medium mb-3">
            <CategoryIcon className={`w-4 h-4 ${categoryMeta.textClass}`} />
            <span className={categoryMeta.textClass}>{categoryMeta.labelMr}</span>
          </div>

          {/* Reminder Title */}
          <h2 className="text-2xl font-bold text-white tracking-wide mb-2 px-2 leading-tight">
            {reminder.title}
          </h2>

          {/* Description */}
          {reminder.description && (
            <p className="text-slate-300 text-sm mb-3 max-w-sm px-2">
              {reminder.description}
            </p>
          )}

          {/* Person / Place / Amount pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {reminder.amount && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <IndianRupee className="w-3.5 h-3.5" />
                रक्कम: ₹{reminder.amount.toLocaleString('en-IN')}
              </span>
            )}
            {reminder.personOrPlace && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {reminder.personOrPlace}
              </span>
            )}
          </div>

          {/* Time & Date display */}
          <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 mb-6 flex items-center justify-around">
            <div className="text-center">
              <span className="text-xs text-slate-400 block">वेळ (Time)</span>
              <span className="text-lg font-bold text-indigo-300">
                {formatMarathiTime(reminder.time)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-xs text-slate-400 block">तारीख (Date)</span>
              <span className="text-sm font-medium text-slate-200">
                {formatMarathiDate(reminder.date, false)}
              </span>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="w-full space-y-2.5">
            <button
              onClick={handleDone}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold text-base shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>काम पूर्ण झाले (Mark Done)</span>
            </button>

            <button
              onClick={handleStop}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>अलार्म बंद करा (Dismiss)</span>
            </button>
          </div>

          {/* Snooze Options */}
          <div className="w-full mt-5 pt-4 border-t border-slate-800">
            <span className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1 mb-2.5">
              <RotateCcw className="w-3.5 h-3.5" />
              स्नूझ करा (काही वेळाने पुन्हा आठवण करा)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSnooze(5)}
                className="py-2 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-indigo-300 active:scale-95 transition"
              >
                +५ मिनिटे
              </button>
              <button
                onClick={() => handleSnooze(15)}
                className="py-2 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-indigo-300 active:scale-95 transition"
              >
                +१५ मिनिटे
              </button>
              <button
                onClick={() => handleSnooze(60)}
                className="py-2 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-indigo-300 active:scale-95 transition"
              >
                +१ तास
              </button>
            </div>
            <button
              onClick={() => handleSnooze(1440)}
              className="mt-2 w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              उद्या याच वेळी आठवण करा (+१ दिवस)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Reminder } from '../types/reminder';
import { CATEGORIES } from '../utils/constants';
import {
  formatMarathiDate,
  formatMarathiTime,
  getRelativeTimeMarathi,
  getRecurrenceLabelMarathi
} from '../utils/dateUtils';
import { audioManager } from '../utils/audio';
import {
  Clock,
  Calendar,
  RotateCw,
  Bell,
  CheckCircle2,
  Trash2,
  Edit2,
  Volume2,
  IndianRupee,
  MapPin,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onComplete: (reminder: Reminder) => void;
  onSnooze: (reminder: Reminder, minutes: number) => void;
  onTriggerAlarmNow: (reminder: Reminder) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onEdit,
  onDelete,
  onToggleActive,
  onComplete,
  onSnooze,
  onTriggerAlarmNow,
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const categoryMeta = CATEGORIES[reminder.category] || CATEGORIES.other;
  const CategoryIcon = categoryMeta.icon;

  const relative = getRelativeTimeMarathi(reminder.date, reminder.time);
  const recurrenceLabel = getRecurrenceLabelMarathi(reminder.recurrence);

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingTest(true);
    audioManager.playTone(reminder.sound || 'classic');
    if (reminder.speakTitle) {
      audioManager.speakAnnouncement(reminder.title, categoryMeta.labelMr);
    }
    setTimeout(() => setIsPlayingTest(false), 1200);
  };

  return (
    <div
      className={`group relative rounded-3xl p-4 sm:p-5 border transition-all duration-200 shadow-md ${
        reminder.isCompleted
          ? 'bg-slate-900/60 border-slate-800 opacity-70'
          : reminder.isActive
          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600 shadow-slate-950/30'
          : 'bg-slate-900/50 border-slate-800/80 opacity-60'
      }`}
    >
      {/* Category accent left border stripe indicator */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
        style={{ backgroundColor: categoryMeta.dotColor }}
      />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryMeta.badgeBg}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categoryMeta.labelMr}</span>
          </span>

          {/* Recurrence Badge */}
          {reminder.recurrence !== 'none' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 text-[11px] font-medium">
              <RotateCw className="w-3 h-3 text-indigo-400" />
              <span>{recurrenceLabel.split('(')[0]}</span>
            </span>
          )}

          {/* Snooze alert badge */}
          {reminder.snoozedUntil && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/30 text-[11px] animate-pulse">
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>स्नूझ चालू आहे</span>
            </span>
          )}
        </div>

        {/* Active Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title={reminder.isActive ? 'अलार्म चालू आहे' : 'अलार्म बंद आहे'}
            onClick={() => onToggleActive(reminder.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              reminder.isActive ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                reminder.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3.5 pl-2">
        <h3
          className={`text-lg font-bold tracking-tight text-white ${
            reminder.isCompleted ? 'line-through text-slate-400' : ''
          }`}
        >
          {reminder.title}
        </h3>
        {reminder.description && (
          <p className="text-slate-300 text-xs sm:text-sm mt-1 line-clamp-2">
            {reminder.description}
          </p>
        )}
      </div>

      {/* Meta Pills: Amount and Place */}
      {(reminder.amount || reminder.personOrPlace) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 pl-2">
          {reminder.amount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <IndianRupee className="w-3 h-3" />
              ₹{reminder.amount.toLocaleString('en-IN')}
            </span>
          )}
          {reminder.personOrPlace && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs">
              <MapPin className="w-3 h-3 text-slate-400" />
              {reminder.personOrPlace}
            </span>
          )}
        </div>
      )}

      {/* Date & Time highlight bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 mb-3.5 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{formatMarathiDate(reminder.date, false)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatMarathiTime(reminder.time)}</span>
          </div>
        </div>

        {/* Relative Time Chip */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            relative.isPast
              ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
              : relative.isToday
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 animate-pulse'
              : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          {relative.text}
        </span>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 pl-2">
        {/* Left Action buttons: Test Sound & Trigger Alarm */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTestSound}
            title="आवाज ऐका"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700/60 transition"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingTest ? 'text-indigo-400 animate-bounce' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onTriggerAlarmNow(reminder)}
            title="आत्ताच अलार्म वाजवा (Test Full Ring)"
            className="px-2.5 py-1.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-700/50 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>रिंग टेस्ट</span>
          </button>
        </div>

        {/* Right Action buttons: Snooze, Complete, Edit, Delete */}
        <div className="flex items-center gap-1.5 relative">
          {/* Snooze button with popover options */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
              title="स्नूझ करा"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {showSnoozeMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl p-1.5 z-20 space-y-1 text-xs">
                <button
                  onClick={() => {
                    onSnooze(reminder, 10);
                    setShowSnoozeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  +१० मिनिटे स्नूझ
                </button>
                <button
                  onClick={() => {
                    onSnooze(reminder, 30);
                    setShowSnoozeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  +३० मिनिटे स्नूझ
                </button>
                <button
                  onClick={() => {
                    onSnooze(reminder, 60);
                    setShowSnoozeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  +१ तास स्नूझ
                </button>
                <button
                  onClick={() => {
                    onSnooze(reminder, 1440);
                    setShowSnoozeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition"
                >
                  उद्या याच वेळी (+१ दिवस)
                </button>
              </div>
            )}
          </div>

          {/* Mark Complete */}
          <button
            type="button"
            onClick={() => onComplete(reminder)}
            title={reminder.isCompleted ? 'अपूर्ण करा' : 'पूर्ण झाले'}
            className={`p-2 rounded-xl border border-slate-700/60 transition ${
              reminder.isCompleted
                ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(reminder)}
            title="संपादित करा"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700/60 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(reminder.id)}
            title="हटवा"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

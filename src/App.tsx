import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Reminder, ReminderCategory, ViewTab } from './types/reminder';
import { loadReminders, saveReminders, getTodayDateStr } from './utils/storage';
import { checkReminderTrigger, showSystemNotification } from './utils/notifications';
import { CATEGORIES } from './utils/constants';
import { calculateNextOccurrence, formatMarathiDate } from './utils/dateUtils';
import { ReminderCard } from './components/ReminderCard';
import { ReminderFormModal } from './components/ReminderFormModal';
import { AlarmModal } from './components/AlarmModal';
import { CategoryFilter } from './components/CategoryFilter';
import { QuickStats } from './components/QuickStats';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  Bell,
  Plus,
  Search,
  Settings,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  Sparkles,
  RotateCw,
  FolderOpen,
  Volume2
} from 'lucide-react';

export default function App() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);

  // Set of already-triggered timestamps to prevent duplicate alerts in same minute
  const alreadyTriggeredRef = useRef<Set<string>>(new Set());

  // Current live time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Save to localStorage on change
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background alarm trigger loop (every 3 seconds)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // Don't ring another alarm if one is already actively ringing on screen
      if (activeAlarmReminder) return;

      for (const rem of reminders) {
        if (checkReminderTrigger(rem, alreadyTriggeredRef.current)) {
          setActiveAlarmReminder(rem);
          const catMeta = CATEGORIES[rem.category] || CATEGORIES.other;
          showSystemNotification(rem, catMeta.labelMr);
          break; // Ring one at a time
        }
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [reminders, activeAlarmReminder]);

  // Reminder operations
  const handleSaveReminder = (reminder: Reminder) => {
    setReminders((prev) => {
      const exists = prev.some((r) => r.id === reminder.id);
      if (exists) {
        return prev.map((r) => (r.id === reminder.id ? reminder : r));
      }
      return [reminder, ...prev];
    });
    setEditingReminder(null);
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm('हा रिमाइंडर खरोखर हटवायचा आहे का?')) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleCompleteReminder = (reminder: Reminder) => {
    if (reminder.recurrence && reminder.recurrence !== 'none') {
      // Calculate next scheduled occurrence
      const nextDate = calculateNextOccurrence(reminder.date, reminder.recurrence);
      if (nextDate) {
        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminder.id
              ? {
                  ...r,
                  date: nextDate,
                  snoozedUntil: undefined,
                  isCompleted: false,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        return;
      }
    }

    // Otherwise mark completed
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id
          ? {
              ...r,
              isCompleted: !r.isCompleted,
              completedAt: !r.isCompleted ? new Date().toISOString() : undefined,
              snoozedUntil: undefined,
            }
          : r
      )
    );
  };

  const handleSnoozeReminder = (reminder: Reminder, minutes: number) => {
    const snoozeTarget = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, snoozedUntil: snoozeTarget } : r
      )
    );
    setActiveAlarmReminder(null);
  };

  const handleDismissAlarm = (reminder: Reminder) => {
    setActiveAlarmReminder(null);
  };

  const handleTriggerAlarmNow = (reminder: Reminder) => {
    setActiveAlarmReminder(reminder);
  };

  const handleImportReminders = (imported: Reminder[]) => {
    setReminders(imported);
    saveReminders(imported);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem('tirmal_reminders_v1');
    const defaults = loadReminders();
    setReminders(defaults);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    reminders.forEach((r) => {
      if (!r.isCompleted) {
        counts.all = (counts.all || 0) + 1;
        counts[r.category] = (counts[r.category] || 0) + 1;
      }
    });
    return counts;
  }, [reminders]);

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    const todayStr = getTodayDateStr();

    return reminders.filter((rem) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rem.title.toLowerCase().includes(q);
        const matchesDesc = rem.description?.toLowerCase().includes(q);
        const matchesPlace = rem.personOrPlace?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesPlace) return false;
      }

      // Tab filter
      if (activeTab === 'completed') {
        return rem.isCompleted;
      }

      // If activeTab is not 'completed', omit completed items
      if (rem.isCompleted) return false;

      if (activeTab === 'today') {
        if (rem.date !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (rem.date < todayStr) return false;
      } else if (activeTab === 'installments') {
        if (rem.category !== 'installment' && rem.category !== 'bill') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && rem.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [reminders, selectedCategory, activeTab, searchQuery]);

  const todayStr = getTodayDateStr();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Top Android Status & Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Brand Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-900/40 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>Tirmal Reminder</span>
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    तिरमल
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  वाढदिवस • मिटिंग • सर्व्हिसिंग • हप्ता अलार्म
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2">
              <PWAInstallButton />

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="सेटिंग्ज व आवाज चाचणी"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingReminder(null);
                  setIsFormOpen(true);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-900/40 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>नवीन अलार्म</span>
              </button>
            </div>
          </div>

          {/* Android Time & Date ticker banner */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatMarathiDate(todayStr, true)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-indigo-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {currentTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-4 flex-1">
        {/* Quick Dashboard Stats */}
        <QuickStats
          reminders={reminders}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedCategory('all');
          }}
          activeTab={activeTab}
        />

        {/* Search Bar */}
        <div className="relative mb-3.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाव, वाढदिवस, हप्ता किंवा तपशील शोधा..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              साफ करा
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="mb-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Active Tab Title & Count */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-200">
              {activeTab === 'all' && 'सर्व रिमाइंडर्स'}
              {activeTab === 'today' && 'आजचे महत्वाचे अलार्म'}
              {activeTab === 'upcoming' && 'आगामी शेड्यूल'}
              {activeTab === 'installments' && 'हप्ते (EMI) व नियमित बिले'}
              {activeTab === 'completed' && 'पूर्ण झालेले रिमाइंडर्स'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-300">
              {filteredReminders.length}
            </span>
          </div>

          {activeTab === 'completed' && filteredReminders.length > 0 && (
            <button
              onClick={() => {
                if (confirm('पूर्ण झालेले सर्व रिमाइंडर्स कायमचे काढायचे का?')) {
                  setReminders((prev) => prev.filter((r) => !r.isCompleted));
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              इतिहास साफ करा
            </button>
          )}
        </div>

        {/* Reminder Cards List */}
        {filteredReminders.length > 0 ? (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onEdit={(rem) => {
                  setEditingReminder(rem);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteReminder}
                onToggleActive={handleToggleActive}
                onComplete={handleCompleteReminder}
                onSnooze={handleSnoozeReminder}
                onTriggerAlarmNow={handleTriggerAlarmNow}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 my-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderOpen className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              या विभागात कोणताही रिमाइंडर नाही
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
              वाढदिवस, मीटिंग, अपॉइंटमेंट, बाईक सर्व्हिसिंग किंवा हप्त्यांची आठवण ठेवण्यासाठी नवीन अलार्म जोडा.
            </p>
            <button
              onClick={() => {
                setEditingReminder(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन रिमाइंडर जोडा (Add Reminder)</span>
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for Mobile Phone */}
      <div className="fixed right-5 bottom-20 z-40 sm:bottom-6 sm:right-8">
        <button
          onClick={() => {
            setEditingReminder(null);
            setIsFormOpen(true);
          }}
          title="नवीन अलार्म लावा"
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-2xl shadow-indigo-600/60 flex items-center justify-center transition-all duration-200 active:scale-90"
        >
          <div className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-pulse-ring pointer-events-none" />
          <Plus className="w-7 h-7 text-white stroke-[2.5]" />
        </button>
      </div>

      {/* Android Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-5 py-1 px-1">
          {/* Tab 1: All */}
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'all'
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">सर्व</span>
          </button>

          {/* Tab 2: Today */}
          <button
            onClick={() => {
              setActiveTab('today');
              setSelectedCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'today'
                ? 'text-rose-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">आज</span>
          </button>

          {/* Tab 3: Upcoming */}
          <button
            onClick={() => {
              setActiveTab('upcoming');
              setSelectedCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'upcoming'
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">आगामी</span>
          </button>

          {/* Tab 4: Installments */}
          <button
            onClick={() => {
              setActiveTab('installments');
              setSelectedCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'installments'
                ? 'text-purple-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">हप्ता/EMI</span>
          </button>

          {/* Tab 5: Completed */}
          <button
            onClick={() => {
              setActiveTab('completed');
              setSelectedCategory('all');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'completed'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">पूर्ण</span>
          </button>
        </div>
      </nav>

      {/* Add / Edit Form Modal */}
      <ReminderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
        initialData={editingReminder}
      />

      {/* Alarm Ringing Modal */}
      <AlarmModal
        reminder={activeAlarmReminder}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeReminder}
        onComplete={handleCompleteReminder}
      />

      {/* Settings & Sound Testing Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reminders={reminders}
        onImportReminders={handleImportReminders}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}

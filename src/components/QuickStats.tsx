import React from 'react';
import { Reminder } from '../types/reminder';
import { getTodayDateStr } from '../utils/storage';
import { Bell, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface QuickStatsProps {
  reminders: Reminder[];
  onSelectTab: (tab: 'all' | 'today' | 'upcoming' | 'installments') => void;
  activeTab: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  reminders,
  onSelectTab,
  activeTab,
}) => {
  const todayStr = getTodayDateStr();

  const todayReminders = reminders.filter((r) => r.isActive && !r.isCompleted && r.date === todayStr);
  const totalActive = reminders.filter((r) => r.isActive && !r.isCompleted).length;
  const installments = reminders.filter((r) => r.isActive && !r.isCompleted && (r.category === 'installment' || r.category === 'bill'));
  const totalInstallmentAmount = installments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
      {/* Today's card */}
      <button
        onClick={() => onSelectTab('today')}
        className={`p-3 rounded-2xl border text-left transition-all ${
          activeTab === 'today'
            ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/30'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            आजचे अलार्म
          </span>
          <Bell className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white">{todayReminders.length}</span>
          <span className="text-[11px] text-slate-400">रिमाइंडर</span>
        </div>
      </button>

      {/* Upcoming / Active card */}
      <button
        onClick={() => onSelectTab('upcoming')}
        className={`p-3 rounded-2xl border text-left transition-all ${
          activeTab === 'upcoming'
            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-indigo-300">आगामी अलार्म</span>
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white">{totalActive}</span>
          <span className="text-[11px] text-slate-400">सक्रिय</span>
        </div>
      </button>

      {/* Installment / EMI total card */}
      <button
        onClick={() => onSelectTab('installments')}
        className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-left transition-all ${
          activeTab === 'installments'
            ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/30'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-purple-300">हप्ता (EMI) / बिल</span>
          <CreditCard className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">
            {totalInstallmentAmount > 0 ? `₹${totalInstallmentAmount.toLocaleString('en-IN')}` : `${installments.length} हप्ते`}
          </span>
          <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
            {installments.length} नोंदी
          </span>
        </div>
      </button>
    </div>
  );
};

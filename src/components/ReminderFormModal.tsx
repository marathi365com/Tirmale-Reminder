import React, { useState, useEffect } from 'react';
import { Reminder, ReminderCategory, RecurrenceType, AlarmSoundType } from '../types/reminder';
import { CATEGORIES, RECURRENCE_OPTIONS, SOUND_OPTIONS } from '../utils/constants';
import { audioManager } from '../utils/audio';
import { getTodayDateStr, getCurrentTimeStr } from '../utils/storage';
import {
  X,
  Calendar,
  Clock,
  RotateCw,
  Bell,
  Volume2,
  VolumeX,
  FileText,
  MapPin,
  IndianRupee,
  Sparkles,
  Check
} from 'lucide-react';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
  initialData?: Reminder | null;
}

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('birthday');
  const [date, setDate] = useState(getTodayDateStr());
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [sound, setSound] = useState<AlarmSoundType>('classic');
  const [speakTitle, setSpeakTitle] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [personOrPlace, setPersonOrPlace] = useState('');
  const [advanceNoticeMinutes, setAdvanceNoticeMinutes] = useState(0);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDate(initialData.date);
      setTime(initialData.time);
      setRecurrence(initialData.recurrence);
      setSound(initialData.sound || 'classic');
      setSpeakTitle(initialData.speakTitle ?? true);
      setDescription(initialData.description || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setPersonOrPlace(initialData.personOrPlace || '');
      setAdvanceNoticeMinutes(initialData.advanceNoticeMinutes || 0);
    } else {
      // Default new reminder
      setTitle('');
      setCategory('birthday');
      setDate(getTodayDateStr());
      setTime('09:00');
      setRecurrence('none');
      setSound('classic');
      setSpeakTitle(true);
      setDescription('');
      setAmount('');
      setPersonOrPlace('');
      setAdvanceNoticeMinutes(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTestSound = (snd: AlarmSoundType) => {
    setIsPlayingPreview(true);
    audioManager.playTone(snd);
    setTimeout(() => setIsPlayingPreview(false), 900);
  };

  const handleQuickTimePreset = (t: string) => {
    setTime(t);
  };

  const handleQuickDatePreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${dayStr}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reminderPayload: Reminder = {
      id: initialData ? initialData.id : `rem-${Date.now()}`,
      title: title.trim(),
      category,
      date,
      time,
      recurrence,
      sound,
      speakTitle,
      description: description.trim() || undefined,
      amount: amount ? Number(amount) : undefined,
      personOrPlace: personOrPlace.trim() || undefined,
      advanceNoticeMinutes,
      isActive: initialData ? initialData.isActive : true,
      isCompleted: false,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(reminderPayload);
    onClose();
  };

  const titleSuggestions: Record<ReminderCategory, string[]> = {
    birthday: ['आईचा वाढदिवस 🎂', 'वडिलांचा वाढदिवस 🎂', 'मित्राचा वाढदिवस 🎉', 'लग्नाचा वाढदिवस (Anniversary) 💍'],
    meeting: ['ऑफिस टीम मीटिंग 💼', 'क्लायंट चर्चा 🤝', 'सोसायटी मिटिंग 🏢', 'शाळा पालक सभा 🏫'],
    appointment: ['डॉक्टर तपासणी 🩺', 'दंतवैद्य (डेंटिस्ट) 🦷', 'डोळ्यांची तपासणी 👓', 'सैलून / ब्युटी पार्लर ✂️'],
    service: ['बाईक सर्व्हिसिंग 🛵', 'कार ऑइल चेंज 🚗', 'एसी (AC) सर्व्हिसिंग ❄️', 'वॉटर प्युरिफायर (RO) फिल्टर 💧'],
    installment: ['गृहकर्ज (Home Loan EMI) 🏠', 'बाईक/कार लोन हप्ता 🚘', 'पर्सनल लोन हप्ता 💳', 'विमा हप्ता (LIC / Insurance) 📑'],
    bill: ['वीज बिल (Light Bill) ⚡', 'मोबाईल / वायफाय रिचार्ज 📱', 'गॅस सिलेंडर बुकिंग 🛢️', 'पाणी पट्टी बिल 💧'],
    medicine: ['सकाळचे औषध 💊', 'रात्रीची गोळी 💊', 'इन्सुलिन डोस 💉', 'व्हिटॅमिन टॉनिक 🧪'],
    other: ['मुलांची फी भरणे 🎒', 'किराणा सामान आणणे 🛒', 'पासपोर्ट / डॉक्युमेंट रिन्यू 📄', 'गाडीचे PUC काढणे 🪪'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'रिमाइंडर संपादित करा' : 'नवीन रिमाइंडर जोडा'}
              </h2>
              <p className="text-xs text-slate-400">Tirmal Reminder • अचूक अलार्म व वेळ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              प्रकार निवडा (Category)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES) as ReminderCategory[]).map((catKey) => {
                const meta = CATEGORIES[catKey];
                const IconComponent = meta.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? `${meta.colorClass} border-indigo-500 shadow-sm shadow-indigo-500/20 scale-102`
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1 ${isSelected ? meta.textClass : 'text-slate-400'}`} />
                    <span className="text-[11px] font-semibold leading-tight line-clamp-1">{meta.labelMr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              रिमाइंडरचे नाव (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. आईचा वाढदिवस, बाईक सर्व्हिसिंग, EMI..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />

            {/* Quick Title Suggestions based on selected category */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {titleSuggestions[category]?.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug.replace(/[^\w\s\u0900-\u097F()'-]/gi, '').trim())}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker & Presets */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                तारीख (Date)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset(0)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50"
                >
                  आज
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset(1)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50"
                >
                  उद्या
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset(7)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50"
                >
                  +७ दिवस
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Time Picker & Presets */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                वेळ (Time) - अलार्म वाजेल
              </label>
              <span className="text-[11px] text-slate-400">२४ तास / AM-PM</span>
            </div>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Quick time chips */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickTimePreset('08:00')}
                className="py-1 px-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
              >
                सकाळी ८:००
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimePreset('12:00')}
                className="py-1 px-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
              >
                दुपारी १२:००
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimePreset('18:00')}
                className="py-1 px-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
              >
                संध्या. ६:००
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimePreset('21:00')}
                className="py-1 px-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
              >
                रात्री ९:००
              </button>
            </div>
          </div>

          {/* Recurrence Dropdown (All requested repeat intervals) */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                पुनरावृत्ती / वारंवारता (Repeat)
              </span>
              <span className="text-[11px] text-indigo-300 font-normal">
                {recurrence === 'none' ? 'फक्त एकदाच' : 'सतत आठवण'}
              </span>
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.labelMr}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {RECURRENCE_OPTIONS.find((o) => o.value === recurrence)?.hintMr}
            </p>
          </div>

          {/* Sound & Tone Selection */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                अलार्म टोन व आवाज (Alarm Sound)
              </label>
              <button
                type="button"
                onClick={() => handleTestSound(sound)}
                disabled={isPlayingPreview}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 border border-indigo-500/40 transition"
              >
                <Volume2 className="w-3 h-3" />
                {isPlayingPreview ? 'वाजतोय...' : 'आवाज तपासा'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((snd) => (
                <button
                  key={snd.id}
                  type="button"
                  onClick={() => {
                    setSound(snd.id);
                    handleTestSound(snd.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                    sound === snd.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{snd.nameMr}</span>
                    {sound === snd.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Voice Announcement Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="pr-2">
                <span className="text-xs font-semibold text-slate-200 block">
                  मराठीत बोलून आठवण सांगा (Voice Alert)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  अलार्म वाजताना रिमाइंडरचे नाव बोलून दाखवले जाईल
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpeakTitle(!speakTitle)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  speakTitle ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    speakTitle ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Optional Amount & Place/Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                हप्ता / रक्कम (ऐच्छिक ₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 15000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                ठिकाण / व्यक्ती (कोणासाठी)
              </label>
              <input
                type="text"
                value={personOrPlace}
                onChange={(e) => setPersonOrPlace(e.target.value)}
                placeholder="उदा. SBI बँक, सर्व्हिस सेंटर"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              काही टीप / तपशील (Notes)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदा. ऑइल चेंज करणे, केक आणणे, चेक जमा करणे..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 px-5 py-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            रद्द करा (Cancel)
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 transition active:scale-98"
          >
            {initialData ? 'अपडेट करा (Save)' : 'अलार्म लावा (Set Reminder)'}
          </button>
        </div>
      </div>
    </div>
  );
};

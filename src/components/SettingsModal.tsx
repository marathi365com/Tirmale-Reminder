import React, { useState } from 'react';
import { Reminder } from '../types/reminder';
import { SOUND_OPTIONS } from '../utils/constants';
import { audioManager } from '../utils/audio';
import { requestNotificationPermission } from '../utils/notifications';
import {
  X,
  Volume2,
  Bell,
  Smartphone,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onImportReminders: (imported: Reminder[]) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onImportReminders,
  onResetDefaults,
}) => {
  const [activeSoundTest, setActiveSoundTest] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestSound = (soundId: 'classic' | 'melodic' | 'gentle' | 'temple') => {
    setActiveSoundTest(soundId);
    audioManager.playTone(soundId);
    audioManager.speakAnnouncement('तिरमल रिमाइंडर आवाज चाचणी', 'अलार्म');
    setTimeout(() => setActiveSoundTest(null), 1200);
  };

  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotifStatus(perm);
    if (perm === 'granted') {
      setStatusMessage('नोटिफिकेशन परवानगी मिळाली! अलार्म वेळेवर वाजेल.');
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage('नोटिफिकेशन ब्लॉक आहे. कृपया ब्रॉउझर सेटिंग्ज तपासा.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reminders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tirmal-reminders-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMessage('बॅकअप फाईल डाउनलोड झाली!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportReminders(parsed);
          setStatusMessage(`${parsed.length} रिमाइंडर यशस्वीरित्या जोडले गेले!`);
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert('अवैध फाईल फॉरमॅट');
        }
      } catch (err) {
        alert('बॅकअप फाईल वाचता आली नाही.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Tirmal Reminder सेटिंग्ज</h2>
              <p className="text-xs text-slate-400">आवाज, नोटिफिकेशन्स व बॅकअप</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-indigo-900/80 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Notification Permission Card */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">सिस्टीम नोटिफिकेशन्स</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  notifStatus === 'granted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}
              >
                {notifStatus === 'granted' ? 'चालू आहे (Active)' : 'परवानगी हवी'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              अ‍ॅप बंद असले तरीही फोनवर अचूक वेळी अलार्म व नोटिफिकेशन येण्यासाठी परवानगी द्या.
            </p>
            {notifStatus !== 'granted' && (
              <button
                onClick={handleEnableNotification}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40 transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>नोटिफिकेशन सुरू करा (Allow)</span>
              </button>
            )}
          </div>

          {/* Alarm Sounds Test */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">अलार्म आवाज चाचणी (Test Sounds)</span>
            </div>
            <p className="text-xs text-slate-400">
              खालील बटणे दाबून वेगवेगळे अलार्म टोन ऐकून तपासा:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => handleTestSound(snd.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                    activeSoundTest === snd.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="truncate">{snd.nameMr}</span>
                  <Volume2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeSoundTest === snd.id ? 'text-indigo-400 animate-pulse' : 'text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">डेटा बॅकअप व रिस्टोर</span>
            </div>
            <p className="text-xs text-slate-400">
              आपले सर्व वाढदिवस, हप्ते व रिमाइंडर्स सुरक्षित ठेवण्यासाठी फाईल डाउनलोड करा:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>बॅकअप फाईल घ्या</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>फाईल रिस्टोर करा</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Defaults */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
            <span>सुरुवातीचे नमुने परत हवे आहेत का?</span>
            <button
              onClick={() => {
                if (confirm('सर्व डिफॉल्ट नमुना रिमाइंडर्स पुन्हा लोड करायचे आहेत का?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              डिफॉल्ट रिसेट
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
          <p className="text-[11px] text-slate-500">
            Tirmal Reminder • Android Responsive Web App • © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

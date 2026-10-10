import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on Android/iOS, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-900/30 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Android App इन्स्टॉल</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>अ‍ॅप इन्स्टॉल करा</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  फोनवर अ‍ॅप इन्स्टॉल करा
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 space-y-2 leading-relaxed">
                १. खालील Safari ब्रॉउझर मधील <strong>Share (शेअर)</strong> बटनावर टॅप करा.<br />
                २. खाली स्क्रोल करून <strong>Add to Home Screen</strong> निवडा.<br />
                ३. <strong>Tirmal Reminder</strong> तुमच्या फोनच्या होम स्क्रीनवर इन्स्टॉल होईल!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
              >
                समजले (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

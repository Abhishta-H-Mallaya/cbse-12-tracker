import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  Smartphone, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Download, 
  CheckCircle2, 
  X,
  WifiOff,
  Sparkles
} from 'lucide-react';

export const InstallGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { installApp, isInstallable } = usePlanner();
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Download Offline App</h3>
              <p className="text-xs text-slate-400">Install to your phone home screen</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Badge */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
          <WifiOff className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Works 100% offline with zero internet once installed!</span>
        </div>

        {/* 1-Click Install Button if supported by browser */}
        {isInstallable && (
          <button
            onClick={() => {
              installApp();
              onClose();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
          >
            <Download className="w-4 h-4" />
            <span>1-Tap Install App Now</span>
          </button>
        )}

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setPlatform('android')}
            className={`py-2 rounded-lg transition ${
              platform === 'android' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Android (Chrome)
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`py-2 rounded-lg transition ${
              platform === 'ios' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🍏 iPhone / iPad (Safari)
          </button>
        </div>

        {/* Android Steps */}
        {platform === 'android' && (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <span>Open the link in <strong>Google Chrome</strong> on your Android phone.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <span>Tap the <strong>three dots (⋮)</strong> in the top right corner of Chrome.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                4
              </span>
              <span>Tap <strong>Install</strong>. The app icon will appear on your phone home screen!</span>
            </div>
          </div>
        )}

        {/* iOS Steps */}
        {platform === 'ios' && (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <span>Open the link in <strong>Safari</strong> on your iPhone or iPad.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <span className="flex items-center gap-1.5 flex-wrap">
                Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 text-blue-400 inline" /> at the bottom center of the screen.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <span className="flex items-center gap-1.5 flex-wrap">
                Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 text-slate-300 inline" />.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                4
              </span>
              <span>Tap <strong>Add</strong> in the top-right corner. It opens like a native iOS app!</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

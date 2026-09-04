import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { QRCodeSVG } from 'qrcode.react';
import { createSyncPayload } from '../utils/syncHelper';
import { 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Smartphone, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Send
} from 'lucide-react';

export const QrSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentProfile, subjects, paceConfig, activityLogs, exams } = usePlanner();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate the compact payload
  const encodedPayload = createSyncPayload(
    currentProfile,
    subjects,
    paceConfig,
    activityLogs,
    exams
  );

  // Generate full sync URL
  const baseUrl = window.location.origin + window.location.pathname;
  const syncUrl = `${baseUrl}#sync=${encodedPayload}`;

  // Count total solved questions
  let totalSolved = 0;
  subjects.forEach(s => {
    s.units.forEach(u => {
      u.chapters.forEach(c => {
        c.exercises.forEach(e => {
          totalSolved += e.completedQuestions;
        });
      });
    });
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎯 Study Tracker Sync for ${currentProfile.name} (${currentProfile.examYear} Batch):\n${syncUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Scan to Sync with Phone</h3>
              <p className="text-xs text-slate-400">Transfer laptop progress in 3 seconds</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Summary Pill */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white">{currentProfile.name}</span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-indigo-500/20 text-indigo-300">
                {currentProfile.examYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {currentProfile.fieldGoal}
            </p>
          </div>

          <div className="text-right font-mono">
            <span className="text-emerald-400 font-bold text-sm block">{totalSolved}</span>
            <span className="text-[10px] text-slate-500">Solved Qs</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl mx-auto w-fit">
          <QRCodeSVG 
            value={syncUrl} 
            size={210} 
            level="M" 
            includeMargin={false}
          />
          <span className="text-[10px] text-slate-500 font-mono mt-2 font-semibold tracking-wider uppercase">
            Point Phone Camera to Scan
          </span>
        </div>

        {/* 3 Step Instructions */}
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
            <span>Open your phone camera (iPhone or Android).</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
            <span>Point at the QR code above and tap the link that pops up.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
            <span>Tap <strong>"Accept &amp; Sync"</strong> on your phone — done!</span>
          </div>
        </div>

        {/* Action Buttons: Copy Link & WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Sync Link'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 bg-emerald-600/25 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/50 flex items-center justify-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send to Phone</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

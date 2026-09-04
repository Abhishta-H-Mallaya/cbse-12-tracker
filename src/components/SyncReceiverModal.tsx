import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { decodeSyncPayload, applySyncDeltaToSubjects, CompactSyncDelta } from '../utils/syncHelper';
import { 
  Smartphone, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  Calendar,
  Target
} from 'lucide-react';

export const SyncReceiverModal: React.FC = () => {
  const { 
    currentProfile, 
    updateCurrentProfile, 
    subjects, 
    updatePaceConfig,
    exams
  } = usePlanner();

  const [pendingSync, setPendingSync] = useState<CompactSyncDelta | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    const checkHashForSync = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#sync=')) {
        const encodedData = hash.replace('#sync=', '');
        const decoded = decodeSyncPayload(encodedData);
        if (decoded) {
          setPendingSync(decoded);
        }
      }
    };

    checkHashForSync();
    window.addEventListener('hashchange', checkHashForSync);
    return () => window.removeEventListener('hashchange', checkHashForSync);
  }, []);

  if (successToast) {
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-white" />
        <span>Successfully synced with Laptop! All records updated.</span>
      </div>
    );
  }

  if (!pendingSync) return null;

  const handleConfirmSync = () => {
    try {
      // 1. Update profile info
      updateCurrentProfile({
        name: pendingSync.p.name,
        examYear: pendingSync.p.examYear,
        targetExamDate: pendingSync.p.targetExamDate,
        fieldGoal: pendingSync.p.fieldGoal,
        fieldGoals: pendingSync.p.fieldGoals || [pendingSync.p.fieldGoal],
        stream: pendingSync.p.stream,
        selectedSubjects: pendingSync.p.selectedSubjects,
      });

      // 2. Update pace config
      updatePaceConfig(pendingSync.c);

      // 3. Save subjects directly with applied delta
      const updatedSubjects = applySyncDeltaToSubjects(subjects, pendingSync);
      const profileKey = `cbse12_${pendingSync.p.id}_`;
      localStorage.setItem(`${profileKey}subjects`, JSON.stringify(updatedSubjects));
      localStorage.setItem(`${profileKey}config`, JSON.stringify(pendingSync.c));
      localStorage.setItem(`${profileKey}logs`, JSON.stringify(pendingSync.l || []));
      localStorage.setItem(`${profileKey}exams`, JSON.stringify(pendingSync.e || exams));
      localStorage.setItem('cbse12_onboarded', 'true');

      // 4. Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
      setPendingSync(null);

      // 5. Show success and reload state
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        window.location.reload();
      }, 1500);
    } catch (e) {
      console.error('Failed to apply sync:', e);
      alert('Sync failed. Please ensure the full QR link was copied.');
    }
  };

  const handleDismiss = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setPendingSync(null);
  };

  // Count solved exercises in delta
  const solvedCount = Object.values(pendingSync.ex).reduce((acc, curr) => acc + curr.comp, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/60 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-white">Incoming Sync from Laptop</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                QR Detected
              </span>
            </div>
            <p className="text-xs text-slate-400">Sync latest study progress to this phone?</p>
          </div>
        </div>

        {/* Sync Summary Card */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Student:</span>
            <strong className="text-white text-sm">{pendingSync.p.name}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Examination Year:</span>
            <strong className="text-indigo-300 font-mono font-bold">{pendingSync.p.examYear} Batch</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Target Goals:</span>
            <span className="text-white text-right font-medium truncate max-w-[200px]">
              {pendingSync.p.fieldGoal}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-mono">
            <span className="text-slate-400">Questions Solved:</span>
            <strong className="text-emerald-400 font-bold text-sm">{solvedCount} Qs</strong>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Accepting this sync will update your phone's study tracker with the latest ticks and exercises from your laptop.
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleDismiss}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSync}
            className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept &amp; Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};

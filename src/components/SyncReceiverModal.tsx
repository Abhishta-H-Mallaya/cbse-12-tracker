import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  decodeSyncPayload, 
  applySyncDeltaToSubjects, 
  hydrateExamsFromSync, 
  CompactSyncDelta 
} from '../utils/syncHelper';
import { 
  Smartphone, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';

interface SyncReceiverModalProps {
  externalDelta?: CompactSyncDelta | null;
  onClearExternalDelta?: () => void;
}

export const SyncReceiverModal: React.FC<SyncReceiverModalProps> = ({
  externalDelta,
  onClearExternalDelta,
}) => {
  const { 
    currentProfile, 
    updateCurrentProfile, 
    subjects, 
    updatePaceConfig,
    exams
  } = usePlanner();

  const [urlPendingSync, setUrlPendingSync] = useState<CompactSyncDelta | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Check URL hash on mount and hash changes
  useEffect(() => {
    const checkHashForSync = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#sync=')) {
        const encodedData = hash.replace('#sync=', '');
        const decoded = decodeSyncPayload(encodedData);
        if (decoded) {
          setUrlPendingSync(decoded);
        }
      }
    };

    checkHashForSync();
    window.addEventListener('hashchange', checkHashForSync);
    return () => window.removeEventListener('hashchange', checkHashForSync);
  }, []);

  const activeSync = externalDelta || urlPendingSync;

  if (successToast) {
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-white" />
        <span>Study records successfully synced! All chapters updated.</span>
      </div>
    );
  }

  if (!activeSync) return null;

  const handleConfirmSync = () => {
    try {
      // 1. Update profile info
      updateCurrentProfile({
        name: activeSync.p.name,
        examYear: activeSync.p.examYear,
        targetExamDate: activeSync.p.targetExamDate,
        fieldGoal: activeSync.p.fieldGoal,
        fieldGoals: activeSync.p.fieldGoals || (activeSync.p.fieldGoal ? [activeSync.p.fieldGoal] : ['CBSE Class 12 Boards (95%+)']),
        stream: activeSync.p.stream,
        selectedSubjects: activeSync.p.selectedSubjects,
      });

      // 2. Update pace config
      if (activeSync.c) {
        updatePaceConfig(activeSync.c);
      }

      // 3. Save subjects directly with applied delta
      const updatedSubjects = applySyncDeltaToSubjects(subjects, activeSync);
      const updatedExams = hydrateExamsFromSync(activeSync, exams);
      const profileKey = `cbse12_${activeSync.p.id}_`;

      localStorage.setItem(`${profileKey}subjects`, JSON.stringify(updatedSubjects));
      localStorage.setItem(`${profileKey}config`, JSON.stringify(activeSync.c));
      localStorage.setItem(`${profileKey}logs`, JSON.stringify(activeSync.l || []));
      localStorage.setItem(`${profileKey}exams`, JSON.stringify(updatedExams));
      localStorage.setItem('cbse12_onboarded', 'true');

      // 4. Clean up URL & state
      if (window.location.hash.startsWith('#sync=')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      setUrlPendingSync(null);
      if (onClearExternalDelta) onClearExternalDelta();

      // 5. Show success and reload state
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error('Failed to apply sync:', e);
      alert('Sync failed. Please ensure the full QR link or code was provided.');
    }
  };

  const handleDismiss = () => {
    if (window.location.hash.startsWith('#sync=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setUrlPendingSync(null);
    if (onClearExternalDelta) onClearExternalDelta();
  };

  // Count solved exercises in delta
  const solvedCount = activeSync.ex 
    ? Object.values(activeSync.ex).reduce((acc, curr) => acc + curr.comp, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-white">Incoming Study Sync</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                QR Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">Transfer student records to this device?</p>
          </div>
        </div>

        {/* Sync Summary Card */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Student Name:</span>
            <strong className="text-white text-sm">{activeSync.p.name}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Examination Batch:</span>
            <strong className="text-indigo-300 font-mono font-bold">{activeSync.p.examYear} Batch</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Target Goals:</span>
            <span className="text-white text-right font-medium truncate max-w-[210px]">
              {activeSync.p.fieldGoal || (activeSync.p.fieldGoals ? activeSync.p.fieldGoals.join(' • ') : 'CBSE Boards')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-mono">
            <span className="text-slate-400">Questions Solved:</span>
            <strong className="text-emerald-400 font-bold text-sm">{solvedCount} Questions</strong>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Accepting this sync will update this device with the latest questions solved, revision tags, and custom exams from the source device.
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
            className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept &amp; Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};

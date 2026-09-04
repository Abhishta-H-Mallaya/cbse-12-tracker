import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  parseAnySyncInput,
  applySyncDeltaToSubjects, 
  hydrateExamsFromSync, 
  CompactSyncDelta 
} from '../utils/syncHelper';
import { UserProfile } from '../types/planner';
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
    profiles,
    updateCurrentProfile, 
    subjects, 
    paceConfig,
    updatePaceConfig,
    exams,
    setShowOnboardingModal
  } = usePlanner();

  const [urlPendingSync, setUrlPendingSync] = useState<CompactSyncDelta | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Check URL hash and query string on mount and hash changes
  useEffect(() => {
    const checkUrlForSync = () => {
      const fullUrl = window.location.href;
      if (fullUrl.includes('sync=')) {
        const decoded = parseAnySyncInput(fullUrl);
        if (decoded && decoded.p && decoded.p.name) {
          setUrlPendingSync(decoded);
        }
      }
    };

    checkUrlForSync();
    window.addEventListener('hashchange', checkUrlForSync);
    return () => window.removeEventListener('hashchange', checkUrlForSync);
  }, []);

  const activeSync = externalDelta || urlPendingSync;

  if (successToast) {
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-white" />
        <span>Study records successfully synced! Reloading app...</span>
      </div>
    );
  }

  if (!activeSync) return null;

  const handleConfirmSync = () => {
    try {
      // 1. Determine target profile ID
      const targetId = activeSync.p.id || currentProfile.id || `profile-${Date.now()}`;

      const newOrUpdatedProfile: UserProfile = {
        ...currentProfile,
        ...activeSync.p,
        id: targetId,
        fieldGoals: activeSync.p.fieldGoals || (activeSync.p.fieldGoal ? [activeSync.p.fieldGoal] : ['CBSE Class 12 Boards (95%+)']),
      };

      // 2. Update profiles array in localStorage
      let updatedProfilesList = [...profiles];
      const matchIdx = updatedProfilesList.findIndex(p => p.id === targetId || p.name.toLowerCase() === activeSync.p.name.toLowerCase());
      if (matchIdx >= 0) {
        updatedProfilesList[matchIdx] = newOrUpdatedProfile;
      } else {
        updatedProfilesList.push(newOrUpdatedProfile);
      }

      // 3. Hydrate subjects and exams
      const updatedSubjects = applySyncDeltaToSubjects(subjects, activeSync);
      const updatedExams = hydrateExamsFromSync(activeSync, exams);

      // 4. Write directly to localStorage for both targetId AND currentProfile.id
      localStorage.setItem('cbse12_user_profiles_v2', JSON.stringify(updatedProfilesList));
      localStorage.setItem('cbse12_current_profile_id', targetId);

      const keysToSave = new Set([targetId, currentProfile.id]);
      keysToSave.forEach(id => {
        if (!id) return;
        const pKey = `cbse12_${id}_`;
        localStorage.setItem(`${pKey}subjects`, JSON.stringify(updatedSubjects));
        localStorage.setItem(`${pKey}config`, JSON.stringify(activeSync.c || paceConfig));
        localStorage.setItem(`${pKey}logs`, JSON.stringify(activeSync.l || []));
        localStorage.setItem(`${pKey}exams`, JSON.stringify(updatedExams));
      });

      localStorage.setItem('cbse12_onboarded', 'true');

      // 5. Update React state immediately
      setShowOnboardingModal(false);
      updateCurrentProfile(newOrUpdatedProfile);
      if (activeSync.c) updatePaceConfig(activeSync.c);

      // 6. Clean up URL & state
      if (window.location.hash.includes('sync=') || window.location.search.includes('sync=')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      setUrlPendingSync(null);
      if (onClearExternalDelta) onClearExternalDelta();

      // 7. Show success toast and reload
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error('Failed to apply sync:', e);
      alert('Sync failed. Please ensure the full QR link or code was provided.');
    }
  };

  const handleDismiss = () => {
    if (window.location.hash.includes('sync=') || window.location.search.includes('sync=')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setUrlPendingSync(null);
    if (onClearExternalDelta) onClearExternalDelta();
  };

  // Count solved exercises in delta
  const solvedCount = activeSync.ex 
    ? Object.values(activeSync.ex).reduce((acc, curr) => acc + (curr.comp || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
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

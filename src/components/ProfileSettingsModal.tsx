import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  User, 
  Calendar, 
  Target, 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Edit3, 
  Clock, 
  Award,
  Users,
  ShieldCheck,
  ChevronRight,
  QrCode,
  ScanLine
} from 'lucide-react';
import { ExamTarget } from '../types/planner';

export const ProfileSettingsModal: React.FC = () => {
  const { 
    currentProfile, 
    profiles, 
    switchProfile, 
    updateCurrentProfile, 
    deleteProfile, 
    changeExamYear,
    showProfileModal, 
    setShowProfileModal,
    setShowOnboardingModal,
    exams,
    addExam,
    deleteExam,
    toggleExamEnabled,
    setShowQrSyncModal,
    setShowQrScannerModal
  } = usePlanner();

  const [activeTab, setActiveTab] = useState<'details' | 'year_goal' | 'exams' | 'profiles'>('details');
  const [name, setName] = useState(currentProfile.name);
  const [examYear, setExamYear] = useState(currentProfile.examYear);
  const [targetExamDate, setTargetExamDate] = useState(currentProfile.targetExamDate || `${currentProfile.examYear}-02-15`);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentProfile.fieldGoals || (currentProfile.fieldGoal ? currentProfile.fieldGoal.split(' • ') : ['CBSE Class 12 Boards (95%+)'])
  );
  const [fieldGoal, setFieldGoal] = useState(currentProfile.fieldGoal || '');
  const [customGoalInput, setCustomGoalInput] = useState('');
  
  // Custom exam form
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamCategory, setNewExamCategory] = useState<'Board' | 'Competitive' | 'School' | 'Other'>('Competitive');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamGoal, setNewExamGoal] = useState('');

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setName(currentProfile.name);
    setExamYear(currentProfile.examYear);
    setTargetExamDate(currentProfile.targetExamDate || `${currentProfile.examYear}-02-15`);
    setFieldGoal(currentProfile.fieldGoal || '');
    setSelectedGoals(
      currentProfile.fieldGoals || (currentProfile.fieldGoal ? currentProfile.fieldGoal.split(' • ') : ['CBSE Class 12 Boards (95%+)'])
    );
  }, [currentProfile]);

  const toggleGoal = (goal: string) => {
    const nextGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal];
    const finalGoals = nextGoals.length > 0 ? nextGoals : [goal];
    setSelectedGoals(finalGoals);
    const summary = finalGoals.join(' • ');
    setFieldGoal(summary);
    updateCurrentProfile({
      fieldGoals: finalGoals,
      fieldGoal: summary,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoalInput.trim() && !selectedGoals.includes(customGoalInput.trim())) {
      const nextGoals = [...selectedGoals, customGoalInput.trim()];
      setSelectedGoals(nextGoals);
      const summary = nextGoals.join(' • ');
      setFieldGoal(summary);
      updateCurrentProfile({
        fieldGoals: nextGoals,
        fieldGoal: summary,
      });
      setCustomGoalInput('');
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  if (!showProfileModal) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({
      name: name.trim(),
      fieldGoal: fieldGoal.trim(),
      fieldGoals: selectedGoals,
      targetExamDate,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleYearChange = (year: string) => {
    setExamYear(year);
    changeExamYear(year);
    setTargetExamDate(`${year}-02-15`);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCreateCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) return;
    addExam({
      name: newExamName.trim(),
      category: newExamCategory,
      examDate: newExamDate,
      targetScoreOrRank: newExamGoal.trim(),
      registered: false,
      enabled: true,
      notes: 'Added from profile settings',
    });
    setNewExamName('');
    setNewExamGoal('');
    setShowAddExam(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">{currentProfile.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentProfile.examYear} Batch
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs">{currentProfile.fieldGoal}</p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 pt-2 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-t-xl transition ${
              activeTab === 'details'
                ? 'bg-slate-900 text-indigo-300 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile &amp; Name
          </button>
          <button
            onClick={() => setActiveTab('year_goal')}
            className={`px-3.5 py-2 rounded-t-xl transition ${
              activeTab === 'year_goal'
                ? 'bg-slate-900 text-indigo-300 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exam Year &amp; Goal
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 rounded-t-xl transition ${
              activeTab === 'exams'
                ? 'bg-slate-900 text-indigo-300 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tracked Exams ({exams.filter(e => e.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2 rounded-t-xl transition ${
              activeTab === 'profiles'
                ? 'bg-slate-900 text-indigo-300 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Students ({profiles.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {savedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* TAB 1: Profile Details */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Field / End Goal
                </label>
                <input
                  type="text"
                  value={fieldGoal}
                  onChange={(e) => setFieldGoal(e.target.value)}
                  placeholder="e.g. Engineering (JEE Main / Adv), Medical (NEET), 95%+ in Boards"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Main Target Exam Date
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Examination Year & Goal */}
          {activeTab === 'year_goal' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1.5">
                  Change Year of Examination
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Changing the exam year recalculates all default exam countdown dates (Theory boards, Practicals, Pre-Boards, JEE/NEET).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['2025', '2026', '2027', '2028'].map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(y)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition ${
                        examYear === y
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      Class 12 ({y})
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Select Target Goals (Choose Multiple)
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400">
                    {selectedGoals.length} selected
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select all goals that apply to your preparation (e.g. 12th Boards + JEE + NEET):
                </p>

                <div className="space-y-1.5">
                  {[
                    'CBSE Class 12 Board Exams (95%+)',
                    'JEE Main & JEE Advanced',
                    'NEET UG Medical',
                    'CUET UG Central Universities',
                    'BITSAT Entrance',
                    'Pure Sciences (IISER / NISER)'
                  ].map(g => {
                    const isSelected = selectedGoals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGoal(g)}
                        className={`w-full p-2.5 text-left rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-600/25 border-indigo-500 text-white'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{g}</span>
                        <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ml-2 shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'border-slate-600 text-transparent'
                        }`}>
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Goal */}
                <form onSubmit={handleAddCustomGoal} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom goal (e.g. NDA, State CET)..."
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Manage Tracked Exams (+ Add New Exam) */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                    Target Exams in Tracker
                  </span>
                  <p className="text-[11px] text-slate-400">Toggle or add exams you are preparing for.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExam(!showAddExam)}
                  className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Exam</span>
                </button>
              </div>

              {/* Add Exam Form */}
              {showAddExam && (
                <form onSubmit={handleCreateCustomExam} className="p-3 bg-slate-950 border border-indigo-500/50 rounded-xl space-y-2.5 animate-fadeIn">
                  <span className="text-xs font-bold text-white block">Add New Exam</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Exam Name (e.g. State CET, BITSAT)"
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="date"
                      required
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={newExamCategory}
                      onChange={(e) => setNewExamCategory(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="Competitive">Competitive (Entrance)</option>
                      <option value="Board">Board Exam</option>
                      <option value="School">School Exam</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Target Score (e.g. 99%ile, 95%+)"
                      value={newExamGoal}
                      onChange={(e) => setNewExamGoal(e.target.value)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddExam(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                    >
                      Save Exam
                    </button>
                  </div>
                </form>
              )}

              {/* Exams list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {exams.map(exam => (
                  <div
                    key={exam.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      exam.enabled
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div 
                      onClick={() => toggleExamEnabled(exam.id)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1"
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        exam.enabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-transparent'
                      }`}>
                        ✓
                      </span>
                      <div>
                        <span className={`font-semibold block ${exam.enabled ? 'text-white' : 'text-slate-400 line-through'}`}>
                          {exam.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {exam.examDate} • {exam.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {exam.targetScoreOrRank && (
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                          {exam.targetScoreOrRank}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteExam(exam.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Switch / Create Student Profiles */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                    Student Profiles (Isolated Databases)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Switch between students or add another profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowOnboardingModal(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Student</span>
                </button>
              </div>

              <div className="space-y-2">
                {profiles.map(p => {
                  const isCurrent = p.id === currentProfile.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!isCurrent) switchProfile(p.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{p.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-300">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {p.examYear} Batch • {p.fieldGoal || 'Class 12'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProfile(p.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Delete Student Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!isCurrent && <ChevronRight className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cross-Device Transfer Banner */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cross-Device Transfer</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Transfer student to another phone or laptop</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false);
                      setShowQrSyncModal(true);
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false);
                      setShowQrScannerModal(true);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Scan QR</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

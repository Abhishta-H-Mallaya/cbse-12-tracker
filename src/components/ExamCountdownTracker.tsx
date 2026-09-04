import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { ExamTarget } from '../types/planner';
import { 
  Timer, 
  Calendar, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ChevronRight,
  Flame,
  X,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';

export const ExamCountdownTracker: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam, toggleExamEnabled } = usePlanner();

  // Real-time ticking state for live countdown (Hours, Minutes, Seconds)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal / Form state for adding/editing exams
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamTarget | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Board' | 'Competitive' | 'School'>('All');

  const [formData, setFormData] = useState<{
    name: string;
    category: 'Board' | 'Competitive' | 'School' | 'Other';
    examDate: string;
    targetScoreOrRank: string;
    registered: boolean;
    notes: string;
  }>({
    name: '',
    category: 'Competitive',
    examDate: '',
    targetScoreOrRank: '',
    registered: false,
    notes: '',
  });

  // Tick every second for precise live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter exams that are enabled
  const enabledExams = exams.filter(e => e.enabled);

  // Find the closest upcoming exam
  const upcomingExams = enabledExams
    .filter(e => new Date(e.examDate).getTime() >= currentTime.getTime() - 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  const primaryExam = upcomingExams[0] || enabledExams[0];

  // Helper for live countdown calculation
  const getCountdownParts = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(9, 0, 0, 0); // standard 9:00 AM exam time
    const diff = targetDate.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPassed: false };
  };

  const primaryCountdown = primaryExam ? getCountdownParts(primaryExam.examDate) : null;

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      name: '',
      category: 'Competitive',
      examDate: '',
      targetScoreOrRank: '',
      registered: false,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (exam: ExamTarget) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      category: exam.category,
      examDate: exam.examDate,
      targetScoreOrRank: exam.targetScoreOrRank || '',
      registered: exam.registered,
      notes: exam.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.examDate) return;

    if (editingExam) {
      updateExam(editingExam.id, {
        name: formData.name.trim(),
        category: formData.category,
        examDate: formData.examDate,
        targetScoreOrRank: formData.targetScoreOrRank.trim(),
        registered: formData.registered,
        notes: formData.notes.trim(),
      });
    } else {
      addExam({
        name: formData.name.trim(),
        category: formData.category,
        examDate: formData.examDate,
        targetScoreOrRank: formData.targetScoreOrRank.trim(),
        registered: formData.registered,
        notes: formData.notes.trim(),
        enabled: true,
      });
    }
    setShowAddModal(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Board':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Competitive':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'School':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const displayedExams = enabledExams.filter(ex => {
    if (selectedCategory !== 'All' && ex.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. HERO LIVE EXAM COUNTDOWN BANNER */}
      {primaryExam && primaryCountdown && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Exam title & Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 flex items-center gap-1.5 animate-pulse">
                  <Timer className="w-3.5 h-3.5" /> Next Major Target
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(primaryExam.category)}`}>
                  {primaryExam.category} Exam
                </span>
                {primaryExam.targetScoreOrRank && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Target: {primaryExam.targetScoreOrRank}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {primaryExam.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Scheduled for: <strong className="text-white font-mono">{primaryExam.examDate}</strong></span>
                {primaryExam.notes && <span className="text-slate-400">• {primaryExam.notes}</span>}
              </p>
            </div>

            {/* Right: Live Ticking Counter Boxes */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Days */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                  {primaryCountdown.days}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Days
                </span>
              </div>

              <span className="text-xl font-mono font-bold text-indigo-400">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-indigo-300">
                  {String(primaryCountdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Hours
                </span>
              </div>

              <span className="text-xl font-mono font-bold text-indigo-400">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-300">
                  {String(primaryCountdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Mins
                </span>
              </div>

              <span className="text-xl font-mono font-bold text-indigo-400">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 animate-pulse">
                  {String(primaryCountdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADDITIONAL EXAMS TRACKER CAROUSEL / ROW */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Target Exams Timeline &amp; Additional Trackers ({displayedExams.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
              {(['All', 'Board', 'Competitive', 'School'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    selectedCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Manage / Toggle Visibility */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1"
              title="Toggle which exams to show or hide"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visibility</span>
            </button>

            {/* Add Custom Exam Button */}
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam</span>
            </button>
          </div>
        </div>

        {/* Visibility Filter Drawer (Toggle specific exams) */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 animate-fadeIn">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Exams You Are Appearing For:
            </span>
            <div className="flex flex-wrap gap-2">
              {exams.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => toggleExamEnabled(ex.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
                    ex.enabled
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  <span>{ex.name}</span>
                  <span>{ex.enabled ? '✓' : '✕'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exams Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedExams.map((exam) => {
            const countdown = getCountdownParts(exam.examDate);

            return (
              <div
                key={exam.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 relative group"
              >
                {/* Top: Category & Action icons */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryColor(exam.category)}`}>
                    {exam.category}
                  </span>
                  
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Edit Exam"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${exam.name}?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exam Title */}
                <div>
                  <h4 className="font-bold text-white text-sm leading-snug group-hover:text-indigo-300 transition">
                    {exam.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {exam.examDate}
                  </p>
                </div>

                {/* Countdown Badge & Target */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining</span>
                    <span className={`text-base font-mono font-extrabold ${
                      countdown.days <= 30 ? 'text-rose-400' : countdown.days <= 90 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {countdown.days} Days
                    </span>
                  </div>

                  {exam.targetScoreOrRank && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Goal</span>
                      <span className="text-xs font-semibold text-indigo-300">
                        {exam.targetScoreOrRank}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADD / EDIT EXAM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingExam ? 'Edit Exam Target' : 'Add New Exam Target'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Exam Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BITSAT 2027, State CET, Chemistry Pre-Board"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="Board">Board Exam</option>
                    <option value="Competitive">Competitive (JEE/NEET/CUET)</option>
                    <option value="School">School Exam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Target Score / Percentile / Rank
                </label>
                <input
                  type="text"
                  placeholder="e.g. 95%+, 99.5 %ile, 680/720, Top 500"
                  value={formData.targetScoreOrRank}
                  onChange={(e) => setFormData({ ...formData, targetScoreOrRank: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Personal Notes / Focus Topics
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Focus on Optics & Calculus revision; Complete 15 sample papers..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

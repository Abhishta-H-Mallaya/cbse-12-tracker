import React from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  getCorePillars, 
  getSubjectStats, 
  getStrategicAlerts, 
  getRecentActivity, 
  formatCount 
} from '../utils/calculations';
import { 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  RotateCcw, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Clock, 
  ArrowRight, 
  Layers, 
  Zap, 
  ToggleLeft,
  ToggleRight,
  Calculator,
  FlaskConical,
  Dna,
  Feather,
  Sparkles,
  QrCode,
  ScanLine
} from 'lucide-react';
import { SubjectId } from '../types/planner';
import { ExamCountdownTracker } from './ExamCountdownTracker';

export const Dashboard: React.FC = () => {
  const { 
    subjects, 
    paceConfig, 
    updatePaceConfig, 
    activityLogs, 
    setActiveTab,
    currentProfile,
    setShowQrSyncModal,
    setShowQrScannerModal
  } = usePlanner();

  // 1. Four Core Pillars (Rule 8)
  const pillars = getCorePillars(subjects, paceConfig);

  // 2. Global Aggregations (Rule 9)
  let totalTextbookQuestions: number | null = null;
  let totalSolvedQuestions = 0;
  let totalDifficultQuestions = 0;
  let totalReworkQuestions = 0;
  let totalPYQsSolved = 0;

  subjects.forEach(s => {
    const stats = getSubjectStats(s);
    if (stats.totalQuestions !== null) {
      totalTextbookQuestions = (totalTextbookQuestions ?? 0) + stats.totalQuestions;
    }
    totalSolvedQuestions += stats.completedQuestions;
    totalDifficultQuestions += stats.difficultQuestionsCount;
    totalReworkQuestions += stats.reworkQuestionsCount;
    totalPYQsSolved += stats.pyqsCompleted;
  });

  const totalRemainingQuestions = totalTextbookQuestions !== null 
    ? Math.max(0, totalTextbookQuestions - totalSolvedQuestions) 
    : null;

  // 3. Activity (Today & This Week)
  const { todaySolved, thisWeekSolved } = getRecentActivity(activityLogs);

  // 4. Strategic Alerts
  const { chapterMostRemaining, chapterLowestPractice, totalPendingExercises, totalPendingExamples } = getStrategicAlerts(subjects);

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'mathematics': return <Calculator className="w-5 h-5 text-indigo-400" />;
      case 'physics': return <Zap className="w-5 h-5 text-blue-400" />;
      case 'chemistry': return <FlaskConical className="w-5 h-5 text-teal-400" />;
      case 'biology': return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'english_prose': return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'english_poetry': return <Feather className="w-5 h-5 text-purple-400" />;
      case 'english_vistas': return <Sparkles className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* EXAM COUNTDOWN & ADDITIONAL EXAMS TRACKER (Placed on top of dashboard) */}
      <ExamCountdownTracker />

      {/* QUICK CROSS-DEVICE SYNC BANNER */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-indigo-950/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-white">Cross-Device Progress Sync</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phone ↔ Laptop
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Transfer {currentProfile.name}'s study records between phone and laptop instantly via QR or link.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowQrSyncModal(true)}
            className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition"
            title="Display QR code to scan with phone"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR Code</span>
          </button>

          <button
            onClick={() => setShowQrScannerModal(true)}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition"
            title="Scan QR with camera or upload image"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan QR / Image</span>
          </button>
        </div>
      </div>

      {/* 4 CORE PILLARS BANNER (Rule 8: Multi-level completion calculation) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Four Core Preparation Pillars</h2>
            <p className="text-xs text-slate-400">
              Rule 8: Independent metrics prevent skewed progress — syllabus coverage, textbook mastery, practice volume, and revisions are tracked separately.
            </p>
          </div>

          {/* Optional Weighted Progress Toggle */}
          <button
            onClick={() => updatePaceConfig({ enableWeightedOverallProgress: !paceConfig.enableWeightedOverallProgress })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
              paceConfig.enableWeightedOverallProgress
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {paceConfig.enableWeightedOverallProgress ? <ToggleRight className="w-4 h-4 text-indigo-400" /> : <ToggleLeft className="w-4 h-4" />}
            <span>Weighted Aggregate Mode</span>
          </button>
        </div>

        {/* Optional Weighted Overall Progress Card */}
        {paceConfig.enableWeightedOverallProgress && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 flex items-center justify-between animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Composite Board Preparation Index
              </span>
              <p className="text-xs text-slate-400">
                Formula: (Syllabus × 25%) + (Textbook × 30%) + (Practice × 35%) + (Revision × 10%)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-extrabold font-mono text-white">
                {pillars.weightedOverallProgress}%
              </span>
              <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillars.weightedOverallProgress || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* The 4 Independent Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Syllabus Completion */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Syllabus Theory
              </span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-white">{pillars.syllabusPercent}%</span>
                <span className="text-xs text-slate-400 font-mono">
                  ({pillars.coveredChapters}/{pillars.totalChapters} chapters)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillars.syllabusPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Lectures &amp; chapter reading covered</span>
          </div>

          {/* 2. Textbook Completion */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Textbook Completion
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-indigo-300">{pillars.textbookPercent}%</span>
                <span className="text-xs text-slate-400 font-mono">
                  ({pillars.completedExercises}/{pillars.totalExercises} exercises)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillars.textbookPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400">NCERT exercises solved 100%</span>
          </div>

          {/* 3. Question Practice */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Question Practice
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">{pillars.questionPracticePercent}%</span>
                <span className="text-xs text-slate-400 font-mono">
                  ({pillars.practiceCompleted}/{pillars.practiceTotal} Qs)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillars.questionPracticePercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Across all 7 preparation sources</span>
          </div>

          {/* 4. Revision Completion */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Revision Progress
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <RotateCcw className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-amber-400">{pillars.revisionPercent}%</span>
                <span className="text-xs text-slate-400 font-mono">
                  ({pillars.revisedChapters}/{pillars.totalChapters} chapters)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillars.revisionPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Chapters with at least 1 revision</span>
          </div>
        </div>
      </div>

      {/* STRATEGIC ALERTS & INSIGHTS (Rule 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Most Remaining Questions */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Most Questions Left</span>
          </div>
          {chapterMostRemaining ? (
            <div>
              <h4 className="text-sm font-bold text-white truncate">{chapterMostRemaining.chapter.name}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                <strong className="text-rose-400 font-bold">{chapterMostRemaining.remaining}</strong> questions remaining
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">All questions solved or not entered</p>
          )}
          {chapterMostRemaining && (
            <button
              onClick={() => setActiveTab(chapterMostRemaining.chapter.subjectId)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-1"
            >
              Open Chapter Tracker <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Lowest Practice % */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Lowest Practice %</span>
          </div>
          {chapterLowestPractice ? (
            <div>
              <h4 className="text-sm font-bold text-white truncate">{chapterLowestPractice.chapter.name}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Practice completion: <strong className="text-amber-400 font-bold">{chapterLowestPractice.percent}%</strong>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No practice data recorded</p>
          )}
          {chapterLowestPractice && (
            <button
              onClick={() => setActiveTab(chapterLowestPractice.chapter.subjectId)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-1"
            >
              Solve Questions <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pending Exercises & Examples */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Pending Workload</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Exercises Pending:</span>
              <strong className="text-indigo-300">{totalPendingExercises}</strong>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Examples Pending:</span>
              <strong className="text-amber-300">{totalPendingExamples}</strong>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Across all textbook chapters</span>
        </div>

        {/* Questions Solved Momentum */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Solving Momentum</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Solved Today:</span>
              <strong className="text-emerald-400">{todaySolved} Qs</strong>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Solved Past 7 Days:</span>
              <strong className="text-indigo-400">{thisWeekSolved} Qs</strong>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('planner')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            Adjust Target Pace <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* QUESTION-BASED DASHBOARD OVERVIEW COUNTERS (Rule 9) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          Overall Question Practice Statistics (Rule 9)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Textbook Qs</span>
            <span className="text-xl font-mono font-bold text-white mt-1 block">
              {formatCount(totalTextbookQuestions)}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Questions Solved</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
              {totalSolvedQuestions.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Questions Remaining</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-1 block">
              {formatCount(totalRemainingQuestions)}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Difficult Questions</span>
            <span className="text-xl font-mono font-bold text-rose-400 mt-1 block flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {totalDifficultQuestions}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Needs Rework</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-1 block flex items-center justify-center gap-1">
              <RotateCcw className="w-4 h-4" /> {totalReworkQuestions}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">PYQs Completed</span>
            <span className="text-xl font-mono font-bold text-indigo-400 mt-1 block">
              {totalPYQsSolved}
            </span>
          </div>
        </div>
      </div>

      {/* SUBJECT-WISE QUESTION COMPLETION CARDS (Rule 9) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Subject-Wise Detailed Progress</span>
          <span className="text-xs text-slate-400 font-normal">Click any subject to open its deep tracker</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const stats = getSubjectStats(subject);

            return (
              <div
                key={subject.id}
                onClick={() => setActiveTab(subject.id)}
                className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition">
                      {getSubjectIcon(subject.id)}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block">{subject.code}</span>
                      <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                        {subject.displayName}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {subject.totalMarks} Marks
                  </span>
                </div>

                {/* Progress Bar & Percentage */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Questions Completed</span>
                    <span className="font-bold text-white">
                      {stats.questionPercent !== null ? `${stats.questionPercent}%` : 'Not entered'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${stats.questionPercent || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
                    <span className="text-emerald-400 font-semibold">{stats.completedQuestions} solved</span>
                    <span>{stats.remainingQuestions !== null ? `${stats.remainingQuestions} left` : 'Total N/A'}</span>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                  <div className="p-1.5 rounded bg-slate-950/40">
                    <span className="text-[10px] text-slate-400 block">Chapters</span>
                    <span className="font-mono font-bold text-white">{stats.coveredChapters}/{stats.totalChapters}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/40">
                    <span className="text-[10px] text-slate-400 block">Exercises</span>
                    <span className="font-mono font-bold text-indigo-300">{stats.completedExercises}/{stats.totalExercises}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/40">
                    <span className="text-[10px] text-slate-400 block">Difficult</span>
                    <span className="font-mono font-bold text-rose-400">{stats.difficultQuestionsCount}</span>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center justify-between pt-1">
                  <span>Open Full Tracker</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

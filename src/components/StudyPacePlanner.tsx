import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { calculateStudyPace, getSubjectStats, getRecentActivity, getStrategicAlerts } from '../utils/calculations';
import { 
  Target, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Clock, 
  Zap, 
  BookOpen, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const StudyPacePlanner: React.FC = () => {
  const { subjects, paceConfig, updatePaceConfig, activityLogs, logActivity, setActiveTab } = usePlanner();

  // Selected subject filter for planning (All subjects or specific subject)
  const [selectedPlanningSubjectId, setSelectedPlanningSubjectId] = useState<string>('all');

  // Input state for logging solved questions today
  const [logCountInput, setLogCountInput] = useState<number>(10);
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // Filter subjects based on selection
  const planningSubjects = selectedPlanningSubjectId === 'all' 
    ? subjects 
    : subjects.filter(s => s.id === selectedPlanningSubjectId);

  // Aggregate totals
  let totalRemainingQuestions = 0;
  let totalRemainingExercises = 0;
  let totalRemainingChapters = 0;
  let totalRemainingExamples = 0;

  planningSubjects.forEach(sub => {
    const stats = getSubjectStats(sub);
    totalRemainingQuestions += (stats.remainingQuestions ?? 0);
    totalRemainingExercises += stats.remainingExercises;
    totalRemainingChapters += (stats.totalChapters - stats.coveredChapters);
    totalRemainingExamples += (stats.remainingExamples ?? 0);
  });

  // Calculate study pace
  const pace = calculateStudyPace(
    totalRemainingQuestions,
    totalRemainingExercises,
    totalRemainingChapters,
    totalRemainingExamples,
    paceConfig.targetDate,
    paceConfig
  );

  // Recent activity
  const { todaySolved, thisWeekSolved } = getRecentActivity(activityLogs);

  // Alerts
  const { chapterMostRemaining } = getStrategicAlerts(planningSubjects);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePaceConfig({ targetDate: e.target.value });
  };

  const handleManualOverride = (field: keyof typeof paceConfig, value: string) => {
    const num = value.trim() === '' ? null : Math.max(1, parseInt(value) || 1);
    updatePaceConfig({ [field]: num });
  };

  const handleLogSolved = (e: React.FormEvent) => {
    e.preventDefault();
    if (logCountInput > 0) {
      logActivity(logCountInput);
      setLogSuccessMsg(`Logged ${logCountInput} questions solved today!`);
      setTimeout(() => setLogSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Rule 10: Dynamic Question Planning
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {pace.diffDays} Days Remaining
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Study Pace &amp; Daily Target Generator
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Calculates exact daily and weekly targets based on your remaining question workload
              and deadline. You can manually override any target.
            </p>
          </div>

          {/* Target Date Picker */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] text-slate-400 block">Target Completion Date:</span>
              <input
                type="date"
                value={paceConfig.targetDate}
                onChange={handleDateChange}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-emerald-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Target Planning Filter: All Subjects or Specific Subject */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Scope:</span>
          <select
            value={selectedPlanningSubjectId}
            onChange={(e) => setSelectedPlanningSubjectId(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Subjects (Combined Workload)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="text-slate-400">
            Remaining Questions: <strong className="text-emerald-400">{totalRemainingQuestions}</strong>
          </span>
          <span className="text-slate-400">
            Pending Exercises: <strong className="text-indigo-400">{totalRemainingExercises}</strong>
          </span>
          <span className="text-slate-400">
            Pending Examples: <strong className="text-amber-400">{totalRemainingExamples}</strong>
          </span>
        </div>
      </div>

      {/* Active Daily Generated Target Headline Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">
              Generated Target for Today
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
              {chapterMostRemaining ? (
                <>
                  {chapterMostRemaining.chapter.unitName.split(':')[0]} —{' '}
                  <span className="text-indigo-300">{chapterMostRemaining.chapter.name}</span> — Complete{' '}
                  <span className="text-emerald-400 underline decoration-emerald-500 underline-offset-4">
                    {pace.dailyQuestions} questions
                  </span>{' '}
                  today.
                </>
              ) : (
                `Complete ${pace.dailyQuestions} questions across pending chapters today.`
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Formula: {totalRemainingQuestions} remaining questions ÷ {pace.diffDays} days left ={' '}
              <strong className="text-slate-200">{Math.ceil(totalRemainingQuestions / pace.diffDays)} questions/day</strong>
              {pace.isManualDailyQuestions && ' (Manually overridden by student)'}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Core Pace Targets (Calculated & Editable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Questions / Day */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions / Day</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={pace.dailyQuestions}
                onChange={(e) => handleManualOverride('manualDailyQuestionTarget', e.target.value)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-lg font-mono font-bold text-emerald-400 text-center"
              />
              <span className="text-xs text-slate-400">q/day</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {pace.isManualDailyQuestions ? 'Manual Override (Active)' : 'Auto-Calculated'}
            </span>
          </div>
        </div>

        {/* 2. Exercises / Week */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exercises / Week</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={pace.weeklyExercises}
                onChange={(e) => handleManualOverride('manualWeeklyExerciseTarget', e.target.value)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-lg font-mono font-bold text-indigo-400 text-center"
              />
              <span className="text-xs text-slate-400">ex/week</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {pace.isManualWeeklyExercises ? 'Manual Override (Active)' : 'Auto-Calculated'}
            </span>
          </div>
        </div>

        {/* 3. Chapters / Week */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chapters / Week</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={pace.weeklyChapters}
                onChange={(e) => handleManualOverride('manualWeeklyChapterTarget', e.target.value)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-lg font-mono font-bold text-blue-400 text-center"
              />
              <span className="text-xs text-slate-400">ch/week</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {pace.isManualWeeklyChapters ? 'Manual Override (Active)' : 'Auto-Calculated'}
            </span>
          </div>
        </div>

        {/* 4. Examples / Day */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examples / Day</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={pace.dailyExamples}
                onChange={(e) => handleManualOverride('manualDailyExampleTarget', e.target.value)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-lg font-mono font-bold text-amber-400 text-center"
              />
              <span className="text-xs text-slate-400">eg/day</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {pace.isManualDailyExamples ? 'Manual Override (Active)' : 'Auto-Calculated'}
            </span>
          </div>
        </div>

        {/* 5. PYQs / Week */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PYQs / Week</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={pace.weeklyPYQs}
                onChange={(e) => handleManualOverride('manualWeeklyPYQTarget', e.target.value)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-lg font-mono font-bold text-rose-400 text-center"
              />
              <span className="text-xs text-slate-400">pyq/week</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {pace.isManualWeeklyPYQs ? 'Manual Override (Active)' : 'Auto-Calculated'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Reset Overrides Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            updatePaceConfig({
              manualDailyQuestionTarget: null,
              manualWeeklyExerciseTarget: null,
              manualWeeklyChapterTarget: null,
              manualDailyExampleTarget: null,
              manualWeeklyPYQTarget: null,
            });
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Manual Overrides to Auto Formulas
        </button>
      </div>

      {/* Daily Progress Activity Logger & Dashboard Sync */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Logging Box */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Log Solved Questions Today</h4>
          </div>
          <p className="text-xs text-slate-400">
            Keep track of questions you solved offline in paper notebooks or coaching sessions today.
            This immediately updates the dashboard solved counter.
          </p>

          <form onSubmit={handleLogSolved} className="flex items-center space-x-3">
            <input
              type="number"
              min="1"
              value={logCountInput}
              onChange={(e) => setLogCountInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-center"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Log Solved Questions
            </button>
          </form>

          {logSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {logSuccessMsg}
            </div>
          )}
        </div>

        {/* Real-time Activity Stats */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-base font-bold text-white mb-1">Solved Momentum</h4>
            <p className="text-xs text-slate-400">
              Your real-time question solving velocity across all tracked days
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Solved Today</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                {todaySolved}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Solved Past 7 Days</span>
              <span className="text-2xl font-mono font-bold text-indigo-400 mt-1 block">
                {thisWeekSolved}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-right">
            Daily Target Progress:{' '}
            <strong className="text-white">
              {pace.dailyQuestions > 0 ? Math.min(100, Math.round((todaySolved / pace.dailyQuestions) * 100)) : 0}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

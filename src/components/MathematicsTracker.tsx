import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, Exercise, QuestionItem, QuestionStatus, DifficultyLevel } from '../types/planner';
import { 
  getChapterTextbookQuestionsTotal, 
  getChapterTextbookQuestionsCompleted, 
  getChapterCompletionPercent, 
  getExerciseCompletionPercent, 
  formatCount 
} from '../utils/calculations';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  RotateCcw, 
  Plus, 
  Settings, 
  Layers, 
  Calendar, 
  BookOpen, 
  Info,
  Edit3,
  Star,
  Clock,
  Sparkles
} from 'lucide-react';
import { ChapterDetailModal } from './ChapterDetailModal';
import { QuestionSourceModal } from './QuestionSourceModal';
import { StructureEditorModal } from './StructureEditorModal';

export const MathematicsTracker: React.FC = () => {
  const { 
    subjects, 
    updateExercise, 
    updateQuestionItem, 
    addQuestionItem, 
    searchQuery, 
    filterOnlyDifficult, 
    filterNeedsRevision 
  } = usePlanner();

  const mathSubject = subjects.find(s => s.id === 'mathematics');

  // Expanded chapter & exercise states
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'math-ch6': true, // Expand Chapter 6: Applications of Derivatives by default as requested in prompt!
    'math-ch1': true, // Expand Chapter 1: Relations & Functions
  });

  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({
    'ex-exercise-6.1': true,
  });

  // Modals state
  const [activeDetailChapter, setActiveDetailChapter] = useState<Chapter | null>(null);
  const [activeSourceChapter, setActiveSourceChapter] = useState<Chapter | null>(null);
  const [activeStructureChapter, setActiveStructureChapter] = useState<Chapter | null>(null);

  if (!mathSubject) return null;

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const toggleExercise = (exId: string) => {
    setExpandedExercises(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const cycleQuestionStatus = (chId: string, exId: string, q: QuestionItem) => {
    const statuses: QuestionStatus[] = ['Not Started', 'Attempted', 'Solved', 'Correct', 'Incorrect'];
    const nextIdx = (statuses.indexOf(q.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    
    updateQuestionItem('mathematics', chId, exId, q.id, {
      status: nextStatus,
      attemptCount: nextStatus !== 'Not Started' ? Math.max(1, q.attemptCount + 1) : q.attemptCount,
      dateAttempted: new Date().toISOString().split('T')[0],
    });
  };

  const cycleDifficulty = (chId: string, exId: string, q: QuestionItem) => {
    const diffs: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
    const nextIdx = (diffs.indexOf(q.difficulty) + 1) % diffs.length;
    updateQuestionItem('mathematics', chId, exId, q.id, {
      difficulty: diffs[nextIdx],
    });
  };

  const toggleNeedsRevision = (chId: string, exId: string, q: QuestionItem) => {
    updateQuestionItem('mathematics', chId, exId, q.id, {
      needsRevision: !q.needsRevision,
    });
  };

  // Status badge styling helper
  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case 'Solved':
      case 'Correct':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'Attempted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
      case 'Incorrect':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';
    }
  };

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Subject Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Subject Code: 041
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Max Marks: 80
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Class 12 Mathematics — Detailed Exercise &amp; Question Tracker
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Hierarchical tracking: Unit → Chapter → Solved Examples → Exercises → Questions.
              Track solved, remaining, difficult problems and rework requests at every level.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Units</span>
              <span className="text-lg font-bold text-white">{mathSubject.units.length}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Chapters</span>
              <span className="text-lg font-bold text-indigo-300">
                {mathSubject.units.flatMap(u => u.chapters).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Units & Chapters List */}
      <div className="space-y-6">
        {mathSubject.units.map((unit) => {
          // Filter chapters if search query or filters active
          const matchingChapters = unit.chapters.filter(ch => {
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              const matchesName = ch.name.toLowerCase().includes(query);
              const matchesTopics = ch.keyTopics.toLowerCase().includes(query);
              const matchesExercise = ch.exercises.some(e => e.name.toLowerCase().includes(query));
              if (!matchesName && !matchesTopics && !matchesExercise) return false;
            }
            if (filterOnlyDifficult) {
              const hasDifficult = ch.exercises.some(e => e.difficultQuestions > 0 || e.questions.some(q => q.difficulty === 'Hard'));
              if (!hasDifficult) return false;
            }
            if (filterNeedsRevision) {
              const hasRework = ch.exercises.some(e => e.reworkQuestions > 0 || e.questions.some(q => q.needsRevision));
              if (!hasRework) return false;
            }
            return true;
          });

          if (matchingChapters.length === 0 && (searchQuery || filterOnlyDifficult || filterNeedsRevision)) {
            return null;
          }

          return (
            <div key={unit.id} className="space-y-4">
              {/* Unit Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                    {unit.unitNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-200">{unit.name}</h3>
                </div>
                {unit.marks !== null && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                    {unit.marks} Marks
                  </span>
                )}
              </div>

              {/* Chapters in this Unit */}
              <div className="space-y-4">
                {matchingChapters.map((chapter) => {
                  const isExpanded = !!expandedChapters[chapter.id];
                  const totalQuestions = getChapterTextbookQuestionsTotal(chapter);
                  const completedQuestions = getChapterTextbookQuestionsCompleted(chapter);
                  const remainingQuestions = totalQuestions !== null ? Math.max(0, totalQuestions - completedQuestions) : null;
                  const chapterPercent = getChapterCompletionPercent(chapter);

                  // Count difficult & rework
                  const difficultCount = chapter.exercises.reduce((acc, ex) => acc + ex.difficultQuestions, 0);
                  const reworkCount = chapter.exercises.reduce((acc, ex) => acc + ex.reworkQuestions, 0);

                  return (
                    <div 
                      key={chapter.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-lg overflow-hidden"
                    >
                      {/* Chapter Accordion Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40">
                        {/* Title & Hierarchy breadcrumb */}
                        <div className="flex items-start space-x-3 cursor-pointer select-none flex-1" onClick={() => toggleChapter(chapter.id)}>
                          <button className="mt-1 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">Chapter {chapter.chapterNumber}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-400">{chapter.unitName.split(':')[0]}</span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${getDifficultyBadge(chapter.difficulty)}`}>
                                {chapter.difficulty}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                Priority: {chapter.priority}
                              </span>
                              {chapter.syllabusCovered && (
                                <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Syllabus Covered
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-bold text-white hover:text-indigo-300 transition">
                              {chapter.name}
                            </h4>
                          </div>
                        </div>

                        {/* Chapter Stats Indicators */}
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Questions Progress Pill */}
                          <div className="flex flex-col min-w-[140px]">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-400 font-medium">Questions</span>
                              <span className="font-mono font-bold text-white">
                                {chapterPercent !== null ? `${chapterPercent}%` : 'Not entered'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${chapterPercent || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                              <span className="text-emerald-400 font-semibold">{completedQuestions} solved</span>
                              <span>{remainingQuestions !== null ? `${remainingQuestions} left` : 'Total N/A'}</span>
                            </div>
                          </div>

                          {/* Solved Examples Count */}
                          <div className="px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-center">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Worked Examples</span>
                            <span className="text-xs font-mono font-bold text-indigo-300">
                              {chapter.workedExamplesCompleted} / {formatCount(chapter.workedExamplesCount)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => setActiveDetailChapter(chapter)}
                              title="Edit Chapter Info & Dates"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveSourceChapter(chapter)}
                              title="7-Source Breakdown"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 transition"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveStructureChapter(chapter)}
                              title="Edit Textbook Structure / Counts"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 transition"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Chapter Content */}
                      {isExpanded && (
                        <div className="p-6 space-y-6 bg-slate-950/30">
                          {/* Key Topics & High-Level Insight */}
                          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-slate-300 leading-relaxed">
                              <span className="font-semibold text-white">Syllabus Focus: </span>
                              {chapter.keyTopics}
                            </div>
                          </div>

                          {/* Exercise Breakdown Hierarchy (Rule 11) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                Exercises ({chapter.exercises.length})
                              </h5>
                              <button
                                onClick={() => setActiveStructureChapter(chapter)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add / Edit Exercises
                              </button>
                            </div>

                            {/* Exercises List */}
                            <div className="space-y-3">
                              {chapter.exercises.map((exercise) => {
                                const isExExpanded = !!expandedExercises[exercise.id];
                                const exPercent = getExerciseCompletionPercent(exercise);
                                const exRemaining = exercise.totalQuestions !== null 
                                  ? Math.max(0, exercise.totalQuestions - exercise.completedQuestions) 
                                  : null;

                                return (
                                  <div 
                                    key={exercise.id}
                                    className="rounded-xl bg-slate-850 bg-slate-900 border border-slate-800 hover:border-slate-700 transition overflow-hidden"
                                  >
                                    {/* Exercise Row Header */}
                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70">
                                      <div 
                                        className="flex items-center space-x-3 cursor-pointer select-none flex-1"
                                        onClick={() => toggleExercise(exercise.id)}
                                      >
                                        <button className="p-1 rounded text-slate-400 hover:text-white">
                                          {isExExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-white text-sm">{exercise.name}</span>
                                            {exercise.totalQuestions === null && (
                                              <span className="text-[11px] text-slate-500 italic bg-slate-800 px-2 py-0.2 rounded">
                                                Not entered
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                                            {exercise.completedQuestions} / {formatCount(exercise.totalQuestions)} questions solved
                                            {exRemaining !== null && ` • ${exRemaining} remaining`}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right side exercise badges and counter */}
                                      <div className="flex items-center space-x-3">
                                        {/* Progress bar */}
                                        <div className="w-24 sm:w-32 hidden sm:block">
                                          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                                            <span>Progress</span>
                                            <span className="font-bold text-white">
                                              {exPercent !== null ? `${exPercent}%` : 'N/A'}
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                              className="bg-indigo-500 h-full rounded-full transition-all"
                                              style={{ width: `${exPercent || 0}%` }}
                                            />
                                          </div>
                                        </div>

                                        {/* Difficult & Rework badges */}
                                        {exercise.difficultQuestions > 0 && (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                            <Flame className="w-3 h-3" /> {exercise.difficultQuestions}
                                          </span>
                                        )}
                                        {exercise.reworkQuestions > 0 && (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                            <RotateCcw className="w-3 h-3" /> {exercise.reworkQuestions}
                                          </span>
                                        )}

                                        {/* Quick Solved count incrementer */}
                                        <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateExercise('mathematics', chapter.id, exercise.id, {
                                                completedQuestions: Math.max(0, exercise.completedQuestions - 1),
                                              });
                                            }}
                                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-xs"
                                            title="Decrement completed count"
                                          >
                                            -
                                          </button>
                                          <span className="px-2 font-mono text-xs font-bold text-indigo-300">
                                            {exercise.completedQuestions}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const max = exercise.totalQuestions ?? 999;
                                              updateExercise('mathematics', chapter.id, exercise.id, {
                                                completedQuestions: Math.min(max, exercise.completedQuestions + 1),
                                              });
                                            }}
                                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-xs"
                                            title="Increment completed count"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Granular Question Grid / List (Rule 2) */}
                                    {isExExpanded && (
                                      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Individual Questions Grid ({exercise.questions.length > 0 ? exercise.questions.length : 'Quick Mode'})
                                          </span>
                                          <button
                                            onClick={() => {
                                              const nextNum = `Q${exercise.questions.length + 1}`;
                                              addQuestionItem('mathematics', chapter.id, exercise.id, nextNum);
                                            }}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                          >
                                            <Plus className="w-3.5 h-3.5" /> Add Individual Question
                                          </button>
                                        </div>

                                        {/* If no questions generated yet */}
                                        {exercise.questions.length === 0 ? (
                                          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                                            <p className="text-xs text-slate-400">
                                              Exercise question count is currently tracked via quick counter ({exercise.completedQuestions} / {formatCount(exercise.totalQuestions)}).
                                            </p>
                                            {exercise.totalQuestions !== null && exercise.totalQuestions > 0 && (
                                              <button
                                                onClick={() => {
                                                  // Auto generate questions for this exercise
                                                  for (let i = 1; i <= exercise.totalQuestions!; i++) {
                                                    addQuestionItem('mathematics', chapter.id, exercise.id, `Q${i}`);
                                                  }
                                                }}
                                                className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/40 inline-flex items-center gap-1.5 transition"
                                              >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Generate {exercise.totalQuestions} Question Slots (Q1 to Q{exercise.totalQuestions})
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          /* Grid of Questions */
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                                            {exercise.questions.map((q) => (
                                              <div
                                                key={q.id}
                                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 transition"
                                              >
                                                {/* Top row: Question number & Revision Star */}
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs font-mono font-bold text-white">{q.questionNumber}</span>
                                                  <button
                                                    onClick={() => toggleNeedsRevision(chapter.id, exercise.id, q)}
                                                    className={`p-0.5 rounded transition ${
                                                      q.needsRevision ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                                                    }`}
                                                    title={q.needsRevision ? 'Needs Revision (Active)' : 'Flag for Revision'}
                                                  >
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                  </button>
                                                </div>

                                                {/* Middle: Clickable Status Badge */}
                                                <button
                                                  onClick={() => cycleQuestionStatus(chapter.id, exercise.id, q)}
                                                  className={`w-full py-1 px-1.5 rounded-md text-[11px] font-semibold border text-center transition ${getStatusBadge(q.status)}`}
                                                  title="Click to cycle status: Not Started → Attempted → Solved → Correct → Incorrect"
                                                >
                                                  {q.status}
                                                </button>

                                                {/* Bottom row: Difficulty badge & attempt counter */}
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                                                  <button
                                                    onClick={() => cycleDifficulty(chapter.id, exercise.id, q)}
                                                    className={`px-1.5 py-0.2 rounded border font-mono ${getDifficultyBadge(q.difficulty)}`}
                                                    title="Click to cycle difficulty (Easy / Medium / Hard)"
                                                  >
                                                    {q.difficulty[0]}
                                                  </button>
                                                  <span title={`Attempts: ${q.attemptCount}`}>
                                                    Att: {q.attemptCount}
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Render Modals if Active */}
      {activeDetailChapter && (
        <ChapterDetailModal
          chapter={activeDetailChapter}
          subjectId="mathematics"
          onClose={() => setActiveDetailChapter(null)}
        />
      )}

      {activeSourceChapter && (
        <QuestionSourceModal
          chapter={activeSourceChapter}
          subjectId="mathematics"
          onClose={() => setActiveSourceChapter(null)}
        />
      )}

      {activeStructureChapter && (
        <StructureEditorModal
          chapter={activeStructureChapter}
          subjectId="mathematics"
          onClose={() => setActiveStructureChapter(null)}
        />
      )}
    </div>
  );
};

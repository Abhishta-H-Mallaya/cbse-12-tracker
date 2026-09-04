import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, Exercise, PhysicsDetails } from '../types/planner';
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
  Zap, 
  Flame, 
  RotateCcw, 
  Plus, 
  Settings, 
  Layers, 
  Edit3, 
  BookOpen, 
  Calculator, 
  HelpCircle, 
  GitFork,
  GraduationCap
} from 'lucide-react';
import { ChapterDetailModal } from './ChapterDetailModal';
import { QuestionSourceModal } from './QuestionSourceModal';
import { StructureEditorModal } from './StructureEditorModal';

export const PhysicsTracker: React.FC = () => {
  const { 
    subjects, 
    updateExercise, 
    updatePhysicsDetails, 
    searchQuery, 
    filterOnlyDifficult, 
    filterNeedsRevision 
  } = usePlanner();

  const physicsSubject = subjects.find(s => s.id === 'physics');

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'phys-ch1': true,
    'phys-ch3': true,
  });

  const [activeDetailChapter, setActiveDetailChapter] = useState<Chapter | null>(null);
  const [activeSourceChapter, setActiveSourceChapter] = useState<Chapter | null>(null);
  const [activeStructureChapter, setActiveStructureChapter] = useState<Chapter | null>(null);

  if (!physicsSubject) return null;

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const updatePhysField = (chapter: Chapter, updates: Partial<PhysicsDetails>) => {
    updatePhysicsDetails(chapter.id, updates);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Subject Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Subject Code: 042
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Max Marks: 70 Theory + 30 Practical
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Class 12 Physics — Question &amp; Practice Tracking
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track textbook structure and practice separately. Special tracking for numerical problems,
              conceptual reasoning, derivations, board PYQs, guide problems, and tuition assignments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Units</span>
              <span className="text-lg font-bold text-white">{physicsSubject.units.length}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Chapters</span>
              <span className="text-lg font-bold text-blue-300">
                {physicsSubject.units.flatMap(u => u.chapters).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Units & Chapters List */}
      <div className="space-y-6">
        {physicsSubject.units.map((unit) => {
          const matchingChapters = unit.chapters.filter(ch => {
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              return ch.name.toLowerCase().includes(q) || ch.keyTopics.toLowerCase().includes(q);
            }
            if (filterOnlyDifficult && (ch.physicsDetails?.difficultCount ?? 0) === 0) return false;
            if (filterNeedsRevision && (ch.physicsDetails?.revisionRequiredCount ?? 0) === 0) return false;
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
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40">
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

              {/* Chapters */}
              <div className="space-y-4">
                {matchingChapters.map((chapter) => {
                  const isExpanded = !!expandedChapters[chapter.id];
                  const totalQuestions = getChapterTextbookQuestionsTotal(chapter);
                  const completedQuestions = getChapterTextbookQuestionsCompleted(chapter);
                  const remainingQuestions = totalQuestions !== null ? Math.max(0, totalQuestions - completedQuestions) : null;
                  const chapterPercent = getChapterCompletionPercent(chapter);
                  const details = chapter.physicsDetails;

                  return (
                    <div
                      key={chapter.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-lg overflow-hidden"
                    >
                      {/* Chapter Accordion Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40">
                        <div 
                          className="flex items-start space-x-3 cursor-pointer select-none flex-1"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <button className="mt-1 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-400" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">Chapter {chapter.chapterNumber}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-400">{chapter.unitName.split(':')[0]}</span>
                              <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                Priority: {chapter.priority}
                              </span>
                              {chapter.syllabusCovered && (
                                <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Syllabus Covered
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-bold text-white hover:text-blue-300 transition">
                              {chapter.name}
                            </h4>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex flex-col min-w-[140px]">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-400 font-medium">Textbook Qs</span>
                              <span className="font-mono font-bold text-white">
                                {chapterPercent !== null ? `${chapterPercent}%` : 'Not entered'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${chapterPercent || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                              <span className="text-emerald-400 font-semibold">{completedQuestions} solved</span>
                              <span>{remainingQuestions !== null ? `${remainingQuestions} left` : 'Total N/A'}</span>
                            </div>
                          </div>

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

                      {/* Expanded Physics Content */}
                      {isExpanded && (
                        <div className="p-6 space-y-6 bg-slate-950/30">
                          {/* Part 1: Physics Question Classification Tracking */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Numericals */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Calculator className="w-3.5 h-3.5 text-blue-400" /> Numericals
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1 font-mono text-sm">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.numericalQuestions.completed ?? 0}
                                    onChange={(e) => updatePhysField(chapter, {
                                      numericalQuestions: {
                                        total: details?.numericalQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.numericalQuestions.total !== null && details?.numericalQuestions.total !== undefined ? details.numericalQuestions.total : ''}
                                    onChange={(e) => updatePhysField(chapter, {
                                      numericalQuestions: {
                                        completed: details?.numericalQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Conceptual Questions */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Conceptual
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1 font-mono text-sm">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.conceptualQuestions.completed ?? 0}
                                    onChange={(e) => updatePhysField(chapter, {
                                      conceptualQuestions: {
                                        total: details?.conceptualQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.conceptualQuestions.total !== null && details?.conceptualQuestions.total !== undefined ? details.conceptualQuestions.total : ''}
                                    onChange={(e) => updatePhysField(chapter, {
                                      conceptualQuestions: {
                                        completed: details?.conceptualQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Derivation-based Questions */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <GitFork className="w-3.5 h-3.5 text-purple-400" /> Derivations
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1 font-mono text-sm">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.derivationQuestions.completed ?? 0}
                                    onChange={(e) => updatePhysField(chapter, {
                                      derivationQuestions: {
                                        total: details?.derivationQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.derivationQuestions.total !== null && details?.derivationQuestions.total !== undefined ? details.derivationQuestions.total : ''}
                                    onChange={(e) => updatePhysField(chapter, {
                                      derivationQuestions: {
                                        completed: details?.derivationQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-14 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Part 2: Practice Sources Tracking (PYQs, Guide, Tuition, Difficult, Rework) */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                            {/* PYQs Completed */}
                            <div className="text-center">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                                PYQs Solved
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.pyqsCompleted ?? 0}
                                onChange={(e) => updatePhysField(chapter, { pyqsCompleted: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center font-mono text-sm text-emerald-400 font-bold"
                              />
                            </div>

                            {/* Guide Questions */}
                            <div className="text-center">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                                Guide Solved
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.guideCompleted ?? 0}
                                onChange={(e) => updatePhysField(chapter, { guideCompleted: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center font-mono text-sm text-blue-400 font-bold"
                              />
                            </div>

                            {/* Tuition Questions */}
                            <div className="text-center">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                                Tuition Solved
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.tuitionCompleted ?? 0}
                                onChange={(e) => updatePhysField(chapter, { tuitionCompleted: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center font-mono text-sm text-indigo-400 font-bold"
                              />
                            </div>

                            {/* Difficult Marked */}
                            <div className="text-center">
                              <span className="text-[11px] text-rose-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
                                <Flame className="w-3 h-3" /> Difficult
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.difficultCount ?? 0}
                                onChange={(e) => updatePhysField(chapter, { difficultCount: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-rose-950/40 border border-rose-800/60 rounded text-center font-mono text-sm text-rose-300 font-bold"
                              />
                            </div>

                            {/* Revision Required */}
                            <div className="text-center">
                              <span className="text-[11px] text-amber-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Needs Rework
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.revisionRequiredCount ?? 0}
                                onChange={(e) => updatePhysField(chapter, { revisionRequiredCount: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-amber-950/40 border border-amber-800/60 rounded text-center font-mono text-sm text-amber-300 font-bold"
                              />
                            </div>
                          </div>

                          {/* Part 3: Chapter Sections / Exercises List (Rule 3) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                Textbook Sections &amp; Exercises ({chapter.exercises.length})
                              </h5>
                              <button
                                onClick={() => setActiveStructureChapter(chapter)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add / Edit Sections
                              </button>
                            </div>

                            <div className="space-y-2">
                              {chapter.exercises.map((exercise) => {
                                const exPercent = getExerciseCompletionPercent(exercise);
                                const exRemaining = exercise.totalQuestions !== null 
                                  ? Math.max(0, exercise.totalQuestions - exercise.completedQuestions) 
                                  : null;

                                return (
                                  <div
                                    key={exercise.id}
                                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                  >
                                    <div>
                                      <span className="font-semibold text-white text-sm">{exercise.name}</span>
                                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                                        {exercise.completedQuestions} / {formatCount(exercise.totalQuestions)} questions solved
                                        {exRemaining !== null && ` • ${exRemaining} remaining`}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                      <div className="w-28">
                                        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                                          <span>{exPercent !== null ? `${exPercent}%` : 'N/A'}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-blue-500 h-full rounded-full transition-all"
                                            style={{ width: `${exPercent || 0}%` }}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                                        <button
                                          onClick={() => updateExercise('physics', chapter.id, exercise.id, {
                                            completedQuestions: Math.max(0, exercise.completedQuestions - 1),
                                          })}
                                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="px-2 font-mono text-xs font-bold text-blue-300">
                                          {exercise.completedQuestions}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const max = exercise.totalQuestions ?? 999;
                                            updateExercise('physics', chapter.id, exercise.id, {
                                              completedQuestions: Math.min(max, exercise.completedQuestions + 1),
                                            });
                                          }}
                                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
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

      {activeDetailChapter && (
        <ChapterDetailModal
          chapter={activeDetailChapter}
          subjectId="physics"
          onClose={() => setActiveDetailChapter(null)}
        />
      )}

      {activeSourceChapter && (
        <QuestionSourceModal
          chapter={activeSourceChapter}
          subjectId="physics"
          onClose={() => setActiveSourceChapter(null)}
        />
      )}

      {activeStructureChapter && (
        <StructureEditorModal
          chapter={activeStructureChapter}
          subjectId="physics"
          onClose={() => setActiveStructureChapter(null)}
        />
      )}
    </div>
  );
};

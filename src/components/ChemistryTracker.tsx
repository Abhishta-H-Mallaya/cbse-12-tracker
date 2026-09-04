import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, ChemistryDetails, ChemistryCategory } from '../types/planner';
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
  FlaskConical, 
  Flame, 
  RotateCcw, 
  Plus, 
  Settings, 
  Layers, 
  Edit3, 
  BookOpen, 
  Calculator, 
  Atom, 
  Beaker, 
  BrainCircuit,
  Tag
} from 'lucide-react';
import { ChapterDetailModal } from './ChapterDetailModal';
import { QuestionSourceModal } from './QuestionSourceModal';
import { StructureEditorModal } from './StructureEditorModal';

export const ChemistryTracker: React.FC = () => {
  const { 
    subjects, 
    updateExercise, 
    updateChemistryDetails, 
    searchQuery, 
    filterOnlyDifficult, 
    filterNeedsRevision 
  } = usePlanner();

  const chemSubject = subjects.find(s => s.id === 'chemistry');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ChemistryCategory>('All');

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'chem-ch1': true, // Solutions
    'chem-ch6': true, // Haloalkanes & Haloarenes
  });

  const [activeDetailChapter, setActiveDetailChapter] = useState<Chapter | null>(null);
  const [activeSourceChapter, setActiveSourceChapter] = useState<Chapter | null>(null);
  const [activeStructureChapter, setActiveStructureChapter] = useState<Chapter | null>(null);

  if (!chemSubject) return null;

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const updateChemField = (chapter: Chapter, updates: Partial<ChemistryDetails>) => {
    updateChemistryDetails(chapter.id, updates);
  };

  const getCategoryBadge = (cat?: ChemistryCategory) => {
    switch (cat) {
      case 'Physical':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Inorganic':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Organic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Subject Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-900 border border-teal-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Subject Code: 043
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Max Marks: 70 Theory + 30 Practical
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Class 12 Chemistry — Chapter Content &amp; Question Tracking
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track Physical, Inorganic &amp; Organic Chemistry with specialized indicators for
              reaction-based problems, numerical problems, theory concepts, and memorisation items.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {(['All', 'Physical', 'Inorganic', 'Organic'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Units & Chapters List */}
      <div className="space-y-6">
        {chemSubject.units.map((unit) => {
          const matchingChapters = unit.chapters.filter(ch => {
            if (selectedCategory !== 'All' && ch.chemistryDetails?.category !== selectedCategory) {
              return false;
            }
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              return ch.name.toLowerCase().includes(q) || ch.keyTopics.toLowerCase().includes(q);
            }
            if (filterOnlyDifficult && (ch.chemistryDetails?.difficultCount ?? 0) === 0) return false;
            if (filterNeedsRevision && (ch.chemistryDetails?.revisionRequiredCount ?? 0) === 0) return false;
            return true;
          });

          if (matchingChapters.length === 0) return null;

          return (
            <div key={unit.id} className="space-y-4">
              {/* Unit Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-teal-600/30 text-teal-300 border border-teal-500/40">
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
                  const details = chapter.chemistryDetails;

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
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-teal-400" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">Chapter {chapter.chapterNumber}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${getCategoryBadge(details?.category)}`}>
                                {details?.category} Chemistry
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
                            <h4 className="text-lg font-bold text-white hover:text-teal-300 transition">
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
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
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
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 transition"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Chemistry Content */}
                      {isExpanded && (
                        <div className="p-6 space-y-6 bg-slate-950/30">
                          {/* Key Topics */}
                          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                            <span className="font-semibold text-white">Syllabus Focus: </span>
                            {chapter.keyTopics}
                          </div>

                          {/* Chemistry Question Categories (Rule 4) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Numerical Problems */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5 text-cyan-400" /> Numericals
                              </span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.numericalProblems.completed ?? 0}
                                    onChange={(e) => updateChemField(chapter, {
                                      numericalProblems: {
                                        total: details?.numericalProblems.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.numericalProblems.total !== null && details?.numericalProblems.total !== undefined ? details.numericalProblems.total : ''}
                                    onChange={(e) => updateChemField(chapter, {
                                      numericalProblems: {
                                        completed: details?.numericalProblems.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reaction-based Questions */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Beaker className="w-3.5 h-3.5 text-purple-400" /> Reactions
                              </span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.reactionBasedQuestions.completed ?? 0}
                                    onChange={(e) => updateChemField(chapter, {
                                      reactionBasedQuestions: {
                                        total: details?.reactionBasedQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.reactionBasedQuestions.total !== null && details?.reactionBasedQuestions.total !== undefined ? details.reactionBasedQuestions.total : ''}
                                    onChange={(e) => updateChemField(chapter, {
                                      reactionBasedQuestions: {
                                        completed: details?.reactionBasedQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Theory / Concept Questions */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Atom className="w-3.5 h-3.5 text-teal-400" /> Theory / Concepts
                              </span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Solved / Total:</span>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.theoryConceptQuestions.completed ?? 0}
                                    onChange={(e) => updateChemField(chapter, {
                                      theoryConceptQuestions: {
                                        total: details?.theoryConceptQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.theoryConceptQuestions.total !== null && details?.theoryConceptQuestions.total !== undefined ? details.theoryConceptQuestions.total : ''}
                                    onChange={(e) => updateChemField(chapter, {
                                      theoryConceptQuestions: {
                                        completed: details?.theoryConceptQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Memorisation Required */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <BrainCircuit className="w-3.5 h-3.5 text-pink-400" /> Memorisation
                              </span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Learned / Total:</span>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={details?.memorisationQuestions.completed ?? 0}
                                    onChange={(e) => updateChemField(chapter, {
                                      memorisationQuestions: {
                                        total: details?.memorisationQuestions.total ?? null,
                                        completed: parseInt(e.target.value) || 0
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                                  />
                                  <span>/</span>
                                  <input
                                    type="number"
                                    placeholder="N/A"
                                    value={details?.memorisationQuestions.total !== null && details?.memorisationQuestions.total !== undefined ? details.memorisationQuestions.total : ''}
                                    onChange={(e) => updateChemField(chapter, {
                                      memorisationQuestions: {
                                        completed: details?.memorisationQuestions.completed ?? 0,
                                        total: e.target.value.trim() ? parseInt(e.target.value) : null
                                      }
                                    })}
                                    className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Difficult & Revision Flags */}
                          <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5" /> Difficult Questions:
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.difficultCount ?? 0}
                                onChange={(e) => updateChemField(chapter, { difficultCount: parseInt(e.target.value) || 0 })}
                                className="w-16 px-2 py-0.5 bg-slate-800 border border-rose-800/60 rounded text-center text-xs font-mono text-rose-300"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                                <RotateCcw className="w-3.5 h-3.5" /> Revision Required:
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={details?.revisionRequiredCount ?? 0}
                                onChange={(e) => updateChemField(chapter, { revisionRequiredCount: parseInt(e.target.value) || 0 })}
                                className="w-16 px-2 py-0.5 bg-slate-800 border border-amber-800/60 rounded text-center text-xs font-mono text-amber-300"
                              />
                            </div>
                          </div>

                          {/* Exercise / Section Breakdown */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                                Exercises &amp; Intext Sections ({chapter.exercises.length})
                              </h5>
                              <button
                                onClick={() => setActiveStructureChapter(chapter)}
                                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
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
                                            className="bg-teal-500 h-full rounded-full transition-all"
                                            style={{ width: `${exPercent || 0}%` }}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                                        <button
                                          onClick={() => updateExercise('chemistry', chapter.id, exercise.id, {
                                            completedQuestions: Math.max(0, exercise.completedQuestions - 1),
                                          })}
                                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="px-2 font-mono text-xs font-bold text-teal-300">
                                          {exercise.completedQuestions}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const max = exercise.totalQuestions ?? 999;
                                            updateExercise('chemistry', chapter.id, exercise.id, {
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
          subjectId="chemistry"
          onClose={() => setActiveDetailChapter(null)}
        />
      )}

      {activeSourceChapter && (
        <QuestionSourceModal
          chapter={activeSourceChapter}
          subjectId="chemistry"
          onClose={() => setActiveSourceChapter(null)}
        />
      )}

      {activeStructureChapter && (
        <StructureEditorModal
          chapter={activeStructureChapter}
          subjectId="chemistry"
          onClose={() => setActiveStructureChapter(null)}
        />
      )}
    </div>
  );
};

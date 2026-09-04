import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, EnglishProseDetails, EnglishPoemDetails, SubjectId, VocabWord } from '../types/planner';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen, 
  Feather, 
  Sparkles, 
  Plus, 
  Trash2, 
  Layers, 
  Edit3, 
  Bookmark, 
  Star, 
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { ChapterDetailModal } from './ChapterDetailModal';
import { QuestionSourceModal } from './QuestionSourceModal';
import { StructureEditorModal } from './StructureEditorModal';

interface Props {
  subjectId: 'english_prose' | 'english_poetry' | 'english_vistas';
}

export const EnglishTracker: React.FC<Props> = ({ subjectId }) => {
  const { 
    subjects, 
    updateChapter, 
    updateEnglishProseDetails, 
    updateEnglishPoemDetails, 
    searchQuery 
  } = usePlanner();

  const currentSubject = subjects.find(s => s.id === subjectId);
  const isPoetry = subjectId === 'english_poetry';

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'eng-fp-ch1': true, // The Last Lesson
    'eng-fpo-ch1': true, // My Mother at Sixty-Six
    'eng-v-ch1': true, // The Third Level
  });

  const [activeDetailChapter, setActiveDetailChapter] = useState<Chapter | null>(null);
  const [activeSourceChapter, setActiveSourceChapter] = useState<Chapter | null>(null);

  // Vocabulary word inline adder state
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  if (!currentSubject) return null;

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const handleAddWord = (chapter: Chapter) => {
    if (!newWord.trim() || !newMeaning.trim()) return;
    const existing = chapter.englishProseDetails?.difficultWords || [];
    const updatedWords: VocabWord[] = [
      ...existing,
      { id: `w-${Date.now()}`, word: newWord.trim(), meaning: newMeaning.trim() }
    ];
    updateEnglishProseDetails(subjectId, chapter.id, { difficultWords: updatedWords });
    setNewWord('');
    setNewMeaning('');
  };

  const handleDeleteWord = (chapter: Chapter, wordId: string) => {
    const existing = chapter.englishProseDetails?.difficultWords || [];
    const updated = existing.filter(w => w.id !== wordId);
    updateEnglishProseDetails(subjectId, chapter.id, { difficultWords: updated });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Subject Header Banner */}
      <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
        isPoetry 
          ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-purple-900/40' 
          : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-amber-900/40'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${
                isPoetry 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {currentSubject.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Core English Literature (301)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentSubject.displayName} — Detailed Literature &amp; Question Tracker
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isPoetry
                ? 'Stanza-by-stanza interpretations, central idea, themes, poetic devices, lines & textbook/PYQ questions.'
                : 'First & second readings, character analysis, themes, vocabulary bank, important quotes & multi-source question practice.'}
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Works</span>
            <span className="text-lg font-bold text-white">
              {currentSubject.units.flatMap(u => u.chapters).length}
            </span>
          </div>
        </div>
      </div>

      {/* Works List */}
      <div className="space-y-4">
        {currentSubject.units.flatMap(u => u.chapters).map((chapter) => {
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matches = chapter.name.toLowerCase().includes(q) || chapter.keyTopics.toLowerCase().includes(q);
            if (!matches) return null;
          }

          const isExpanded = !!expandedChapters[chapter.id];
          const prose = chapter.englishProseDetails;
          const poem = chapter.englishPoemDetails;

          return (
            <div
              key={chapter.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-lg overflow-hidden"
            >
              {/* Header Accordion */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40">
                <div 
                  className="flex items-start space-x-3 cursor-pointer select-none flex-1"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <button className="mt-1 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                    {isExpanded ? (
                      <ChevronDown className={`w-5 h-5 ${isPoetry ? 'text-purple-400' : 'text-amber-400'}`} />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">
                        {isPoetry ? `Poem ${chapter.chapterNumber}` : `Chapter ${chapter.chapterNumber}`}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{chapter.unitName}</span>
                      {chapter.syllabusCovered && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Read &amp; Studied
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-white hover:text-amber-300 transition">
                      {chapter.name}
                    </h4>
                  </div>
                </div>

                {/* Quick Indicators */}
                <div className="flex flex-wrap items-center gap-3">
                  {!isPoetry && prose && (
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className={`px-2 py-1 rounded border ${
                        prose.firstReading ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        1st Read: {prose.firstReading ? '✓' : '✗'}
                      </span>
                      <span className={`px-2 py-1 rounded border ${
                        prose.secondReading ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        2nd Read: {prose.secondReading ? '✓' : '✗'}
                      </span>
                    </div>
                  )}

                  {isPoetry && poem && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                      poem.poemReading ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      Poem Read: {poem.poemReading ? 'Completed' : 'Pending'}
                    </span>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setActiveDetailChapter(chapter)}
                      title="Edit Chapter Details"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveSourceChapter(chapter)}
                      title="Question Sources Breakdown"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 transition"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="p-6 space-y-6 bg-slate-950/30">
                  {/* CASE 1: PROSE CHAPTER (Flamingo Prose & Vistas) */}
                  {!isPoetry && prose && (
                    <div className="space-y-6">
                      {/* Reading Checkpoints & Comprehension */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        {/* 1st Reading Checkbox */}
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prose.firstReading}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, { firstReading: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-800 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white">First Reading</span>
                            <p className="text-[11px] text-slate-400">Complete chapter read-through</p>
                          </div>
                        </label>

                        {/* 2nd Reading Checkbox */}
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prose.secondReading}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, { secondReading: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-800 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white">Second Reading</span>
                            <p className="text-[11px] text-slate-400">In-depth reading with annotations</p>
                          </div>
                        </label>

                        {/* Story Understood Status */}
                        <div>
                          <span className="text-xs font-semibold text-slate-400 block mb-1">Story Comprehension</span>
                          <select
                            value={prose.storyUnderstood}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                              storyUnderstood: e.target.value as any
                            })}
                            className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="Partially">Partially Understood</option>
                            <option value="Fully">Fully Understood</option>
                          </select>
                        </div>
                      </div>

                      {/* Characters, Themes, Important Events, Message */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Characters Studied
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. M. Hamel (patriotic French teacher), Franz (reluctant young student)..."
                            value={prose.charactersStudied}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, { charactersStudied: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Themes &amp; Message
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Linguistic chauvinism, value of native language, procrastination in learning..."
                            value={prose.themesStudied}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, { themesStudied: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Key Events &amp; Important Plot Points
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Franz notices strange crowd at bulletin board, elderly villagers in classroom, last lesson on blackboard..."
                            value={prose.importantEvents}
                            onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, { importantEvents: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Difficult Words & Vocabulary Dictionary Bank */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          Difficult Words &amp; Word Meanings Dictionary ({prose.difficultWords.length})
                        </span>

                        {/* List of Words */}
                        {prose.difficultWords.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {prose.difficultWords.map(w => (
                              <div key={w.id} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-amber-300 text-xs">{w.word}</span>
                                  <p className="text-[11px] text-slate-300">{w.meaning}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteWord(chapter, w.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No vocabulary words logged yet for this chapter.</p>
                        )}

                        {/* Add word form */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Word (e.g. Commotion)"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            className="w-40 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Meaning (e.g. State of confused and noisy disturbance)"
                            value={newMeaning}
                            onChange={(e) => setNewMeaning(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddWord(chapter)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>

                      {/* Question Counts Tracking (Textbook, Tuition, Guide, PYQs) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        {/* Textbook Questions */}
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                            Textbook Questions
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={prose.textbookQuestions.completed}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                textbookQuestions: { ...prose.textbookQuestions, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={prose.textbookQuestions.total ?? ''}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                textbookQuestions: { ...prose.textbookQuestions, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                            />
                          </div>
                        </div>

                        {/* Tuition Questions */}
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                            Tuition Questions
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={prose.tuitionQuestions.completed}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                tuitionQuestions: { ...prose.tuitionQuestions, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={prose.tuitionQuestions.total ?? ''}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                tuitionQuestions: { ...prose.tuitionQuestions, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                            />
                          </div>
                        </div>

                        {/* Guide Questions */}
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                            Guide Questions
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={prose.guideQuestions.completed}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                guideQuestions: { ...prose.guideQuestions, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={prose.guideQuestions.total ?? ''}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                guideQuestions: { ...prose.guideQuestions, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                            />
                          </div>
                        </div>

                        {/* PYQs Completed */}
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                            PYQs Solved
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={prose.pyqs.completed}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                pyqs: { ...prose.pyqs, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={prose.pyqs.total ?? ''}
                              onChange={(e) => updateEnglishProseDetails(subjectId, chapter.id, {
                                pyqs: { ...prose.pyqs, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-indigo-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE 2: POEM (Flamingo Poetry) */}
                  {isPoetry && poem && (
                    <div className="space-y-6">
                      {/* Poem Reading Checkbox */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={poem.poemReading}
                            onChange={(e) => updateEnglishPoemDetails(chapter.id, { poemReading: e.target.checked })}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white">Poem Read &amp; Recited</span>
                            <p className="text-[11px] text-slate-400">Complete reading of poetic lines</p>
                          </div>
                        </label>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">Revisions Done:</span>
                          <input
                            type="number"
                            min="0"
                            value={poem.revisionCount}
                            onChange={(e) => updateEnglishPoemDetails(chapter.id, { revisionCount: parseInt(e.target.value) || 0 })}
                            className="w-14 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-xs font-mono text-purple-300"
                          />
                        </div>
                      </div>

                      {/* Stanza Meanings & Central Idea */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Central Idea &amp; Themes
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Human bonding, fear of loss and separation from aging mother, pain of helplessness..."
                            value={poem.centralIdea}
                            onChange={(e) => updateEnglishPoemDetails(chapter.id, { centralIdea: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Poetic Devices
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Simile (face ashen like that of a corpse, as a late winter's moon); Personification (trees sprinting)..."
                            value={poem.poeticDevices}
                            onChange={(e) => updateEnglishPoemDetails(chapter.id, { poeticDevices: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Stanza Meanings &amp; Own Interpretation
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Stanza 1: Driving to Cochin airport with mother; Stanza 2: Looking outside at young sprinting trees; Stanza 3: Final parting smile..."
                            value={poem.stanzaMeanings}
                            onChange={(e) => updateEnglishPoemDetails(chapter.id, { stanzaMeanings: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      {/* Questions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Textbook Questions Solved
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={poem.textbookQuestions.completed}
                              onChange={(e) => updateEnglishPoemDetails(chapter.id, {
                                textbookQuestions: { ...poem.textbookQuestions, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={poem.textbookQuestions.total ?? ''}
                              onChange={(e) => updateEnglishPoemDetails(chapter.id, {
                                textbookQuestions: { ...poem.textbookQuestions, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-purple-300"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            PYQs Solved
                          </span>
                          <div className="flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="0"
                              value={poem.pyqs.completed}
                              onChange={(e) => updateEnglishPoemDetails(chapter.id, {
                                pyqs: { ...poem.pyqs, completed: parseInt(e.target.value) || 0 }
                              })}
                              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              placeholder="N/A"
                              value={poem.pyqs.total ?? ''}
                              onChange={(e) => updateEnglishPoemDetails(chapter.id, {
                                pyqs: { ...poem.pyqs, total: e.target.value.trim() ? parseInt(e.target.value) : null }
                              })}
                              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-purple-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeDetailChapter && (
        <ChapterDetailModal
          chapter={activeDetailChapter}
          subjectId={subjectId}
          onClose={() => setActiveDetailChapter(null)}
        />
      )}

      {activeSourceChapter && (
        <QuestionSourceModal
          chapter={activeSourceChapter}
          subjectId={subjectId}
          onClose={() => setActiveSourceChapter(null)}
        />
      )}
    </div>
  );
};

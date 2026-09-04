import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, Exercise, SubjectId } from '../types/planner';
import { X, Plus, Trash2, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface Props {
  chapter: Chapter;
  subjectId: SubjectId;
  onClose: () => void;
}

export const StructureEditorModal: React.FC<Props> = ({ chapter, subjectId, onClose }) => {
  const { updateChapter, addExercise, deleteExercise, updateExercise } = usePlanner();

  const [examplesCount, setExamplesCount] = useState(
    chapter.workedExamplesCount !== null ? chapter.workedExamplesCount.toString() : ''
  );

  const [exercisesList, setExercisesList] = useState<
    { id: string; name: string; totalQuestions: string; completedQuestions: number }[]
  >(() =>
    chapter.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      totalQuestions: ex.totalQuestions !== null ? ex.totalQuestions.toString() : '',
      completedQuestions: ex.completedQuestions,
    }))
  );

  const [newExName, setNewExName] = useState('');
  const [newExTotal, setNewExTotal] = useState('');

  const handleAddNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const total = newExTotal.trim() ? Math.max(1, parseInt(newExTotal) || 0) : null;
    addExercise(subjectId, chapter.id, newExName.trim(), total);
    setNewExName('');
    setNewExTotal('');
    // refresh list
    setExercisesList(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: newExName.trim(),
        totalQuestions: total !== null ? total.toString() : '',
        completedQuestions: 0,
      },
    ]);
  };

  const handleExerciseNameChange = (id: string, val: string) => {
    setExercisesList(prev => prev.map(ex => ex.id === id ? { ...ex, name: val } : ex));
  };

  const handleExerciseTotalChange = (id: string, val: string) => {
    setExercisesList(prev => prev.map(ex => ex.id === id ? { ...ex, totalQuestions: val } : ex));
  };

  const handleDeleteExercise = (id: string) => {
    if (window.confirm('Delete this exercise and all its question data?')) {
      deleteExercise(subjectId, chapter.id, id);
      setExercisesList(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const handleSaveAll = () => {
    // 1. Update chapter examples count
    updateChapter(subjectId, chapter.id, {
      workedExamplesCount: examplesCount.trim() ? parseInt(examplesCount) : null,
    });

    // 2. Update existing exercises
    exercisesList.forEach(ex => {
      const parsedTotal = ex.totalQuestions.trim() ? parseInt(ex.totalQuestions) : null;
      updateExercise(subjectId, chapter.id, ex.id, {
        name: ex.name,
        totalQuestions: parsedTotal,
      });
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Textbook Structure Editor
              </span>
              <span className="text-xs text-slate-400">Rule 7: Data-Driven Counts</span>
            </div>
            <h2 className="text-xl font-bold text-white">{chapter.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the exact exercises and question counts from your physical textbook edition. Leave blank for &quot;Not entered&quot;.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Solved Examples Count */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Worked Examples in Chapter
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="Leave blank for 'Not entered'"
                value={examplesCount}
                onChange={(e) => setExamplesCount(e.target.value)}
                className="w-48 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-400">
                {examplesCount.trim() ? `${examplesCount} Solved Examples` : 'Currently: Not entered'}
              </span>
            </div>
          </div>

          {/* Existing Exercises List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Exercises &amp; Question Counts ({exercisesList.length})
              </label>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {exercisesList.map((ex, idx) => (
                <div 
                  key={ex.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/70"
                >
                  <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                  
                  {/* Name Input */}
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                    placeholder="e.g. Exercise 1.1"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Question Count Input */}
                  <div className="w-32">
                    <input
                      type="number"
                      value={ex.totalQuestions}
                      onChange={(e) => handleExerciseTotalChange(ex.id, e.target.value)}
                      placeholder="Not entered"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <span className="text-xs text-slate-400 w-20 text-right">
                    {ex.totalQuestions ? `${ex.totalQuestions} Qs` : 'Not entered'}
                  </span>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition rounded hover:bg-slate-700"
                    title="Delete Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Exercise Inline Form */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Add New Exercise to this Chapter
            </span>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                placeholder="Exercise Name (e.g. Exercise 6.4 / Miscellaneous)"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Question Count"
                value={newExTotal}
                onChange={(e) => setNewExTotal(e.target.value)}
                className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddNewExercise}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center space-x-1 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Save Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

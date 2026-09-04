import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, DifficultyLevel, PriorityLevel, SubjectId } from '../types/planner';
import { 
  getChapterTextbookQuestionsTotal, 
  getChapterTextbookQuestionsCompleted, 
  formatCount 
} from '../utils/calculations';
import { X, ExternalLink, Calendar, CheckCircle2, Bookmark, BarChart3, Layers } from 'lucide-react';

interface Props {
  chapter: Chapter;
  subjectId: SubjectId;
  onClose: () => void;
}

export const ChapterDetailModal: React.FC<Props> = ({ chapter, subjectId, onClose }) => {
  const { updateChapter } = usePlanner();

  const [formData, setFormData] = useState({
    marks: chapter.marks !== null ? chapter.marks.toString() : '',
    pages: chapter.pages !== null ? chapter.pages.toString() : '',
    workedExamplesCount: chapter.workedExamplesCount !== null ? chapter.workedExamplesCount.toString() : '',
    workedExamplesCompleted: chapter.workedExamplesCompleted,
    difficulty: chapter.difficulty,
    priority: chapter.priority,
    plannedCompletionDate: chapter.plannedCompletionDate || '',
    actualCompletionDate: chapter.actualCompletionDate || '',
    personalNotes: chapter.personalNotes || '',
    resourceLink: chapter.resourceLink || '',
    syllabusCovered: chapter.syllabusCovered,
    revisionCount: chapter.revisionCount,
  });

  const totalQuestions = getChapterTextbookQuestionsTotal(chapter);
  const completedQuestions = getChapterTextbookQuestionsCompleted(chapter);
  const remainingQuestions = totalQuestions !== null ? Math.max(0, totalQuestions - completedQuestions) : null;
  const completionPercent = totalQuestions && totalQuestions > 0 
    ? Math.min(100, Math.round((completedQuestions / totalQuestions) * 100))
    : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateChapter(subjectId, chapter.id, {
      marks: formData.marks.trim() ? parseInt(formData.marks) : null,
      pages: formData.pages.trim() ? parseInt(formData.pages) : null,
      workedExamplesCount: formData.workedExamplesCount.trim() ? parseInt(formData.workedExamplesCount) : null,
      workedExamplesCompleted: formData.workedExamplesCompleted,
      difficulty: formData.difficulty as DifficultyLevel,
      priority: formData.priority as PriorityLevel,
      plannedCompletionDate: formData.plannedCompletionDate,
      actualCompletionDate: formData.actualCompletionDate,
      personalNotes: formData.personalNotes,
      resourceLink: formData.resourceLink,
      syllabusCovered: formData.syllabusCovered,
      revisionCount: formData.revisionCount,
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
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {chapter.unitName}
              </span>
              <span className="text-xs text-slate-400">Chapter {chapter.chapterNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{chapter.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Real-time Calculated Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Exercises</span>
              <p className="text-base font-semibold text-slate-200">{chapter.exercises.length}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total Questions</span>
              <p className="text-base font-semibold text-indigo-300">{formatCount(totalQuestions)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Completed / Remaining</span>
              <p className="text-base font-semibold text-emerald-400">
                {completedQuestions} <span className="text-xs text-slate-400">/ {formatCount(remainingQuestions)}</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Question Completion</span>
              <p className="text-base font-bold text-amber-400">
                {completionPercent !== null ? `${completionPercent}%` : 'Not entered'}
              </p>
            </div>
          </div>

          {/* Topics & Marks */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Official Syllabus Key Topics
              </label>
              <p className="text-xs text-slate-300 p-3 bg-slate-950/60 rounded-lg border border-slate-800 leading-relaxed">
                {chapter.keyTopics}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Syllabus Marks (Weightage)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Textbook Pages
                </label>
                <input
                  type="number"
                  placeholder="Leave empty for Not entered"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Worked Examples Count
                </label>
                <input
                  type="number"
                  placeholder="Leave empty for Not entered"
                  value={formData.workedExamplesCount}
                  onChange={(e) => setFormData({ ...formData, workedExamplesCount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Solved Examples Counter */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-sm font-medium text-slate-300">Worked Examples Solved</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workedExamplesCompleted: Math.max(0, formData.workedExamplesCompleted - 1) })}
                  className="w-7 h-7 rounded bg-slate-700 text-white flex items-center justify-center font-bold hover:bg-slate-600"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono font-bold text-indigo-400 bg-slate-900 rounded border border-slate-700">
                  {formData.workedExamplesCompleted}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workedExamplesCompleted: formData.workedExamplesCompleted + 1 })}
                  className="w-7 h-7 rounded bg-slate-700 text-white flex items-center justify-center font-bold hover:bg-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Difficulty, Priority, and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Approx Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Revision Count</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, revisionCount: Math.max(0, formData.revisionCount - 1) })}
                  className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center"
                >
                  -
                </button>
                <span className="flex-1 text-center py-1 font-mono font-bold text-amber-400 bg-slate-800 rounded border border-slate-700">
                  {formData.revisionCount}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, revisionCount: formData.revisionCount + 1 })}
                  className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Planned Completion Date
              </label>
              <input
                type="date"
                value={formData.plannedCompletionDate}
                onChange={(e) => setFormData({ ...formData, plannedCompletionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Actual Completion Date
              </label>
              <input
                type="date"
                value={formData.actualCompletionDate}
                onChange={(e) => setFormData({ ...formData, actualCompletionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Syllabus Covered Checkbox */}
          <label className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.syllabusCovered}
              onChange={(e) => setFormData({ ...formData, syllabusCovered: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-600"
            />
            <div>
              <span className="text-sm font-semibold text-white">Syllabus Theory Completed</span>
              <p className="text-xs text-slate-400">Check when lecture/theory content has been studied once</p>
            </div>
          </label>

          {/* Resource Link */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Resource / Textbook / Drive Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="url"
                placeholder="https://ncert.nic.in/textbook.php..."
                value={formData.resourceLink}
                onChange={(e) => setFormData({ ...formData, resourceLink: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
              {formData.resourceLink && (
                <a
                  href={formData.resourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Personal Notes & Reminders</label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on Maxima-Minima word problems; Review Example 34 before test..."
              value={formData.personalNotes}
              onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
            />
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
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Save Chapter Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

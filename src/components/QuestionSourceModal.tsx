import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Chapter, QuestionSources, SubjectId } from '../types/planner';
import { X, BookOpen, Layers, Award, FileText, CheckCircle2 } from 'lucide-react';
import { formatCount } from '../utils/calculations';

interface Props {
  chapter: Chapter;
  subjectId: SubjectId;
  onClose: () => void;
}

type SourceKey = keyof QuestionSources;

const SOURCE_LABELS: Record<SourceKey, { label: string; description: string }> = {
  textbook: { label: 'Textbook / NCERT', description: 'Main NCERT exercises and miscellaneous problems' },
  examples: { label: 'Worked Examples', description: 'Solved examples directly from the textbook' },
  tuition: { label: 'Tuition Book', description: 'Coaching modules, classroom assignments & DPPs' },
  guide: { label: 'Reference Guide', description: 'RD Sharma, SL Arora, Pradeep, All-in-One, etc.' },
  pyqs: { label: 'Previous Year Questions', description: 'CBSE Board exam questions from the last 10 years' },
  samplePapers: { label: 'Sample Papers', description: 'Official CBSE & publisher sample papers' },
  mockTests: { label: 'Mock Tests', description: 'Full syllabus & chapter-level timed tests' },
};

export const QuestionSourceModal: React.FC<Props> = ({ chapter, subjectId, onClose }) => {
  const { updateQuestionSources } = usePlanner();

  // Local state for editable table
  const [sourcesState, setSourcesState] = useState<QuestionSources>(() => JSON.parse(JSON.stringify(chapter.questionSources)));

  const handleTotalChange = (key: SourceKey, val: string) => {
    const num = val.trim() === '' ? null : Math.max(0, parseInt(val) || 0);
    setSourcesState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        total: num,
      },
    }));
  };

  const handleCompletedChange = (key: SourceKey, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setSourcesState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        completed: num,
      },
    }));
  };

  const handleSave = () => {
    updateQuestionSources(subjectId, chapter.id, sourcesState);
    onClose();
  };

  // Grand Totals across all sources
  let grandTotal: number | null = null;
  let grandCompleted = 0;

  (Object.keys(sourcesState) as SourceKey[]).forEach(k => {
    const s = sourcesState[k];
    if (s.total !== null) {
      grandTotal = (grandTotal ?? 0) + s.total;
    }
    grandCompleted += s.completed;
  });

  const grandRemaining = grandTotal !== null ? Math.max(0, grandTotal - grandCompleted) : null;
  const grandPercent = grandTotal && grandTotal > 0 ? Math.min(100, Math.round((grandCompleted / grandTotal) * 100)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Question Source Breakdown
              </span>
              <span className="text-xs text-slate-400">Rule 6 Tracking</span>
            </div>
            <h2 className="text-xl font-bold text-white">{chapter.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Maintain separate question counts across all your preparation resources
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 space-y-6">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Question Source</th>
                  <th className="py-3 px-3 text-center w-28">Total</th>
                  <th className="py-3 px-3 text-center w-28">Completed</th>
                  <th className="py-3 px-3 text-center w-24">Remaining</th>
                  <th className="py-3 px-3 text-center w-28">% Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {(Object.keys(SOURCE_LABELS) as SourceKey[]).map((key) => {
                  const source = sourcesState[key];
                  const remaining = source.total !== null ? Math.max(0, source.total - source.completed) : null;
                  const percent = source.total && source.total > 0 ? Math.min(100, Math.round((source.completed / source.total) * 100)) : null;

                  return (
                    <tr key={key} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{SOURCE_LABELS[key].label}</div>
                        <div className="text-[11px] text-slate-400">{SOURCE_LABELS[key].description}</div>
                      </td>

                      {/* Total input */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          placeholder="Not entered"
                          value={source.total !== null ? source.total : ''}
                          onChange={(e) => handleTotalChange(key, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center text-sm font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Completed input */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          value={source.completed}
                          onChange={(e) => handleCompletedChange(key, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center text-sm font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>

                      {/* Remaining auto-calculated */}
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {remaining !== null ? remaining : <span className="text-slate-500 text-xs">—</span>}
                      </td>

                      {/* Percentage auto-calculated with mini bar */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-mono font-bold ${
                            percent === 100 ? 'text-emerald-400' : percent && percent > 50 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {percent !== null ? `${percent}%` : 'Not entered'}
                          </span>
                          {percent !== null && (
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Total Summary Row */}
              <tfoot className="bg-slate-800/90 font-bold border-t-2 border-slate-700">
                <tr>
                  <td className="py-3.5 px-4 text-white">Grand Total Across All Sources</td>
                  <td className="py-3.5 px-3 text-center text-indigo-300 font-mono">
                    {grandTotal !== null ? grandTotal : 'Not entered'}
                  </td>
                  <td className="py-3.5 px-3 text-center text-emerald-400 font-mono">
                    {grandCompleted}
                  </td>
                  <td className="py-3.5 px-3 text-center text-amber-400 font-mono">
                    {grandRemaining !== null ? grandRemaining : '—'}
                  </td>
                  <td className="py-3.5 px-3 text-center text-white font-mono">
                    {grandPercent !== null ? `${grandPercent}%` : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-slate-400 italic">
            * All numbers can be freely modified. If total is left empty, it will display as &quot;Not entered&quot; in adherence to data integrity.
          </p>

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
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              Save Source Counts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

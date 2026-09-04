import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { ExamTarget, SubjectId } from '../types/planner';
import { getInitialExamsForYear } from '../data/initialExams';
import { 
  Sparkles, 
  Calendar, 
  Target, 
  User, 
  Plus, 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Trash2,
  Rocket,
  Flame,
  Award
} from 'lucide-react';

export const UserOnboardingModal: React.FC = () => {
  const { showOnboardingModal, setShowOnboardingModal, createUserProfile, profiles } = usePlanner();

  const [name, setName] = useState('');
  const [examYear, setExamYear] = useState('2027');
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');
  const [targetExamDate, setTargetExamDate] = useState('2027-02-15');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'CBSE Class 12 Board Exams (95%+)',
    'Engineering (JEE Main / Adv / BITSAT)'
  ]);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [stream, setStream] = useState<'PCM' | 'PCB' | 'PCMB' | 'Custom'>('PCMB');

  // Exams for selected year
  const [availableExams, setAvailableExams] = useState<ExamTarget[]>(() => getInitialExamsForYear('2027'));
  const [selectedExamIds, setSelectedExamIds] = useState<Set<string>>(
    () => new Set(getInitialExamsForYear('2027').filter(e => e.enabled).map(e => e.id))
  );

  // New custom exam form state
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamCategory, setNewExamCategory] = useState<'Board' | 'Competitive' | 'School' | 'Other'>('Competitive');
  const [newExamDate, setNewExamDate] = useState('2027-04-15');
  const [newExamGoal, setNewExamGoal] = useState('');

  if (!showOnboardingModal) return null;

  // Handle year change
  const handleYearSelect = (year: string) => {
    setIsCustomYear(false);
    setExamYear(year);
    const newDate = `${year}-02-15`;
    setTargetExamDate(newDate);

    // Update available exams for this year
    const newYearExams = getInitialExamsForYear(year);
    setAvailableExams(newYearExams);
    setSelectedExamIds(new Set(newYearExams.filter(e => e.enabled).map(e => e.id)));
  };

  const handleCustomYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customYearInput.trim()) {
      setExamYear(customYearInput.trim());
      setTargetExamDate(`${customYearInput.trim()}-02-15`);
      const newYearExams = getInitialExamsForYear(customYearInput.trim());
      setAvailableExams(newYearExams);
      setSelectedExamIds(new Set(newYearExams.filter(e => e.enabled).map(e => e.id)));
      setIsCustomYear(false);
    }
  };

  const toggleExamSelection = (id: string) => {
    setSelectedExamIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) return;

    const customExam: ExamTarget = {
      id: `custom-exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newExamName.trim(),
      category: newExamCategory,
      examDate: newExamDate,
      targetScoreOrRank: newExamGoal.trim(),
      registered: false,
      enabled: true,
      notes: 'Custom exam target added during setup',
    };

    setAvailableExams(prev => [...prev, customExam]);
    setSelectedExamIds(prev => new Set([...prev, customExam.id]));
    setNewExamName('');
    setNewExamGoal('');
    setShowAddExamForm(false);
  };

  const goalPresets = [
    { label: '🏆 CBSE Class 12 Board Exams (95%+ Overall)', value: 'CBSE Class 12 Board Exams (95%+)' },
    { label: '🚀 Engineering (JEE Main & JEE Advanced)', value: 'JEE Main & JEE Advanced' },
    { label: '🩺 Medical (NEET UG / AIIMS 680+)', value: 'NEET UG Medical' },
    { label: '🏛️ Central Universities (CUET UG 100%ile)', value: 'CUET UG Central Universities' },
    { label: '🎯 BITSAT (Pilani / Goa / Hyderabad)', value: 'BITSAT Entrance' },
    { label: '🔬 Pure Sciences & Research (IISER / NISER)', value: 'Pure Sciences (IISER / NISER)' },
  ];

  const toggleGoal = (goalVal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalVal) ? prev.filter(g => g !== goalVal) : [...prev, goalVal]
    );
  };

  const getSelectedSubjectsForStream = (s: 'PCM' | 'PCB' | 'PCMB' | 'Custom'): SubjectId[] => {
    switch (s) {
      case 'PCM':
        return ['mathematics', 'physics', 'chemistry', 'english_prose', 'english_poetry', 'english_vistas'];
      case 'PCB':
        return ['physics', 'chemistry', 'biology', 'english_prose', 'english_poetry', 'english_vistas'];
      case 'PCMB':
      default:
        return ['mathematics', 'physics', 'chemistry', 'biology', 'english_prose', 'english_poetry', 'english_vistas'];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Class 12 Student';
    
    const combinedGoals = [...selectedGoals];
    if (customGoalInput.trim() && !combinedGoals.includes(customGoalInput.trim())) {
      combinedGoals.push(customGoalInput.trim());
    }
    const finalGoalsList = combinedGoals.length > 0 ? combinedGoals : ['CBSE Class 12 Board Exams (95%+)'];
    const finalGoalSummary = finalGoalsList.join(' • ');

    const finalSubjects = getSelectedSubjectsForStream(stream);

    // Filter exams enabled
    const configuredExams: ExamTarget[] = availableExams.map(ex => ({
      ...ex,
      enabled: selectedExamIds.has(ex.id),
    }));

    createUserProfile(
      {
        name: finalName,
        examYear,
        targetExamDate,
        fieldGoal: finalGoalSummary,
        fieldGoals: finalGoalsList,
        stream,
        selectedSubjects: finalSubjects,
      },
      configuredExams
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 shrink-0 relative">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-2xl">
              🎯
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Welcome to CBSE 12 Tracker
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Setup Student
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Set up your student profile, target exams, and study goals before entering.
              </p>
            </div>
          </div>
          {profiles.length > 0 && (
            <button
              onClick={() => setShowOnboardingModal(false)}
              className="absolute right-5 top-5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 border border-slate-700"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Question 1: Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <User className="w-4 h-4" /> 1. Student / User Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anju, Rohan, Priya..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="text-[11px] text-slate-400">
              Each student gets an isolated offline database for chapters, solved exercises, and notes.
            </p>
          </div>

          {/* Question 2: Year of Examination & Target Exam Date */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> 2. Year of Examination &amp; Target Date
            </label>
            
            <div className="flex flex-wrap gap-2">
              {['2025', '2026', '2027', '2028'].map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    examYear === y && !isCustomYear
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {y} Board Exam
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomYear(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  isCustomYear
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                + Custom Year
              </button>
            </div>

            {isCustomYear && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter Year e.g. 2029"
                  value={customYearInput}
                  onChange={(e) => setCustomYearInput(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleCustomYearSubmit}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                >
                  Set Year
                </button>
              </div>
            )}

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-300">Class 12 Main Exam Date</span>
                <span className="text-[11px] text-slate-500 block">Default is mid-February for {examYear}</span>
              </div>
              <input
                type="date"
                required
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Question 3: Field / Stream & End Goals (Multi-Select) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> 3. Select Goals (Select Multiple)
              </label>
              <span className="text-[11px] font-mono text-indigo-400">
                {selectedGoals.length} selected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              You can choose multiple goals at once (e.g. CBSE 12th Boards + JEE + NEET + CUET).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {goalPresets.map(preset => {
                const isSelected = selectedGoals.includes(preset.value);
                return (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => toggleGoal(preset.value)}
                    className={`p-2.5 text-left rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-indigo-600/25 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ml-2 shrink-0 ${
                      isSelected ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'border-slate-600 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Additional Goal Input */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="➕ Add any other custom goal (e.g. NDA, State CET, BITSAT 350+)..."
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Question 4: Subject Stream Selection */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> 4. Subject Focus
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'PCMB', title: 'PCMB + English', desc: 'All 7 subjects (Maths, Physics, Chem, Bio, English)' },
                { id: 'PCM', title: 'PCM + English', desc: 'Maths, Physics, Chemistry, English' },
                { id: 'PCB', title: 'PCB + English', desc: 'Physics, Chemistry, Biology, English' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setStream(opt.id as any)}
                  className={`p-3 text-left rounded-xl border transition ${
                    stream === opt.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 5: Target Exams Needed in Tracker (+ Option to add new) */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 5. Which Exams Are Needed in Tracker?
                </label>
                <p className="text-[11px] text-slate-400">
                  Select which countdown timers &amp; targets will appear on your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddExamForm(!showAddExamForm)}
                className="px-2.5 py-1 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-500/50 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Exam</span>
              </button>
            </div>

            {/* Inline Add Custom Exam Form */}
            {showAddExamForm && (
              <div className="p-3 bg-slate-950 border border-indigo-500/50 rounded-xl space-y-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-white block">Add New Exam to Tracker</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Exam Name (e.g. BITSAT Session 1, MHT-CET, WBJEE)"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newExamCategory}
                    onChange={(e) => setNewExamCategory(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="Competitive">Competitive (Entrance)</option>
                    <option value="Board">Board Exam</option>
                    <option value="School">School Exam</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Goal / Target Score (e.g. 99%ile, 320/390)"
                    value={newExamGoal}
                    onChange={(e) => setNewExamGoal(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddExamForm(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewExam}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                  >
                    Save &amp; Select Exam
                  </button>
                </div>
              </div>
            )}

            {/* List of Available Exams with Checkboxes */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableExams.map((exam) => {
                const isSelected = selectedExamIds.has(exam.id);
                return (
                  <div
                    key={exam.id}
                    onClick={() => toggleExamSelection(exam.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{exam.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Date: {exam.examDate} • {exam.category}
                        </span>
                      </div>
                    </div>

                    {exam.targetScoreOrRank && (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold hidden sm:inline">
                        {exam.targetScoreOrRank}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Enter Study Tracker</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

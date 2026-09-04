import React, { useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { SubjectId } from '../types/planner';
import { 
  LayoutDashboard, 
  Calculator, 
  Zap, 
  FlaskConical, 
  Dna,
  BookOpen, 
  Feather, 
  Sparkles, 
  Target, 
  Download, 
  Upload, 
  RotateCcw,
  Search,
  AlertTriangle,
  Flame,
  Smartphone,
  User,
  Plus,
  Trash2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    filterOnlyDifficult, 
    setFilterOnlyDifficult,
    filterNeedsRevision,
    setFilterNeedsRevision,
    exportToJson,
    importFromJson,
    resetAllData,
    currentProfile,
    profiles,
    switchProfile,
    deleteProfile,
    isInstallable,
    installApp
  } = usePlanner();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importFromJson(content);
        if (success) {
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { createUserProfile } = usePlanner();
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      createUserProfile({
        name: newProfileName.trim(),
        examYear: '2027',
        targetExamDate: '2027-02-15',
        fieldGoal: 'Class 12 Boards',
        fieldGoals: ['Class 12 Boards'],
        stream: 'PCMB',
        selectedSubjects: ['mathematics', 'physics', 'chemistry', 'biology', 'english_prose', 'english_poetry', 'english_vistas']
      });
      setNewProfileName('');
      setShowProfileMenu(false);
    }
  };

  const navItems: { id: SubjectId | 'dashboard' | 'planner'; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'mathematics', label: 'Mathematics', icon: <Calculator className="w-4 h-4" />, badge: '041' },
    { id: 'physics', label: 'Physics', icon: <Zap className="w-4 h-4" />, badge: '042' },
    { id: 'chemistry', label: 'Chemistry', icon: <FlaskConical className="w-4 h-4" />, badge: '043' },
    { id: 'biology', label: 'Biology', icon: <Dna className="w-4 h-4" />, badge: '044' },
    { id: 'english_prose', label: 'Flamingo Prose', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'english_poetry', label: 'Flamingo Poetry', icon: <Feather className="w-4 h-4" /> },
    { id: 'english_vistas', label: 'Vistas', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'planner', label: 'Pace & Targets', icon: <Target className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                CBSE 12 Question Tracker
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2026-27 Syllabus
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Maths, Physics, Chemistry, Biology &amp; English literature
            </p>
          </div>
        </div>

        {/* Global Search & Quick Filters */}
        <div className="flex items-center flex-1 max-w-md mx-2 space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters, exercises, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterOnlyDifficult(!filterOnlyDifficult)}
            title="Toggle only difficult questions"
            className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
              filterOnlyDifficult 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Difficult</span>
          </button>

          <button
            onClick={() => setFilterNeedsRevision(!filterNeedsRevision)}
            title="Toggle only items needing revision"
            className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
              filterNeedsRevision 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Revision</span>
          </button>
        </div>

        {/* Action Controls: Profile Switcher, Download App, Backup */}
        <div className="flex items-center space-x-2">
          {/* Download App / PWA Install Button */}
          <button
            onClick={installApp}
            className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition animate-pulse"
            title="Download this app to your phone or PC (Works 100% Offline)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>

          {/* Student Profile Switcher Dropdown (Multi-User Database) */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Student Profile / Database Switcher"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[80px] truncate">{currentProfile.name}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-3 animate-fadeIn">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Student Profiles (Isolated Data)
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {profiles.map(p => (
                    <div 
                      key={p.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        currentProfile.id === p.id 
                          ? 'bg-indigo-600 text-white font-bold' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                      onClick={() => {
                        switchProfile(p.id);
                        setShowProfileMenu(false);
                      }}
                    >
                      <span className="truncate">{p.name}</span>
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProfile(p.id);
                          }}
                          className="text-slate-400 hover:text-rose-300 p-0.5 ml-1"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Create Profile Form */}
                <form onSubmit={handleCreateProfile} className="pt-2 border-t border-slate-800 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="New Student Name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                    title="Add Student Profile"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={exportToJson}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
            title="Export full backup (JSON)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
            title="Import backup (JSON)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restore</span>
          </button>
          <button
            onClick={resetAllData}
            className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-900/50 text-xs font-medium transition"
            title="Reset profile data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 py-1 no-scrollbar border-t border-slate-800/60">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

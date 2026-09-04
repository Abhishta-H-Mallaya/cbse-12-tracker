import React, { useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { SubjectId, NavigationTab } from '../types/planner';
import { getSubjectStats } from '../utils/calculations';
import { InstallGuideModal } from './InstallGuideModal';
import { 
  LayoutDashboard,
  QrCode, 
  Calculator, 
  Zap, 
  FlaskConical, 
  Dna,
  BookOpen, 
  Feather, 
  Sparkles, 
  Target, 
  Clock,
  Download, 
  Upload, 
  RotateCcw,
  Flame,
  AlertTriangle,
  Smartphone,
  User,
  Settings,
  X,
  ChevronRight,
  Sparkle,
  ScanLine
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    subjects,
    currentProfile,
    setShowProfileModal,
    mobileMenuOpen,
    setMobileMenuOpen,
    filterOnlyDifficult, 
    setFilterOnlyDifficult,
    filterNeedsRevision, 
    setFilterNeedsRevision,
    exportToJson,
    importFromJson,
    resetAllData,
    installApp,
    isInstallable,
    setShowQrSyncModal,
    setShowQrScannerModal
  } = usePlanner();

  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstallClick = () => {
    if (isInstallable) {
      installApp();
    } else {
      setShowInstallGuide(true);
    }
  };

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

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const subjectItems: { id: SubjectId; label: string; icon: React.ReactNode; code: string; color: string }[] = [
    { id: 'mathematics', label: 'Mathematics', icon: <Calculator className="w-4 h-4 text-indigo-400" />, code: '041', color: 'from-indigo-500 to-purple-500' },
    { id: 'physics', label: 'Physics', icon: <Zap className="w-4 h-4 text-blue-400" />, code: '042', color: 'from-blue-500 to-cyan-500' },
    { id: 'chemistry', label: 'Chemistry', icon: <FlaskConical className="w-4 h-4 text-teal-400" />, code: '043', color: 'from-teal-500 to-emerald-500' },
    { id: 'biology', label: 'Biology', icon: <Dna className="w-4 h-4 text-emerald-400" />, code: '044', color: 'from-emerald-500 to-green-500' },
    { id: 'english_prose', label: 'Flamingo Prose', icon: <BookOpen className="w-4 h-4 text-amber-400" />, code: 'ENG-P', color: 'from-amber-500 to-orange-500' },
    { id: 'english_poetry', label: 'Flamingo Poetry', icon: <Feather className="w-4 h-4 text-purple-400" />, code: 'ENG-Po', color: 'from-purple-500 to-pink-500' },
    { id: 'english_vistas', label: 'Vistas Literature', icon: <Sparkles className="w-4 h-4 text-pink-400" />, code: 'ENG-V', color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* TOP SECTION: App Branding & Profile Card */}
        <div className="p-4 border-b border-slate-800 shrink-0 space-y-3">
          {/* Logo & Close Button (Mobile) */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => handleSelectTab('dashboard')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-lg">
                🎯
              </div>
              <div>
                <h1 className="text-base font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
                  CBSE 12 Tracker
                </h1>
                <span className="text-[10px] font-semibold text-indigo-400 font-mono block">
                  {currentProfile.examYear} Board Prep
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Card (Clickable to change year, goal, student) */}
          <div 
            onClick={() => setShowProfileModal(true)}
            className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition flex items-center justify-between group shadow-inner"
            title="Click to change student, exam year, or end goal"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                {currentProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                    {currentProfile.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    {currentProfile.examYear}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentProfile.fieldGoal}
                </p>
              </div>
            </div>

            <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 shrink-0 ml-1 transition" />
          </div>
        </div>

        {/* MIDDLE SECTION: Navigation Links & Subject Trackers (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {/* Main Overviews */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Overview &amp; Targets
            </span>

            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Main Dashboard</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3 h-3 text-indigo-200" />}
            </button>

            <button
              onClick={() => handleSelectTab('exams')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'exams'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Target Exams Tracker</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('planner')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Pace &amp; Targets Planner</span>
              </div>
              {activeTab === 'planner' && <ChevronRight className="w-3 h-3 text-indigo-200" />}
            </button>
          </div>

          {/* Subject Question Trackers */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Subject Trackers
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {subjectItems.length} Subjects
              </span>
            </div>

            {subjectItems.map((item) => {
              const isActive = activeTab === item.id;
              const subObj = subjects.find(s => s.id === item.id);
              const stats = subObj ? getSubjectStats(subObj) : null;
              const pct = stats?.questionPercent ?? null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex flex-col p-2.5 rounded-xl transition text-left ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500 text-white shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="shrink-0 p-1 rounded-lg bg-slate-800/80">
                        {item.icon}
                      </div>
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800/80 shrink-0 ml-1">
                      {item.code}
                    </span>
                  </div>

                  {/* Progress Mini Bar */}
                  {stats && (
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 w-full">
                      <span>{stats.completedQuestions} solved</span>
                      <span className={pct !== null && pct > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {pct !== null ? `${pct}%` : 'Not started'}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Study Filters */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Quick Question Filters
            </span>

            <button
              onClick={() => setFilterOnlyDifficult(!filterOnlyDifficult)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
                filterOnlyDifficult
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Difficult Questions Only</span>
              </div>
              <span className="text-[10px] font-bold">{filterOnlyDifficult ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setFilterNeedsRevision(!filterNeedsRevision)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
                filterNeedsRevision
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Needs Revision Only</span>
              </div>
              <span className="text-[10px] font-bold">{filterNeedsRevision ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: Mobile Install & Backup Controls */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2 bg-slate-950/60">
          {/* Download Mobile App Button */}
          <button
            onClick={handleInstallClick}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition"
            title="Download this app to your phone (100% Offline)"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install Mobile App</span>
          </button>

          {/* Sync & Scan Controls (Grid of 2) */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setShowQrSyncModal(true)}
              className="py-2 px-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 transition"
              title="Show my QR code to sync with another phone or laptop"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR</span>
            </button>

            <button
              onClick={() => setShowQrScannerModal(true)}
              className="py-2 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/40 transition"
              title="Scan QR with camera or upload a QR screenshot"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          </div>

          {/* Backup, Restore, Reset */}
          <div className="grid grid-cols-3 gap-1.5 text-slate-400 text-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={exportToJson}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 flex items-center justify-center gap-1 hover:text-white transition"
              title="Export JSON backup"
            >
              <Download className="w-3 h-3" />
              <span className="text-[10px]">Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 flex items-center justify-center gap-1 hover:text-white transition"
              title="Restore JSON backup"
            >
              <Upload className="w-3 h-3" />
              <span className="text-[10px]">Restore</span>
            </button>

            <button
              onClick={resetAllData}
              className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 text-rose-300 flex items-center justify-center transition"
              title="Reset data"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Install Guide Modal */}
      <InstallGuideModal 
        isOpen={showInstallGuide} 
        onClose={() => setShowInstallGuide(false)} 
      />
    </>
  );
};

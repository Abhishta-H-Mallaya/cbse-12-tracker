import React from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  Target, 
  User 
} from 'lucide-react';
import { NavigationTab } from '../types/planner';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setMobileMenuOpen, 
    setShowProfileModal 
  } = usePlanner();

  const isSubjectTab = [
    'mathematics', 
    'physics', 
    'chemistry', 
    'biology', 
    'english_prose', 
    'english_poetry', 
    'english_vistas'
  ].includes(activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 lg:hidden shadow-2xl safe-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        {/* 2. Subjects (Opens left drawer for easy subject switching) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            isSubjectTab ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isSubjectTab ? 'bg-indigo-600/20' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Subjects</span>
        </button>

        {/* 3. Target Exams & Countdown */}
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            activeTab === 'exams' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'exams' ? 'bg-indigo-600/20' : ''}`}>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] tracking-tight">Exams</span>
        </button>

        {/* 4. Study Pace Planner */}
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            activeTab === 'planner' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'planner' ? 'bg-indigo-600/20' : ''}`}>
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] tracking-tight">Targets</span>
        </button>

        {/* 5. Student Profile & Settings */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-200 transition"
        >
          <div className="p-1 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};

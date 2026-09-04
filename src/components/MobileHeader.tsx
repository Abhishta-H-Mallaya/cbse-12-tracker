import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { 
  Menu, 
  Search, 
  X, 
  Smartphone,
  User,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BookOpen,
  Feather,
  Sparkles,
  LayoutDashboard,
  Target,
  Clock,
  ScanLine,
  QrCode
} from 'lucide-react';
import { NavigationTab } from '../types/planner';

export const MobileHeader: React.FC = () => {
  const { 
    activeTab, 
    setMobileMenuOpen, 
    searchQuery, 
    setSearchQuery, 
    currentProfile, 
    setShowProfileModal,
    installApp,
    isInstallable,
    setShowQrSyncModal,
    setShowQrScannerModal
  } = usePlanner();

  const [showSearch, setShowSearch] = useState(false);

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" /> };
      case 'exams':
        return { label: 'Target Exams', icon: <Clock className="w-4 h-4 text-amber-400" /> };
      case 'planner':
        return { label: 'Pace & Targets', icon: <Target className="w-4 h-4 text-emerald-400" /> };
      case 'mathematics':
        return { label: 'Mathematics (041)', icon: <Calculator className="w-4 h-4 text-indigo-400" /> };
      case 'physics':
        return { label: 'Physics (042)', icon: <Zap className="w-4 h-4 text-blue-400" /> };
      case 'chemistry':
        return { label: 'Chemistry (043)', icon: <FlaskConical className="w-4 h-4 text-teal-400" /> };
      case 'biology':
        return { label: 'Biology (044)', icon: <Dna className="w-4 h-4 text-emerald-400" /> };
      case 'english_prose':
        return { label: 'Flamingo Prose', icon: <BookOpen className="w-4 h-4 text-amber-400" /> };
      case 'english_poetry':
        return { label: 'Flamingo Poetry', icon: <Feather className="w-4 h-4 text-purple-400" /> };
      case 'english_vistas':
        return { label: 'Vistas Literature', icon: <Sparkles className="w-4 h-4 text-pink-400" /> };
    }
  };

  const currentTab = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md lg:hidden">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Hamburger Menu & Active Screen Title */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition"
            aria-label="Open Left Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 min-w-0">
            {currentTab.icon}
            <h2 className="text-sm font-extrabold text-white truncate">
              {currentTab.label}
            </h2>
          </div>
        </div>

        {/* Right: Search Toggle & Student Profile Avatar */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl border transition ${
              showSearch || searchQuery
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Show QR Code Button */}
          <button
            onClick={() => setShowQrSyncModal(true)}
            className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition"
            aria-label="Show QR Code"
            title="Show My QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Quick QR Scanner Button */}
          <button
            onClick={() => setShowQrScannerModal(true)}
            className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition"
            aria-label="Scan QR Code"
            title="Scan QR Code with Camera"
          >
            <ScanLine className="w-4 h-4" />
          </button>

          {/* Student Profile Quick Trigger */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-1.5 p-1.5 pr-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 transition"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-200 max-w-[60px] truncate">
              {currentProfile.name}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input on Mobile */}
      {showSearch && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/80 animate-fadeIn flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters, exercises, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
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
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="text-xs text-slate-400 hover:text-white p-1"
          >
            Cancel
          </button>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { UserOnboardingModal } from './components/UserOnboardingModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { Dashboard } from './components/Dashboard';
import { ExamCountdownTracker } from './components/ExamCountdownTracker';
import { MathematicsTracker } from './components/MathematicsTracker';
import { PhysicsTracker } from './components/PhysicsTracker';
import { ChemistryTracker } from './components/ChemistryTracker';
import { BiologyTracker } from './components/BiologyTracker';
import { EnglishTracker } from './components/EnglishTracker';
import { StudyPacePlanner } from './components/StudyPacePlanner';
import { SyncReceiverModal } from './components/SyncReceiverModal';
import { QrSyncModal } from './components/QrSyncModal';
import { QrScannerModal } from './components/QrScannerModal';

const MainContent: React.FC = () => {
  const { activeTab } = usePlanner();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fadeIn pb-24 lg:pb-12">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'exams' && <ExamCountdownTracker />}
      {activeTab === 'mathematics' && <MathematicsTracker />}
      {activeTab === 'physics' && <PhysicsTracker />}
      {activeTab === 'chemistry' && <ChemistryTracker />}
      {activeTab === 'biology' && <BiologyTracker />}
      {activeTab === 'english_prose' && <EnglishTracker subjectId="english_prose" />}
      {activeTab === 'english_poetry' && <EnglishTracker subjectId="english_poetry" />}
      {activeTab === 'english_vistas' && <EnglishTracker subjectId="english_vistas" />}
      {activeTab === 'planner' && <StudyPacePlanner />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { 
    currentProfile,
    showQrSyncModal,
    setShowQrSyncModal,
    showQrScannerModal,
    setShowQrScannerModal,
    incomingSyncData,
    setIncomingSyncData
  } = usePlanner();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Permanent Left Sidebar (Desktop) & Slide-in Drawer (Mobile) */}
      <Sidebar />

      {/* 2. Main Application Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header Bar */}
        <MobileHeader />

        {/* Dynamic Main Content based on active navigation tab */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/40 py-5 text-center text-xs text-slate-500 mb-16 lg:mb-0">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Class 12 Detailed Question Tracker • {currentProfile.examYear} Board Batch • {currentProfile.name}
            </span>
            <span className="text-slate-400">
              Installable Mobile App • Offline-First Database
            </span>
          </div>
        </footer>
      </div>

      {/* 3. Mobile Touch Bottom Navigation */}
      <MobileBottomNav />

      {/* 4. Pre-Entry Onboarding Gatekeeper Modal */}
      <UserOnboardingModal />

      {/* 5. Profile & Year Management Modal */}
      <ProfileSettingsModal />

      {/* 6. QR Sync Modal (Show QR Code) */}
      <QrSyncModal 
        isOpen={showQrSyncModal} 
        onClose={() => setShowQrSyncModal(false)} 
        onOpenScanner={() => setShowQrScannerModal(true)}
      />

      {/* 7. QR Scanner Modal (Camera & Image Upload) */}
      <QrScannerModal 
        isOpen={showQrScannerModal} 
        onClose={() => setShowQrScannerModal(false)} 
        onScanSuccess={(delta) => setIncomingSyncData(delta)}
      />

      {/* 8. Incoming Phone/Device Sync Receiver Modal */}
      <SyncReceiverModal 
        externalDelta={incomingSyncData} 
        onClearExternalDelta={() => setIncomingSyncData(null)} 
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PlannerProvider>
      <AppShell />
    </PlannerProvider>
  );
};

export default App;

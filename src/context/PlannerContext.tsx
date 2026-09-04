import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Subject, 
  Chapter, 
  Exercise, 
  QuestionItem, 
  SubjectId, 
  NavigationTab,
  UserProfile,
  QuestionSources, 
  PhysicsDetails, 
  ChemistryDetails, 
  BiologyDetails,
  EnglishProseDetails, 
  EnglishPoemDetails, 
  PlannerPaceConfig, 
  DailyActivityLog,
  ExamTarget
} from '../types/planner';
import { initialSubjects, defaultPaceConfig } from '../data/initialSyllabus';
import { initialExams, getInitialExamsForYear } from '../data/initialExams';
import { CompactSyncDelta } from '../utils/syncHelper';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'profile-user-default',
  name: 'Student',
  examYear: '2027',
  targetExamDate: '2027-02-15',
  fieldGoal: 'CBSE Class 12 Boards (95%+) • JEE Main / Adv',
  fieldGoals: ['CBSE Class 12 Boards (95%+)', 'Engineering (JEE Main / Adv / BITSAT)'],
  stream: 'PCMB',
  selectedSubjects: [
    'mathematics', 
    'physics', 
    'chemistry', 
    'biology', 
    'english_prose', 
    'english_poetry', 
    'english_vistas'
  ],
  createdAt: '2026-09-01T00:00:00.000Z',
};

interface PlannerContextType {
  subjects: Subject[];
  paceConfig: PlannerPaceConfig;
  activityLogs: DailyActivityLog[];
  exams: ExamTarget[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  
  // Student Profile Management (Multi-User Database)
  currentProfile: UserProfile;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  createUserProfile: (data: Omit<UserProfile, 'id' | 'createdAt'>, customExams?: ExamTarget[]) => void;
  updateCurrentProfile: (updates: Partial<UserProfile>) => void;
  deleteProfile: (profileId: string) => void;
  changeExamYear: (newYear: string) => void;

  // Onboarding & Modals UI State
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // QR Sync & Scanner Modals
  showQrSyncModal: boolean;
  setShowQrSyncModal: (show: boolean) => void;
  showQrScannerModal: boolean;
  setShowQrScannerModal: (show: boolean) => void;
  incomingSyncData: CompactSyncDelta | null;
  setIncomingSyncData: (data: CompactSyncDelta | null) => void;

  // PWA Install
  isInstallable: boolean;
  installApp: () => void;

  // Exam Targets
  addExam: (exam: Omit<ExamTarget, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamTarget>) => void;
  deleteExam: (id: string) => void;
  toggleExamEnabled: (id: string) => void;

  // Updates
  updateChapter: (subjectId: SubjectId, chapterId: string, updates: Partial<Chapter>) => void;
  updateExercise: (subjectId: SubjectId, chapterId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  addExercise: (subjectId: SubjectId, chapterId: string, name: string, totalQuestions: number | null) => void;
  deleteExercise: (subjectId: SubjectId, chapterId: string, exerciseId: string) => void;
  updateQuestionItem: (subjectId: SubjectId, chapterId: string, exerciseId: string, questionId: string, updates: Partial<QuestionItem>) => void;
  addQuestionItem: (subjectId: SubjectId, chapterId: string, exerciseId: string, questionNumber: string) => void;
  updateQuestionSources: (subjectId: SubjectId, chapterId: string, sources: Partial<QuestionSources>) => void;
  updatePhysicsDetails: (chapterId: string, updates: Partial<PhysicsDetails>) => void;
  updateChemistryDetails: (chapterId: string, updates: Partial<ChemistryDetails>) => void;
  updateBiologyDetails: (chapterId: string, updates: Partial<BiologyDetails>) => void;
  updateEnglishProseDetails: (subjectId: SubjectId, chapterId: string, updates: Partial<EnglishProseDetails>) => void;
  updateEnglishPoemDetails: (chapterId: string, updates: Partial<EnglishPoemDetails>) => void;
  updatePaceConfig: (updates: Partial<PlannerPaceConfig>) => void;
  logActivity: (questions: number, examples?: number, exercises?: number) => void;
  
  // Backup & Restore
  exportToJson: () => void;
  importFromJson: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterOnlyDifficult: boolean;
  setFilterOnlyDifficult: (val: boolean) => void;
  filterNeedsRevision: boolean;
  setFilterNeedsRevision: (val: boolean) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-user profile management
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const savedV2 = localStorage.getItem('cbse12_user_profiles_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate from old string list if exists
      const oldList = localStorage.getItem('cbse12_profiles_list');
      if (oldList) {
        const parsedOld = JSON.parse(oldList);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          return parsedOld.map((name: string, idx: number) => ({
            ...DEFAULT_USER_PROFILE,
            id: `profile-${name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user'}-${idx}`,
            name,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_USER_PROFILE];
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return localStorage.getItem('cbse12_current_profile_id') || profiles[0]?.id || DEFAULT_USER_PROFILE.id;
  });

  const currentProfile: UserProfile = profiles.find(p => p.id === currentProfileId) || profiles[0] || DEFAULT_USER_PROFILE;

  // Onboarding & navigation UI states
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => {
    const onboarded = localStorage.getItem('cbse12_onboarded');
    return !onboarded;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQrSyncModal, setShowQrSyncModal] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [incomingSyncData, setIncomingSyncData] = useState<CompactSyncDelta | null>(null);

  const getStorageKey = (key: string) => `cbse12_${currentProfile.id}_${key}`;

  // 1. Load subjects from LocalStorage or default
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey('subjects'));
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasBio = parsed.some((s: Subject) => s.id === 'biology');
        if (!hasBio) {
          const bioSubject = initialSubjects.find(s => s.id === 'biology');
          if (bioSubject) parsed.push(bioSubject);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved subjects', e);
    }
    return initialSubjects;
  });

  // 2. Load pace config
  const [paceConfig, setPaceConfig] = useState<PlannerPaceConfig>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey('config'));
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading pace config', e);
    }
    return {
      ...defaultPaceConfig,
      targetDate: currentProfile.targetExamDate || `${currentProfile.examYear}-02-15`,
    };
  });

  // 3. Load activity logs
  const [activityLogs, setActivityLogs] = useState<DailyActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey('logs'));
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading activity logs', e);
    }
    return [];
  });

  // 4. Load exams
  const [exams, setExams] = useState<ExamTarget[]>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey('exams'));
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading exams', e);
    }
    return getInitialExamsForYear(currentProfile.examYear || '2027');
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyDifficult, setFilterOnlyDifficult] = useState(false);
  const [filterNeedsRevision, setFilterNeedsRevision] = useState(false);

  // PWA Install prompt hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert('To install this app on your mobile home screen:\n\n• iOS Safari: Tap Share ➔ Add to Home Screen\n• Android Chrome: Tap Menu (⋮) ➔ Install App or Add to Home screen');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Sync state to current profile's local database
  useEffect(() => {
    try {
      localStorage.setItem('cbse12_user_profiles_v2', JSON.stringify(profiles));
      localStorage.setItem('cbse12_current_profile_id', currentProfile.id);
      localStorage.setItem(getStorageKey('subjects'), JSON.stringify(subjects));
      localStorage.setItem(getStorageKey('config'), JSON.stringify(paceConfig));
      localStorage.setItem(getStorageKey('logs'), JSON.stringify(activityLogs));
      localStorage.setItem(getStorageKey('exams'), JSON.stringify(exams));
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }, [profiles, currentProfile, subjects, paceConfig, activityLogs, exams]);

  // Switch profile
  const switchProfile = (profileId: string) => {
    const targetProfile = profiles.find(p => p.id === profileId);
    if (!targetProfile) return;

    setCurrentProfileId(profileId);
    const key = `cbse12_${profileId}_`;
    try {
      const savedSub = localStorage.getItem(`${key}subjects`);
      setSubjects(savedSub ? JSON.parse(savedSub) : initialSubjects);

      const savedCfg = localStorage.getItem(`${key}config`);
      setPaceConfig(savedCfg ? JSON.parse(savedCfg) : {
        ...defaultPaceConfig,
        targetDate: targetProfile.targetExamDate || `${targetProfile.examYear}-02-15`,
      });

      const savedLogs = localStorage.getItem(`${key}logs`);
      setActivityLogs(savedLogs ? JSON.parse(savedLogs) : []);

      const savedExams = localStorage.getItem(`${key}exams`);
      setExams(savedExams ? JSON.parse(savedExams) : getInitialExamsForYear(targetProfile.examYear));
    } catch (e) {
      console.error(e);
    }
  };

  // Create new student profile (with custom exams and fields)
  const createUserProfile = (data: Omit<UserProfile, 'id' | 'createdAt'>, customExams?: ExamTarget[]) => {
    const newId = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: UserProfile = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('cbse12_user_profiles_v2', JSON.stringify(updatedProfiles));
    localStorage.setItem('cbse12_onboarded', 'true');

    // Initial exams for the new profile
    const baseExams = getInitialExamsForYear(data.examYear);
    const allExams = customExams && customExams.length > 0 ? [...baseExams, ...customExams] : baseExams;

    // Save initial storage for this new profile
    const key = `cbse12_${newId}_`;
    try {
      localStorage.setItem(`${key}subjects`, JSON.stringify(initialSubjects));
      localStorage.setItem(`${key}config`, JSON.stringify({
        ...defaultPaceConfig,
        targetDate: data.targetExamDate || `${data.examYear}-02-15`,
      }));
      localStorage.setItem(`${key}logs`, JSON.stringify([]));
      localStorage.setItem(`${key}exams`, JSON.stringify(allExams));
    } catch (e) {
      console.error(e);
    }

    // Switch to this new profile
    setCurrentProfileId(newId);
    setSubjects(initialSubjects);
    setPaceConfig({
      ...defaultPaceConfig,
      targetDate: data.targetExamDate || `${data.examYear}-02-15`,
    });
    setActivityLogs([]);
    setExams(allExams);
    setShowOnboardingModal(false);
  };

  // Update current profile
  const updateCurrentProfile = (updates: Partial<UserProfile>) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id !== currentProfile.id) return p;
        return { ...p, ...updates };
      })
    );
  };

  // Change exam year dynamically
  const changeExamYear = (newYear: string) => {
    const updatedTargetDate = `${newYear}-02-15`;
    updateCurrentProfile({
      examYear: newYear,
      targetExamDate: updatedTargetDate,
    });
    updatePaceConfig({
      targetDate: updatedTargetDate,
    });
    // Update existing default exams to reflect new year
    const defaults = getInitialExamsForYear(newYear);
    setExams(prev =>
      prev.map(ex => {
        const matched = defaults.find(d => d.id === ex.id);
        if (matched) {
          return {
            ...ex,
            name: matched.name,
            examDate: matched.examDate,
          };
        }
        return ex;
      })
    );
  };

  // Delete profile
  const deleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last remaining student profile. Please create another profile first.');
      return;
    }
    const toDelete = profiles.find(p => p.id === profileId);
    if (window.confirm(`Delete profile "${toDelete?.name}" and all associated study progress?`)) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setProfiles(remaining);
      const nextProfile = remaining[0];
      switchProfile(nextProfile.id);
    }
  };

  // Exam Target Handlers
  const addExam = (examData: Omit<ExamTarget, 'id'>) => {
    const newExam: ExamTarget = {
      ...examData,
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setExams(prev => [...prev, newExam]);
  };

  const updateExam = (id: string, updates: Partial<ExamTarget>) => {
    setExams(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(ex => ex.id !== id));
  };

  const toggleExamEnabled = (id: string) => {
    setExams(prev => prev.map(ex => ex.id === id ? { ...ex, enabled: !ex.enabled } : ex));
  };

  // Log activity helper
  const logActivity = (questions: number, examples = 0, exercises = 0) => {
    const today = new Date().toISOString().split('T')[0];
    setActivityLogs(prev => {
      const existingIdx = prev.findIndex(item => item.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          questionsSolved: Math.max(0, updated[existingIdx].questionsSolved + questions),
          examplesSolved: Math.max(0, updated[existingIdx].examplesSolved + examples),
          exercisesCompleted: Math.max(0, updated[existingIdx].exercisesCompleted + exercises),
        };
        return updated;
      } else {
        return [...prev, { date: today, questionsSolved: questions, examplesSolved: examples, exercisesCompleted: exercises }];
      }
    });
  };

  // Update chapter helper
  const updateChapter = (subjectId: SubjectId, chapterId: string, updates: Partial<Chapter>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return { ...ch, ...updates };
            }),
          })),
        };
      })
    );
  };

  // Update exercise
  const updateExercise = (subjectId: SubjectId, chapterId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                exercises: ch.exercises.map(ex => {
                  if (ex.id !== exerciseId) return ex;
                  const prevCompleted = ex.completedQuestions;
                  const updatedEx = { ...ex, ...updates };
                  
                  if (updates.completedQuestions !== undefined && updates.completedQuestions !== prevCompleted) {
                    const diff = updates.completedQuestions - prevCompleted;
                    if (diff !== 0) logActivity(diff);
                  }
                  return updatedEx;
                }),
              };
            }),
          })),
        };
      })
    );
  };

  // Add exercise
  const addExercise = (subjectId: SubjectId, chapterId: string, name: string, totalQuestions: number | null) => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      totalQuestions,
      completedQuestions: 0,
      difficultQuestions: 0,
      reworkQuestions: 0,
      questions: totalQuestions && totalQuestions <= 50 ? Array.from({ length: totalQuestions }, (_, i) => ({
        id: `q-${Date.now()}-${i + 1}`,
        questionNumber: `Q${i + 1}`,
        status: 'Not Started',
        difficulty: 'Medium',
        attemptCount: 0,
        needsRevision: false,
      })) : [],
    };

    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                exercises: [...ch.exercises, newEx],
              };
            }),
          })),
        };
      })
    );
  };

  // Delete exercise
  const deleteExercise = (subjectId: SubjectId, chapterId: string, exerciseId: string) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                exercises: ch.exercises.filter(ex => ex.id !== exerciseId),
              };
            }),
          })),
        };
      })
    );
  };

  // Update question item
  const updateQuestionItem = (
    subjectId: SubjectId, 
    chapterId: string, 
    exerciseId: string, 
    questionId: string, 
    updates: Partial<QuestionItem>
  ) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                exercises: ch.exercises.map(ex => {
                  if (ex.id !== exerciseId) return ex;
                  const updatedQuestions = ex.questions.map(q => {
                    if (q.id !== questionId) return q;
                    return { ...q, ...updates };
                  });

                  const completed = updatedQuestions.filter(q => q.status === 'Solved' || q.status === 'Correct').length;
                  const difficult = updatedQuestions.filter(q => q.difficulty === 'Hard').length;
                  const rework = updatedQuestions.filter(q => q.needsRevision || q.status === 'Incorrect').length;

                  const oldQ = ex.questions.find(q => q.id === questionId);
                  if (updates.status && (updates.status === 'Solved' || updates.status === 'Correct') && 
                      oldQ && oldQ.status !== 'Solved' && oldQ.status !== 'Correct') {
                    logActivity(1);
                  }

                  return {
                    ...ex,
                    questions: updatedQuestions,
                    completedQuestions: completed > 0 ? completed : ex.completedQuestions,
                    difficultQuestions: difficult,
                    reworkQuestions: rework,
                  };
                }),
              };
            }),
          })),
        };
      })
    );
  };

  // Add question item
  const addQuestionItem = (subjectId: SubjectId, chapterId: string, exerciseId: string, questionNumber: string) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                exercises: ch.exercises.map(ex => {
                  if (ex.id !== exerciseId) return ex;
                  const newQ: QuestionItem = {
                    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    questionNumber,
                    status: 'Not Started',
                    difficulty: 'Medium',
                    attemptCount: 0,
                    needsRevision: false,
                  };
                  const updatedQuestions = [...ex.questions, newQ];
                  return {
                    ...ex,
                    totalQuestions: (ex.totalQuestions ?? 0) + 1,
                    questions: updatedQuestions,
                  };
                }),
              };
            }),
          })),
        };
      })
    );
  };

  // Update question sources
  const updateQuestionSources = (subjectId: SubjectId, chapterId: string, sources: Partial<QuestionSources>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                questionSources: {
                  ...ch.questionSources,
                  ...sources,
                },
              };
            }),
          })),
        };
      })
    );
  };

  // Update Physics details
  const updatePhysicsDetails = (chapterId: string, updates: Partial<PhysicsDetails>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== 'physics') return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                physicsDetails: ch.physicsDetails ? { ...ch.physicsDetails, ...updates } : undefined,
              };
            }),
          })),
        };
      })
    );
  };

  // Update Chemistry details
  const updateChemistryDetails = (chapterId: string, updates: Partial<ChemistryDetails>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== 'chemistry') return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                chemistryDetails: ch.chemistryDetails ? { ...ch.chemistryDetails, ...updates } : undefined,
              };
            }),
          })),
        };
      })
    );
  };

  // Update Biology details
  const updateBiologyDetails = (chapterId: string, updates: Partial<BiologyDetails>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== 'biology') return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                biologyDetails: ch.biologyDetails ? { ...ch.biologyDetails, ...updates } : undefined,
              };
            }),
          })),
        };
      })
    );
  };

  // Update English Prose details
  const updateEnglishProseDetails = (subjectId: SubjectId, chapterId: string, updates: Partial<EnglishProseDetails>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                englishProseDetails: ch.englishProseDetails ? { ...ch.englishProseDetails, ...updates } : undefined,
              };
            }),
          })),
        };
      })
    );
  };

  // Update English Poem details
  const updateEnglishPoemDetails = (chapterId: string, updates: Partial<EnglishPoemDetails>) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id !== 'english_poetry') return sub;
        return {
          ...sub,
          units: sub.units.map(unit => ({
            ...unit,
            chapters: unit.chapters.map(ch => {
              if (ch.id !== chapterId) return ch;
              return {
                ...ch,
                englishPoemDetails: ch.englishPoemDetails ? { ...ch.englishPoemDetails, ...updates } : undefined,
              };
            }),
          })),
        };
      })
    );
  };

  // Update pace configuration
  const updatePaceConfig = (updates: Partial<PlannerPaceConfig>) => {
    setPaceConfig(prev => ({ ...prev, ...updates }));
  };

  // Export data as JSON file
  const exportToJson = () => {
    const data = {
      version: '1.2',
      studentProfile: currentProfile,
      exportDate: new Date().toISOString(),
      subjects,
      paceConfig,
      activityLogs,
      exams,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cbse12_${currentProfile.name.replace(/\s+/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON
  const importFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.subjects && Array.isArray(parsed.subjects)) {
        setSubjects(parsed.subjects);
        if (parsed.paceConfig) setPaceConfig(parsed.paceConfig);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.exams) setExams(parsed.exams);
        if (parsed.studentProfile) {
          const profName = typeof parsed.studentProfile === 'string' ? parsed.studentProfile : parsed.studentProfile.name;
          const exists = profiles.some(p => p.name === profName);
          if (!exists) {
            const importedProfile: UserProfile = typeof parsed.studentProfile === 'object' && parsed.studentProfile.id
              ? parsed.studentProfile
              : {
                  ...DEFAULT_USER_PROFILE,
                  id: `profile-${Date.now()}`,
                  name: profName,
                };
            setProfiles(prev => [...prev, importedProfile]);
            setCurrentProfileId(importedProfile.id);
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import parse error', e);
      return false;
    }
  };

  // Reset to default
  const resetAllData = () => {
    if (window.confirm(`Reset "${currentProfile.name}" study records back to default syllabus?`)) {
      setSubjects(initialSubjects);
      setPaceConfig({
        ...defaultPaceConfig,
        targetDate: currentProfile.targetExamDate || `${currentProfile.examYear}-02-15`,
      });
      setActivityLogs([]);
      setExams(getInitialExamsForYear(currentProfile.examYear));
      localStorage.removeItem(getStorageKey('subjects'));
      localStorage.removeItem(getStorageKey('config'));
      localStorage.removeItem(getStorageKey('logs'));
      localStorage.removeItem(getStorageKey('exams'));
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        subjects,
        paceConfig,
        activityLogs,
        exams,
        activeTab,
        setActiveTab,
        selectedChapterId,
        setSelectedChapterId,
        currentProfile,
        profiles,
        switchProfile,
        createUserProfile,
        updateCurrentProfile,
        deleteProfile,
        changeExamYear,
        showOnboardingModal,
        setShowOnboardingModal,
        showProfileModal,
        setShowProfileModal,
        mobileMenuOpen,
        setMobileMenuOpen,
        showQrSyncModal,
        setShowQrSyncModal,
        showQrScannerModal,
        setShowQrScannerModal,
        incomingSyncData,
        setIncomingSyncData,
        isInstallable,
        installApp,
        addExam,
        updateExam,
        deleteExam,
        toggleExamEnabled,
        updateChapter,
        updateExercise,
        addExercise,
        deleteExercise,
        updateQuestionItem,
        addQuestionItem,
        updateQuestionSources,
        updatePhysicsDetails,
        updateChemistryDetails,
        updateBiologyDetails,
        updateEnglishProseDetails,
        updateEnglishPoemDetails,
        updatePaceConfig,
        logActivity,
        exportToJson,
        importFromJson,
        resetAllData,
        searchQuery,
        setSearchQuery,
        filterOnlyDifficult,
        setFilterOnlyDifficult,
        filterNeedsRevision,
        setFilterNeedsRevision,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};

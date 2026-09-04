export type SubjectId = 
  | 'mathematics' 
  | 'physics' 
  | 'chemistry' 
  | 'biology'
  | 'english_prose' 
  | 'english_poetry' 
  | 'english_vistas';

export type NavigationTab = 
  | SubjectId 
  | 'dashboard' 
  | 'planner' 
  | 'exams';

export interface UserProfile {
  id: string;
  name: string;
  examYear: string; // e.g. "2026", "2027", "2028"
  targetExamDate: string; // YYYY-MM-DD
  fieldGoal: string; // Combined summary string of goals
  fieldGoals: string[]; // Multiple selected goals e.g. ['CBSE Class 12 Boards (95%+)', 'JEE Main & Adv', 'NEET UG']
  stream: 'PCM' | 'PCB' | 'PCMB' | 'Custom';
  selectedSubjects: SubjectId[];
  createdAt: string;
}

export type QuestionStatus = 'Not Started' | 'Attempted' | 'Solved' | 'Correct' | 'Incorrect';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ChemistryCategory = 'Physical' | 'Inorganic' | 'Organic';

export interface ExamTarget {
  id: string;
  name: string; // e.g. "CBSE Board Exams 2027", "JEE Main Session 1", "NEET UG 2027", "CUET UG", "School Pre-Board 1"
  category: 'Board' | 'Competitive' | 'School' | 'Other';
  examDate: string; // YYYY-MM-DD
  targetScoreOrRank?: string; // e.g. "95%+", "99.5 %ile", "680/720"
  registered: boolean;
  notes?: string;
  enabled: boolean;
}

export interface QuestionItem {
  id: string;
  questionNumber: string; // e.g. "Q1", "Q2", "Q14(ii)"
  status: QuestionStatus;
  difficulty: DifficultyLevel;
  attemptCount: number;
  dateAttempted?: string;
  needsRevision: boolean;
  personalNote?: string;
}

export interface Exercise {
  id: string;
  name: string; // e.g. "Exercise 1.1", "Miscellaneous Exercise"
  totalQuestions: number | null; // null represents "Not entered"
  completedQuestions: number;
  difficultQuestions: number;
  reworkQuestions: number;
  plannedCompletionDate?: string;
  actualCompletionDate?: string;
  notes?: string;
  questions: QuestionItem[];
}

export interface QuestionSourceItem {
  total: number | null; // null = "Not entered"
  completed: number;
}

export interface QuestionSources {
  textbook: QuestionSourceItem;
  examples: QuestionSourceItem;
  tuition: QuestionSourceItem;
  guide: QuestionSourceItem;
  pyqs: QuestionSourceItem;
  samplePapers: QuestionSourceItem;
  mockTests: QuestionSourceItem;
}

export interface PhysicsDetails {
  numericalQuestions: QuestionSourceItem;
  conceptualQuestions: QuestionSourceItem;
  derivationQuestions: QuestionSourceItem;
  difficultCount: number;
  revisionRequiredCount: number;
  pyqsCompleted: number;
  guideCompleted: number;
  tuitionCompleted: number;
}

export interface ChemistryDetails {
  category: ChemistryCategory;
  numericalProblems: QuestionSourceItem;
  reactionBasedQuestions: QuestionSourceItem;
  theoryConceptQuestions: QuestionSourceItem;
  memorisationQuestions: QuestionSourceItem;
  difficultCount: number;
  revisionRequiredCount: number;
}

export interface BiologyDetails {
  diagrams: QuestionSourceItem; // Scientific Diagrams practice
  terminology: QuestionSourceItem; // Key definitions, scientific terms & glossary
  caseBasedAssertion: QuestionSourceItem; // Case study & Assertion-Reason questions
  difficultCount: number;
  revisionRequiredCount: number;
  pyqsCompleted: number;
  guideCompleted: number;
  tuitionCompleted: number;
}

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
}

export interface EnglishProseDetails {
  firstReading: boolean;
  secondReading: boolean;
  storyUnderstood: 'Not Started' | 'Partially' | 'Fully';
  charactersStudied: string;
  themesStudied: string;
  importantEvents: string;
  messageTheme: string;
  difficultWords: VocabWord[];
  importantPhrases: string[];
  importantLines: string[];
  textbookQuestions: QuestionSourceItem;
  tuitionQuestions: QuestionSourceItem;
  guideQuestions: QuestionSourceItem;
  pyqs: QuestionSourceItem;
  revisionCount: number;
}

export interface EnglishPoemDetails {
  poemReading: boolean;
  stanzaMeanings: string;
  centralIdea: string;
  themes: string;
  poeticDevices: string;
  importantLines: string[];
  importantQuestions: string[];
  textbookQuestions: QuestionSourceItem;
  pyqs: QuestionSourceItem;
  ownInterpretation: string;
  revisionCount: number;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  unitId: string;
  unitName: string;
  chapterNumber: number;
  name: string;
  keyTopics: string;
  marks: number | null; // official syllabus marks
  pages: number | null; // textbook pages, null = "Not entered"
  workedExamplesCount: number | null; // null = "Not entered"
  workedExamplesCompleted: number;
  difficulty: DifficultyLevel;
  priority: PriorityLevel;
  plannedCompletionDate?: string;
  actualCompletionDate?: string;
  personalNotes?: string;
  resourceLink?: string;
  syllabusCovered: boolean;
  revisionCount: number;
  
  // Exercises (used across subjects)
  exercises: Exercise[];

  // 7-Source Breakdown
  questionSources: QuestionSources;

  // Subject-specific fields
  physicsDetails?: PhysicsDetails;
  chemistryDetails?: ChemistryDetails;
  biologyDetails?: BiologyDetails;
  englishProseDetails?: EnglishProseDetails;
  englishPoemDetails?: EnglishPoemDetails;
}

export interface Unit {
  id: string;
  subjectId: SubjectId;
  unitNumber: string; // e.g. "Unit I", "Unit II"
  name: string;
  marks: number | null;
  chapters: Chapter[];
}

export interface Subject {
  id: SubjectId;
  name: string;
  displayName: string;
  code: string;
  totalMarks: number;
  units: Unit[];
}

export interface DailyActivityLog {
  date: string; // YYYY-MM-DD
  questionsSolved: number;
  examplesSolved: number;
  exercisesCompleted: number;
}

export interface PlannerPaceConfig {
  targetDate: string; // YYYY-MM-DD
  manualDailyQuestionTarget: number | null; // null means auto-calculated
  manualWeeklyExerciseTarget: number | null;
  manualWeeklyChapterTarget: number | null;
  manualDailyExampleTarget: number | null;
  manualWeeklyPYQTarget: number | null;
  enableWeightedOverallProgress: boolean; // default false as per Rule 8
}

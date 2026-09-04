import { ExamTarget } from '../types/planner';

export const getInitialExamsForYear = (examYear: string): ExamTarget[] => {
  const y = parseInt(examYear, 10) || 2027;
  const prevY = y - 1;

  return [
    {
      id: 'exam-cbse-boards',
      name: `CBSE Class 12 Board Exams ${y} (Theory)`,
      category: 'Board',
      examDate: `${y}-02-15`,
      targetScoreOrRank: '95%+ Overall',
      registered: true,
      enabled: true,
      notes: 'Main board examinations for all subjects (PCM/PCB/English)',
    },
    {
      id: 'exam-cbse-practicals',
      name: `CBSE Class 12 Practical Exams ${y}`,
      category: 'Board',
      examDate: `${y}-01-01`,
      targetScoreOrRank: '30/30 in each subject',
      registered: true,
      enabled: true,
      notes: 'Internal & external practical examinations and viva-voce',
    },
    {
      id: 'exam-preboard-1',
      name: `School Pre-Board 1 Exams (${prevY})`,
      category: 'School',
      examDate: `${prevY}-12-05`,
      targetScoreOrRank: '90%+',
      registered: true,
      enabled: true,
      notes: 'First comprehensive full-syllabus school rehearsal',
    },
    {
      id: 'exam-preboard-2',
      name: `School Pre-Board 2 Exams (${y})`,
      category: 'School',
      examDate: `${y}-01-10`,
      targetScoreOrRank: '95%+',
      registered: true,
      enabled: true,
      notes: 'Final pre-board simulation before board practicals',
    },
    {
      id: 'exam-jee-session-1',
      name: `JEE Main ${y} (Session 1)`,
      category: 'Competitive',
      examDate: `${y}-01-22`,
      targetScoreOrRank: '99+ Percentile',
      registered: false,
      enabled: true,
      notes: 'National Testing Agency (NTA) January engineering attempt',
    },
    {
      id: 'exam-jee-session-2',
      name: `JEE Main ${y} (Session 2)`,
      category: 'Competitive',
      examDate: `${y}-04-06`,
      targetScoreOrRank: '99.5+ Percentile',
      registered: false,
      enabled: true,
      notes: 'April engineering attempt for score improvement',
    },
    {
      id: 'exam-neet-ug',
      name: `NEET UG ${y}`,
      category: 'Competitive',
      examDate: `${y}-05-02`,
      targetScoreOrRank: '680+ / 720 (AIIMS / Top GMC)',
      registered: false,
      enabled: true,
      notes: 'Medical entrance exam (Physics, Chemistry, Biology)',
    },
    {
      id: 'exam-cuet-ug',
      name: `CUET UG ${y}`,
      category: 'Competitive',
      examDate: `${y}-05-18`,
      targetScoreOrRank: '100 Percentile',
      registered: false,
      enabled: true,
      notes: 'Central Universities Common Entrance Test',
    },
    {
      id: 'exam-bitsat',
      name: `BITSAT ${y} (Session 1)`,
      category: 'Competitive',
      examDate: `${y}-05-22`,
      targetScoreOrRank: '320+ / 390 (Pilani Campus)',
      registered: false,
      enabled: false,
      notes: 'Birla Institute of Technology and Science Admission Test',
    },
  ];
};

export const initialExams: ExamTarget[] = getInitialExamsForYear('2027');

